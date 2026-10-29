/**
 * PostgreSQL Database Client for Velontri Chatbot
 * Compatible with Supabase
 * 
 * Environment Variables Required:
 * - SUPABASE_URL or DATABASE_URL
 * - SUPABASE_SERVICE_KEY or DATABASE_PASSWORD
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
let supabase;

function initDatabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase credentials not found. Using in-memory fallback.');
    console.warn('   Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env file');
    return null;
  }
  
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        fetch: (...args) => {
          // Add timeout to prevent hanging
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          return fetch(...args, { signal: controller.signal })
            .finally(() => clearTimeout(timeout))
            .catch(err => {
              console.warn('⚠️  Supabase connection failed. Using in-memory fallback.');
              supabase = null; // Disable supabase on connection failure
              throw err;
            });
        }
      }
    });
    
    console.log('✅ Supabase client initialized (attempting connection...)');
    return supabase;
  } catch (err) {
    console.warn('⚠️  Supabase init failed:', err.message);
    console.warn('   Using in-memory fallback.');
    return null;
  }
}

// ============================================================
// SESSION MANAGEMENT
// ============================================================

async function getOrCreateSession(sessionId, metadata = {}) {
  if (!supabase) return { session_id: sessionId };
  
  try {
    // Check if session exists
    const { data: existing, error: fetchError } = await supabase
      .from('sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();
    
    if (existing && !fetchError) {
      // Update last_active_at
      await supabase
        .from('sessions')
        .update({ last_active_at: new Date().toISOString() })
        .eq('session_id', sessionId);
      
      return existing;
    }
    
    // Create new session
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        session_id: sessionId,
        user_fingerprint: metadata.fingerprint,
        user_agent: metadata.userAgent,
        ip_address: metadata.ipAddress,
        metadata: metadata
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Session creation error:', err.message);
    return { session_id: sessionId };
  }
}

// ============================================================
// CONVERSATION MANAGEMENT
// ============================================================

async function createConversation(sessionId, firstMessage = null) {
  if (!supabase) return crypto.randomUUID();
  
  try {
    // Generate title from first message
    let title = 'New conversation';
    if (firstMessage) {
      title = firstMessage.substring(0, 50);
      if (firstMessage.length > 50) title += '...';
    }
    
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        session_id: sessionId,
        title: title
      })
      .select()
      .single();
    
    if (error) throw error;
    return data.conversation_id;
  } catch (err) {
    console.error('Conversation creation error:', err.message);
    return crypto.randomUUID();
  }
}

async function getConversation(conversationId) {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('conversation_id', conversationId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Get conversation error:', err.message);
    return null;
  }
}

async function listConversations(sessionId, limit = 50) {
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('session_id', sessionId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('List conversations error:', err.message);
    return [];
  }
}

async function deleteConversation(conversationId) {
  if (!supabase) return true;
  
  try {
    // Soft delete
    const { error } = await supabase
      .from('conversations')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString()
      })
      .eq('conversation_id', conversationId);
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Delete conversation error:', err.message);
    return false;
  }
}

async function setConversationTitle(conversationId, title) {
  if (!supabase) return true;
  
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ title: title })
      .eq('conversation_id', conversationId);
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Set conversation title error:', err.message);
    return false;
  }
}

async function setConversationSummary(conversationId, summary) {
  if (!supabase) return true;
  
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ summary: summary })
      .eq('conversation_id', conversationId);
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Set conversation summary error:', err.message);
    return false;
  }
}

// ============================================================
// MESSAGE MANAGEMENT
// ============================================================

async function addMessage(conversationId, role, content, metadata = {}) {
  if (!supabase) return { message_id: crypto.randomUUID() };
  
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: role,
        content: content,
        intent: metadata.intent,
        query_filters: metadata.filters,
        listings_shown: metadata.listings,
        response_time_ms: metadata.responseTime,
        token_count: metadata.tokenCount,
        metadata: metadata
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Add message error:', err.message);
    return { message_id: crypto.randomUUID(), role, content };
  }
}

async function getMessages(conversationId, limit = 100) {
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Get messages error:', err.message);
    return [];
  }
}

async function getRecentMessages(conversationId, limit = 20) {
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    // Reverse to get chronological order
    return (data || []).reverse();
  } catch (err) {
    console.error('Get recent messages error:', err.message);
    return [];
  }
}

async function getMessageCount(conversationId) {
  if (!supabase) return 0;
  
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId);
    
    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('Get message count error:', err.message);
    return 0;
  }
}

// ============================================================
// MEMORY MANAGEMENT
// ============================================================

async function addMemory(sessionId, type, content, sourceMessageId = null) {
  if (!supabase) return { memory_id: crypto.randomUUID() };
  
  try {
    // Deactivate existing memory of same type
    await supabase
      .from('memories')
      .update({ is_active: false })
      .eq('session_id', sessionId)
      .eq('memory_type', type)
      .eq('is_active', true);
    
    // Create new memory
    const { data, error } = await supabase
      .from('memories')
      .insert({
        session_id: sessionId,
        memory_type: type,
        content: content,
        source_message_id: sourceMessageId,
        confidence: 1.0,
        is_active: true
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Add memory error:', err.message);
    return { memory_id: crypto.randomUUID(), memory_type: type, content };
  }
}

async function getMemories(sessionId) {
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('session_id', sessionId)
      .eq('is_active', true)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Get memories error:', err.message);
    return [];
  }
}

async function updateMemory(memoryId, updates) {
  if (!supabase) return true;
  
  try {
    const { error } = await supabase
      .from('memories')
      .update(updates)
      .eq('memory_id', memoryId);
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Update memory error:', err.message);
    return false;
  }
}

async function deleteMemory(memoryId) {
  if (!supabase) return true;
  
  try {
    const { error } = await supabase
      .from('memories')
      .update({ is_active: false })
      .eq('memory_id', memoryId);
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Delete memory error:', err.message);
    return false;
  }
}

async function clearAllMemories(sessionId) {
  if (!supabase) return true;
  
  try {
    const { error } = await supabase
      .from('memories')
      .update({ is_active: false })
      .eq('session_id', sessionId)
      .eq('is_active', true);
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Clear memories error:', err.message);
    return false;
  }
}

// ============================================================
// SEARCH HISTORY & ANALYTICS
// ============================================================

async function logSearch(sessionId, conversationId, query, filters, resultsCount) {
  if (!supabase) return;
  
  try {
    await supabase
      .from('search_history')
      .insert({
        session_id: sessionId,
        conversation_id: conversationId,
        query: query,
        category: filters?.category,
        filters: filters,
        results_count: resultsCount
      });
  } catch (err) {
    console.error('Log search error:', err.message);
  }
}

async function getPopularSearches(limit = 20) {
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('search_history')
      .select('query, category')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(limit);
    
    if (error) throw error;
    
    // Group and count
    const grouped = {};
    data.forEach(row => {
      const key = row.query;
      grouped[key] = (grouped[key] || 0) + 1;
    });
    
    return Object.entries(grouped)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  } catch (err) {
    console.error('Get popular searches error:', err.message);
    return [];
  }
}

// ============================================================
// FEEDBACK
// ============================================================

async function addFeedback(sessionId, conversationId, messageId, rating, type, comment) {
  if (!supabase) return;
  
  try {
    await supabase
      .from('feedback')
      .insert({
        session_id: sessionId,
        conversation_id: conversationId,
        message_id: messageId,
        rating: rating,
        feedback_type: type,
        comment: comment
      });
    return true;
  } catch (err) {
    console.error('Add feedback error:', err.message);
    return false;
  }
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  initDatabase,
  
  // Sessions
  getOrCreateSession,
  
  // Conversations
  createConversation,
  getConversation,
  listConversations,
  deleteConversation,
  setConversationTitle,
  setConversationSummary,
  
  // Messages
  addMessage,
  getMessages,
  getRecentMessages,
  getMessageCount,
  
  // Memories
  addMemory,
  getMemories,
  updateMemory,
  deleteMemory,
  clearAllMemories,
  
  // Analytics
  logSearch,
  getPopularSearches,
  
  // Feedback
  addFeedback
};

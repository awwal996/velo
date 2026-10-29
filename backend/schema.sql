-- ============================================================
-- VELONTRI CHATBOT - POSTGRESQL SCHEMA FOR SUPABASE
-- ============================================================
-- This schema provides persistent storage for:
-- - User sessions
-- - Conversation history
-- - AI messages and responses
-- - Long-term user preferences/memories
-- - Analytics and usage tracking
-- ============================================================

-- Enable UUID extension for better ID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for additional security features
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE: sessions
-- Tracks user sessions across browser visits
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_fingerprint TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET,
    metadata JSONB DEFAULT '{}'::JSONB,
    
    -- Indexes for performance
    CONSTRAINT sessions_created_at_check CHECK (created_at <= last_active_at)
);

CREATE INDEX idx_sessions_last_active ON sessions(last_active_at DESC);
CREATE INDEX idx_sessions_fingerprint ON sessions(user_fingerprint);
CREATE INDEX idx_sessions_created ON sessions(created_at DESC);

-- ============================================================
-- TABLE: conversations
-- Stores individual chat conversations
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
    conversation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::JSONB,
    
    -- Soft delete support
    deleted_at TIMESTAMPTZ,
    
    -- Performance indexes
    CONSTRAINT conversations_dates_check CHECK (created_at <= updated_at)
);

CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_conversations_active ON conversations(session_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_conversations_created ON conversations(created_at DESC);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);

-- ============================================================
-- TABLE: messages
-- Stores all chat messages (user and assistant)
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Search and filter metadata
    intent VARCHAR(50), -- 'greeting', 'search', 'chat', 'platform', 'reset'
    query_filters JSONB, -- Extracted search parameters
    listings_shown JSONB, -- Array of listing IDs shown in response
    
    -- Analytics
    response_time_ms INTEGER, -- How long assistant took to respond
    token_count INTEGER, -- For AI API usage tracking
    
    -- Additional context
    metadata JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_role ON messages(role);
CREATE INDEX idx_messages_intent ON messages(intent) WHERE intent IS NOT NULL;
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_content_search ON messages USING gin(to_tsvector('english', content));

-- ============================================================
-- TABLE: memories
-- Long-term user preferences and learned information
-- ============================================================
CREATE TABLE IF NOT EXISTS memories (
    memory_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    memory_type VARCHAR(50) NOT NULL, -- 'brand_preference', 'budget_preference', 'location_preference', etc.
    content TEXT NOT NULL,
    confidence NUMERIC(3,2) DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1), -- 0.0 to 1.0
    source_message_id UUID REFERENCES messages(message_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- Optional expiration for temporary preferences
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Prevent duplicate memory types per session
    CONSTRAINT unique_active_memory_per_session UNIQUE (session_id, memory_type, is_active)
);

CREATE INDEX idx_memories_session ON memories(session_id);
CREATE INDEX idx_memories_type ON memories(memory_type);
CREATE INDEX idx_memories_active ON memories(session_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_memories_expires ON memories(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================
-- TABLE: search_history
-- Analytics for search patterns and popular queries
-- ============================================================
CREATE TABLE IF NOT EXISTS search_history (
    search_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(session_id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES conversations(conversation_id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    category VARCHAR(100),
    filters JSONB DEFAULT '{}'::JSONB,
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Performance tracking
    search_duration_ms INTEGER,
    api_calls_made INTEGER DEFAULT 1
);

CREATE INDEX idx_search_session ON search_history(session_id);
CREATE INDEX idx_search_query ON search_history(query);
CREATE INDEX idx_search_category ON search_history(category);
CREATE INDEX idx_search_created ON search_history(created_at DESC);
CREATE INDEX idx_search_query_search ON search_history USING gin(to_tsvector('english', query));

-- ============================================================
-- TABLE: feedback
-- User feedback and ratings
-- ============================================================
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(session_id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES conversations(conversation_id) ON DELETE SET NULL,
    message_id UUID REFERENCES messages(message_id) ON DELETE SET NULL,
    
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_type VARCHAR(50), -- 'helpful', 'not_helpful', 'incorrect', 'offensive', 'bug'
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    metadata JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX idx_feedback_session ON feedback(session_id);
CREATE INDEX idx_feedback_rating ON feedback(rating);
CREATE INDEX idx_feedback_type ON feedback(feedback_type);
CREATE INDEX idx_feedback_created ON feedback(created_at DESC);

-- ============================================================
-- VIEWS FOR ANALYTICS
-- ============================================================

-- Active conversations in last 24 hours
CREATE OR REPLACE VIEW active_conversations_24h AS
SELECT 
    COUNT(DISTINCT conversation_id) as total_conversations,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(*) as total_messages
FROM conversations c
JOIN messages m USING (conversation_id)
WHERE c.created_at >= NOW() - INTERVAL '24 hours';

-- Popular search queries
CREATE OR REPLACE VIEW popular_searches AS
SELECT 
    query,
    category,
    COUNT(*) as search_count,
    AVG(results_count) as avg_results,
    MAX(created_at) as last_searched
FROM search_history
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY query, category
ORDER BY search_count DESC
LIMIT 100;

-- User engagement metrics
CREATE OR REPLACE VIEW user_engagement AS
SELECT 
    DATE_TRUNC('day', c.created_at) as date,
    COUNT(DISTINCT s.session_id) as unique_users,
    COUNT(DISTINCT c.conversation_id) as total_conversations,
    COUNT(m.message_id) as total_messages,
    AVG(msg_per_conv.msg_count) as avg_messages_per_conversation
FROM sessions s
JOIN conversations c USING (session_id)
JOIN messages m USING (conversation_id)
JOIN (
    SELECT conversation_id, COUNT(*) as msg_count
    FROM messages
    WHERE role = 'user'
    GROUP BY conversation_id
) msg_per_conv USING (conversation_id)
GROUP BY DATE_TRUNC('day', c.created_at)
ORDER BY date DESC;

-- ============================================================
-- FUNCTIONS FOR AUTOMATIC UPDATES
-- ============================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memories_updated_at
    BEFORE UPDATE ON memories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update session last_active_at when conversations or messages are added
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sessions 
    SET last_active_at = NOW() 
    WHERE session_id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_on_conversation
    AFTER INSERT ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_session_activity();

-- Update conversation updated_at when messages are added
CREATE OR REPLACE FUNCTION update_conversation_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET updated_at = NOW() 
    WHERE conversation_id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_activity();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) FOR SUPABASE
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Allow backend service role full access
-- (Configure service_role_key in Supabase dashboard)

-- Policy: Users can only see their own session data
CREATE POLICY "Users can view own sessions" ON sessions
    FOR SELECT
    USING (session_id::text = current_setting('app.current_session_id', true));

CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT
    USING (session_id::text = current_setting('app.current_session_id', true));

CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT
    USING (
        conversation_id IN (
            SELECT conversation_id FROM conversations
            WHERE session_id::text = current_setting('app.current_session_id', true)
        )
    );

CREATE POLICY "Users can view own memories" ON memories
    FOR SELECT
    USING (session_id::text = current_setting('app.current_session_id', true));

-- ============================================================
-- HELPER FUNCTIONS FOR COMMON OPERATIONS
-- ============================================================

-- Get or create session
CREATE OR REPLACE FUNCTION get_or_create_session(
    p_user_fingerprint TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
BEGIN
    -- Try to find existing session
    IF p_user_fingerprint IS NOT NULL THEN
        SELECT session_id INTO v_session_id
        FROM sessions
        WHERE user_fingerprint = p_user_fingerprint
        AND last_active_at >= NOW() - INTERVAL '30 days'
        ORDER BY last_active_at DESC
        LIMIT 1;
    END IF;
    
    -- Create new session if not found
    IF v_session_id IS NULL THEN
        INSERT INTO sessions (user_fingerprint, user_agent, ip_address)
        VALUES (p_user_fingerprint, p_user_agent, p_ip_address)
        RETURNING session_id INTO v_session_id;
    ELSE
        -- Update last active
        UPDATE sessions
        SET last_active_at = NOW()
        WHERE session_id = v_session_id;
    END IF;
    
    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;

-- Create new conversation with auto-generated title
CREATE OR REPLACE FUNCTION create_conversation(
    p_session_id UUID,
    p_first_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_conversation_id UUID;
    v_title TEXT;
BEGIN
    -- Generate title from first message (first 50 chars)
    IF p_first_message IS NOT NULL THEN
        v_title := LEFT(p_first_message, 50);
        IF LENGTH(p_first_message) > 50 THEN
            v_title := v_title || '...';
        END IF;
    ELSE
        v_title := 'New conversation';
    END IF;
    
    INSERT INTO conversations (session_id, title)
    VALUES (p_session_id, v_title)
    RETURNING conversation_id INTO v_conversation_id;
    
    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Clean up old data (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_data(
    p_days_to_keep INTEGER DEFAULT 90
)
RETURNS TABLE (
    deleted_sessions INTEGER,
    deleted_conversations INTEGER,
    deleted_messages INTEGER
) AS $$
DECLARE
    v_deleted_sessions INTEGER;
    v_deleted_conversations INTEGER;
    v_deleted_messages INTEGER;
BEGIN
    -- Delete old inactive sessions (cascades to conversations, messages)
    WITH deleted AS (
        DELETE FROM sessions
        WHERE last_active_at < NOW() - (p_days_to_keep || ' days')::INTERVAL
        RETURNING session_id
    )
    SELECT COUNT(*) INTO v_deleted_sessions FROM deleted;
    
    -- Get counts of what was cascade deleted
    GET DIAGNOSTICS v_deleted_conversations = ROW_COUNT;
    
    RETURN QUERY SELECT v_deleted_sessions, v_deleted_conversations, 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- INDEXES FOR FULL-TEXT SEARCH
-- ============================================================

-- Create materialized view for fast search across all content
CREATE MATERIALIZED VIEW IF NOT EXISTS searchable_content AS
SELECT 
    m.message_id,
    m.conversation_id,
    c.session_id,
    m.content,
    m.created_at,
    to_tsvector('english', m.content) as content_vector
FROM messages m
JOIN conversations c USING (conversation_id)
WHERE m.role = 'user';

CREATE INDEX idx_searchable_content_vector ON searchable_content USING gin(content_vector);
CREATE UNIQUE INDEX idx_searchable_content_msg ON searchable_content(message_id);

-- Refresh materialized view (call this periodically or via trigger)
CREATE OR REPLACE FUNCTION refresh_searchable_content()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY searchable_content;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SAMPLE QUERIES FOR COMMON OPERATIONS
-- ============================================================

-- Find conversations by search term
-- SELECT * FROM searchable_content 
-- WHERE content_vector @@ plainto_tsquery('english', 'search term')
-- ORDER BY created_at DESC;

-- Get conversation history
-- SELECT m.* FROM messages m
-- WHERE conversation_id = 'YOUR-UUID'
-- ORDER BY created_at ASC;

-- Get user's active memories
-- SELECT * FROM memories
-- WHERE session_id = 'YOUR-UUID' 
-- AND is_active = TRUE
-- AND (expires_at IS NULL OR expires_at > NOW());

-- Usage analytics for last 30 days
-- SELECT * FROM user_engagement
-- WHERE date >= NOW() - INTERVAL '30 days'
-- ORDER BY date DESC;

COMMENT ON TABLE sessions IS 'User sessions tracked across browser visits';
COMMENT ON TABLE conversations IS 'Individual chat conversations within sessions';
COMMENT ON TABLE messages IS 'All messages exchanged between user and assistant';
COMMENT ON TABLE memories IS 'Long-term user preferences and learned information';
COMMENT ON TABLE search_history IS 'Analytics for search patterns and queries';
COMMENT ON TABLE feedback IS 'User feedback and ratings for responses';

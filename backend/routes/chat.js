const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const velo = require('../velo');
// Using PostgreSQL/Supabase database (falls back to in-memory if unavailable)
const db   = require('../db-postgres');

// POST /api/chat — main conversation endpoint
router.post('/', async (req, res) => {
  try {
    const { message, session_id, conversation_id } = req.body;
    if (!message || typeof message !== 'string' || !message.trim())
      return res.status(400).json({ error: 'Message is required.' });
    if (message.length > 2000)
      return res.status(400).json({ error: 'Message too long (max 2000 chars).' });

    const sessionId = (session_id && session_id.length < 128) ? session_id : crypto.randomUUID();
    const convId    = (conversation_id && conversation_id.length < 64) ? conversation_id : null;

    const result = await velo.chat(sessionId, message.trim(), convId);

    return res.json({
      session_id:      sessionId,
      conversation_id: result.conv_id,
      text:            result.text  || '',
      listings:        result.listings || [],
      total:           result.total || 0,
    });
  } catch (err) {
    console.error('[chat route]', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// GET /api/chat/conversations — list conversations for session
router.get('/conversations', async (req, res) => {
  const sessionId = req.query.session_id;
  if (!sessionId) return res.status(400).json({ error: 'session_id required.' });
  const convs = await db.listConversations(sessionId);
  res.json({ conversations: convs });
});

// GET /api/chat/conversations/:id/messages — get messages
router.get('/conversations/:id/messages', async (req, res) => {
  const sessionId = req.query.session_id;
  if (!sessionId) return res.status(400).json({ error: 'session_id required.' });
  const conv = await db.getConversation(req.params.id);
  if (!conv || conv.session_id !== sessionId)
    return res.status(404).json({ error: 'Conversation not found.' });
  const messages = await db.getMessages(req.params.id);
  res.json({ messages });
});

// DELETE /api/chat/conversations/:id — delete conversation
router.delete('/conversations/:id', async (req, res) => {
  const sessionId = req.query.session_id;
  if (!sessionId) return res.status(400).json({ error: 'session_id required.' });
  await db.deleteConversation(req.params.id, sessionId);
  res.json({ ok: true });
});

// GET /api/chat/memories — get memories for session
router.get('/memories', async (req, res) => {
  const sessionId = req.query.session_id;
  if (!sessionId) return res.status(400).json({ error: 'session_id required.' });
  const memories = await db.getMemories(sessionId);
  res.json({ memories });
});

// PATCH /api/chat/memories/:id — update a memory
router.patch('/memories/:id', async (req, res) => {
  const { session_id, content } = req.body;
  if (!session_id || !content)
    return res.status(400).json({ error: 'session_id and content required.' });
  await db.updateMemory(req.params.id, session_id, content);
  res.json({ ok: true });
});

// DELETE /api/chat/memories/:id — delete a memory
router.delete('/memories/:id', async (req, res) => {
  const sessionId = req.query.session_id;
  if (!sessionId) return res.status(400).json({ error: 'session_id required.' });
  await db.deleteMemory(req.params.id, sessionId);
  res.json({ ok: true });
});

// POST /api/chat/memories/clear — clear all memories
router.post('/memories/clear', async (req, res) => {
  const { session_id } = req.body;
  if (!session_id) return res.status(400).json({ error: 'session_id required.' });
  await db.clearMemories(session_id);
  res.json({ ok: true });
});

module.exports = router;

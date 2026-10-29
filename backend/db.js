// ============================================================
// DB.JS — SQLite persistence for conversations + memory
// Zero config. File-based. Works immediately.
// ============================================================
'use strict';

const Database = require('better-sqlite3');
const path     = require('path');
const db       = new Database(path.join(__dirname, 'velo.db'));

// Enable WAL for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id         TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    title      TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    summary    TEXT,
    status     TEXT NOT NULL DEFAULT 'active'
  );

  CREATE INDEX IF NOT EXISTS idx_conv_session ON conversations(session_id);

  CREATE TABLE IF NOT EXISTS messages (
    id              TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role            TEXT NOT NULL CHECK(role IN ('system','user','assistant','tool')),
    content         TEXT NOT NULL,
    tool_name       TEXT,
    tool_call_id    TEXT,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
    tokens_used     INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_msg_conv ON messages(conversation_id, created_at);

  CREATE TABLE IF NOT EXISTS memories (
    id            TEXT PRIMARY KEY,
    session_id    TEXT NOT NULL,
    memory_type   TEXT NOT NULL,
    content       TEXT NOT NULL,
    source_msg_id TEXT,
    confidence    REAL DEFAULT 1.0,
    created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at    INTEGER NOT NULL DEFAULT (unixepoch()),
    expires_at    INTEGER,
    active        INTEGER NOT NULL DEFAULT 1
  );

  CREATE INDEX IF NOT EXISTS idx_mem_session ON memories(session_id, active);
`);

// ── Helpers ───────────────────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Conversations ─────────────────────────────────────────────
const convStmts = {
  create: db.prepare(`INSERT INTO conversations (id, session_id, title) VALUES (?, ?, ?)`),
  get:    db.prepare(`SELECT * FROM conversations WHERE id = ?`),
  list:   db.prepare(`SELECT * FROM conversations WHERE session_id = ? AND status = 'active' ORDER BY updated_at DESC LIMIT 50`),
  touch:  db.prepare(`UPDATE conversations SET updated_at = unixepoch() WHERE id = ?`),
  title:  db.prepare(`UPDATE conversations SET title = ? WHERE id = ?`),
  summary:db.prepare(`UPDATE conversations SET summary = ?, updated_at = unixepoch() WHERE id = ?`),
  delete: db.prepare(`UPDATE conversations SET status = 'deleted', updated_at = unixepoch() WHERE id = ? AND session_id = ?`),
};

function createConversation(sessionId, title = null) {
  const id = uid();
  convStmts.create.run(id, sessionId, title);
  return id;
}

function getConversation(id) {
  return convStmts.get.get(id) || null;
}

function listConversations(sessionId) {
  return convStmts.list.all(sessionId);
}

function touchConversation(id) {
  convStmts.touch.run(id);
}

function setConversationTitle(id, title) {
  convStmts.title.run(title, id);
}

function setConversationSummary(id, summary) {
  convStmts.summary.run(summary, id);
}

function deleteConversation(id, sessionId) {
  convStmts.delete.run(id, sessionId);
}

// ── Messages ──────────────────────────────────────────────────
const msgStmts = {
  add:    db.prepare(`INSERT INTO messages (id, conversation_id, role, content, tool_name, tool_call_id, tokens_used) VALUES (?, ?, ?, ?, ?, ?, ?)`),
  get:    db.prepare(`SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC`),
  recent: db.prepare(`SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ?`),
  count:  db.prepare(`SELECT COUNT(*) as n FROM messages WHERE conversation_id = ?`),
  last:   db.prepare(`SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1`),
};

function addMessage(convId, role, content, opts = {}) {
  const id = uid();
  msgStmts.add.run(id, convId, role, content, opts.tool_name || null, opts.tool_call_id || null, opts.tokens_used || null);
  touchConversation(convId);
  return id;
}

function getMessages(convId) {
  return msgStmts.get.all(convId);
}

// Get recent messages for model context (most recent N, but return in asc order)
function getRecentMessages(convId, limit = 20) {
  const rows = msgStmts.recent.all(convId, limit);
  return rows.reverse();
}

function getMessageCount(convId) {
  return msgStmts.count.get(convId).n;
}

// ── Memories ──────────────────────────────────────────────────
const memStmts = {
  add:    db.prepare(`INSERT INTO memories (id, session_id, memory_type, content, source_msg_id, confidence) VALUES (?, ?, ?, ?, ?, ?)`),
  list:   db.prepare(`SELECT * FROM memories WHERE session_id = ? AND active = 1 AND (expires_at IS NULL OR expires_at > unixepoch()) ORDER BY updated_at DESC`),
  update: db.prepare(`UPDATE memories SET content = ?, updated_at = unixepoch() WHERE id = ? AND session_id = ?`),
  upsert: db.prepare(`
    INSERT INTO memories (id, session_id, memory_type, content, source_msg_id, confidence)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET content = excluded.content, updated_at = unixepoch()
  `),
  findByType: db.prepare(`SELECT * FROM memories WHERE session_id = ? AND memory_type = ? AND active = 1`),
  deactivate: db.prepare(`UPDATE memories SET active = 0, updated_at = unixepoch() WHERE id = ? AND session_id = ?`),
  clearAll:   db.prepare(`UPDATE memories SET active = 0, updated_at = unixepoch() WHERE session_id = ?`),
};

function addMemory(sessionId, type, content, opts = {}) {
  // Don't duplicate same type+content
  const existing = memStmts.findByType.all(sessionId, type);
  const dup = existing.find(m => m.content.toLowerCase() === content.toLowerCase());
  if (dup) return dup.id;
  const id = uid();
  memStmts.add.run(id, sessionId, type, content, opts.sourceMsgId || null, opts.confidence || 1.0);
  return id;
}

function getMemories(sessionId) {
  return memStmts.list.all(sessionId);
}

function updateMemory(id, sessionId, content) {
  memStmts.update.run(content, id, sessionId);
}

function deleteMemory(id, sessionId) {
  memStmts.deactivate.run(id, sessionId);
}

function clearMemories(sessionId) {
  memStmts.clearAll.run(sessionId);
}

module.exports = {
  uid,
  // Conversations
  createConversation, getConversation, listConversations,
  touchConversation, setConversationTitle, setConversationSummary, deleteConversation,
  // Messages
  addMessage, getMessages, getRecentMessages, getMessageCount,
  // Memories
  addMemory, getMemories, updateMemory, deleteMemory, clearMemories,
};

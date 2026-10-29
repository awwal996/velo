require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const db      = require('./db-postgres');

const PORT   = process.env.PORT || 4000;
const ORIGIN = process.env.FRONTEND_ORIGIN || '*';

// Initialize database connection
db.initDatabase();

const app = express();

// Trust proxy for Render deployment
app.set('trust proxy', 1);

app.use(cors({ origin: ORIGIN === '*' ? '*' : ORIGIN.split(',').map(o => o.trim()) }));
app.use(express.json({ limit: '50kb' }));

// ── Health ────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({
  status: 'ok', service: 'velo-ai',
  openai: !!process.env.OPENAI_API_KEY,
  timestamp: new Date().toISOString()
}));

// ── Chat ──────────────────────────────────────────────────────
const rateLimit = require('express-rate-limit');
const limiter   = rateLimit({ windowMs: 60000, max: 30, standardHeaders: true, legacyHeaders: false });
app.use('/api/chat', limiter, require('./routes/chat'));

// ── 404 ───────────────────────────────────────────────────────
app.use((_, res) => res.status(404).json({ error: 'Not found.' }));
app.use((err, _, res, __) => res.status(500).json({ error: 'Something went wrong.' }));

app.listen(PORT, () => {
  console.log(`\n🤖 Velo AI  →  http://localhost:${PORT}`);
  console.log(`   OpenAI : ${process.env.OPENAI_API_KEY ? '✅ GPT-4o' : '⚡ Built-in engine'}`);
  console.log(`   CORS   : ${ORIGIN}\n`);
});

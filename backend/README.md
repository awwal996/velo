# Velontri Chatbot Backend

Production-ready Node.js backend with PostgreSQL/Supabase database for the Velontri marketplace AI assistant.

## 🚀 Quick Start

### 1. Install Dependencies
```powershell
npm install
```

### 2. Configure Environment
```powershell
# Copy template to .env
Copy-Item .env.template .env

# Edit .env and add your Supabase credentials
notepad .env
```

### 3. Setup Database
1. Create Supabase project at https://supabase.com
2. Run `schema.sql` in Supabase SQL Editor
3. Get credentials from Settings → API
4. Add to `.env` file

### 4. Start Server
```powershell
node server.js
```

Server runs on http://localhost:4000

## 📁 Project Structure

```
backend/
├── server.js              # Express server entry point
├── velo.js                # Conversation engine (intent detection, built-in AI)
├── db-postgres.js         # Supabase database client
├── schema.sql             # PostgreSQL database schema
├── package.json           # Dependencies
├── .env.template          # Environment variables template
├── .env.example           # Environment variables example
├── config/
│   └── velontri.config.js # Velontri API configuration
├── middleware/
│   └── rateLimit.js       # Rate limiting middleware
├── routes/
│   └── chat.js            # Chat API endpoints
└── services/
    ├── aiService.js       # OpenAI integration
    ├── intentParser.js    # Intent detection logic
    ├── mockData.js        # Mock Velontri data
    ├── toolDefinitions.js # GPT function calling tools
    ├── toolEngine.js      # Tool execution engine
    └── velontriClient.js  # Velontri API client
```

## 🔧 Configuration

### Required Environment Variables

```env
# Supabase (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Server (Required)
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000

# Velontri API (Required)
VELONTRI_API_URL=https://velontri.onrender.com/api/v1

# OpenAI (Optional - uses built-in engine if not set)
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4o
```

See `.env.template` for full documentation.

## 📡 API Endpoints

### POST /api/chat
Main conversation endpoint.

**Request:**
```json
{
  "message": "show me phones",
  "session_id": "user-session-id",
  "conversation_id": "optional-conv-id"
}
```

**Response:**
```json
{
  "session_id": "user-session-id",
  "conversation_id": "conv-uuid",
  "text": "Great news! Found 15 options...",
  "listings": [...],
  "total": 15
}
```

### GET /api/chat/conversations
List conversations for a session.

**Query:** `?session_id=xxx`

**Response:**
```json
{
  "conversations": [
    {
      "id": "uuid",
      "title": "Toyota Camry search",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /api/chat/conversations/:id/messages
Get messages for a conversation.

**Query:** `?session_id=xxx`

**Response:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "show me phones",
      "created_at": "..."
    }
  ]
}
```

### DELETE /api/chat/conversations/:id
Delete a conversation.

**Query:** `?session_id=xxx`

### GET /api/chat/memories
Get user memories (preferences).

**Query:** `?session_id=xxx`

### PATCH /api/chat/memories/:id
Update a memory.

**Body:**
```json
{
  "session_id": "xxx",
  "content": "Updated preference"
}
```

### DELETE /api/chat/memories/:id
Delete a memory.

**Query:** `?session_id=xxx`

### POST /api/chat/memories/clear
Clear all memories for session.

**Body:**
```json
{
  "session_id": "xxx"
}
```

## 🗄️ Database Schema

### Tables
- **sessions** - User session tracking
- **conversations** - Chat conversations
- **messages** - Individual messages
- **memories** - User preferences
- **search_history** - Search analytics
- **feedback** - User ratings

See `schema.sql` for complete schema with indexes, triggers, and RLS policies.

## 🧠 Conversation Engine

The backend supports two AI modes:

### 1. Built-in Engine (Default)
- No OpenAI API key required
- Pattern-based intent detection
- Supports Nigerian slang and pidgin
- Context-aware responses
- Multi-turn conversation tracking
- Budget/location/condition extraction

### 2. GPT-4o Engine (Optional)
- Requires OpenAI API key
- Function calling for search
- Advanced context understanding
- Automatic conversation summarization
- Memory extraction

## 🎯 Features

### Intent Detection
- Greetings (including Nigerian slang)
- Product searches
- Platform questions
- Casual chat
- Budget queries
- Verified seller requests
- Color-based searches

### Nigerian Slang Support
- "how far", "wetin dey", "how body"
- "omo", "guy", "bad guy"
- "abeg", "shey", "abi"
- Currency: ₦ (Naira)
- "tokunbo" (foreign-used)

### Context Awareness
- Remembers previous searches
- Carries forward filters
- Tracks budget preferences
- Location memory
- Brand preferences

### Search Intelligence
- Brand detection (Toyota, Samsung, etc.)
- Model recognition (Camry, iPhone, etc.)
- Price parsing (₦100k, 5 million)
- Location extraction
- Condition filtering (new/used/tokunbo)
- Verified seller filtering

## 🧪 Testing

### Check Syntax
```powershell
node -c server.js
node -c velo.js
node -c db-postgres.js
```

### Test API
```powershell
# Test health
curl http://localhost:4000/api/health

# Test chat
curl -X POST http://localhost:4000/api/chat `
  -H "Content-Type: application/json" `
  -d '{"message":"show me phones","session_id":"test123"}'
```

### Check Database
1. Go to Supabase Dashboard
2. Table Editor → Check tables have data
3. SQL Editor → Run test queries:

```sql
-- See active sessions
SELECT * FROM sessions WHERE last_activity > NOW() - INTERVAL '1 hour';

-- Count messages
SELECT COUNT(*) FROM messages;

-- Recent searches
SELECT * FROM search_history ORDER BY searched_at DESC LIMIT 10;
```

## 🚀 Deployment

### Render.com (Recommended)
1. Push to GitHub
2. New Web Service → Connect repo
3. Add environment variables
4. Deploy!

### Railway
1. New Project → Deploy from GitHub
2. Add environment variables
3. Generate domain

### Heroku
```powershell
heroku create velontri-chatbot
heroku config:set SUPABASE_URL=xxx
heroku config:set SUPABASE_SERVICE_KEY=xxx
git push heroku main
```

See `../DEPLOYMENT_CHECKLIST.md` for full guide.

## 📊 Monitoring

### Supabase Dashboard
- **Table Editor**: View data
- **API Logs**: See all queries
- **Database → Performance**: Query analytics
- **Database → Usage**: Storage metrics

### Useful Queries

```sql
-- Conversations per user
SELECT session_id, COUNT(*) 
FROM conversations 
GROUP BY session_id;

-- Most searched products
SELECT query, COUNT(*) 
FROM search_history 
GROUP BY query 
ORDER BY COUNT(*) DESC 
LIMIT 10;

-- Average response quality
SELECT AVG(rating) 
FROM feedback 
WHERE rating IS NOT NULL;
```

## 🐛 Troubleshooting

### "Could not connect to Supabase"
→ Check `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in `.env`

### "ECONNREFUSED" error
→ Velontri API might be down, check `VELONTRI_API_URL`

### Rate limit errors
→ Adjust rate limits in `middleware/rateLimit.js`

### "relation does not exist"
→ Run `schema.sql` in Supabase SQL Editor

### Slow responses
→ Check Supabase → Database → Performance
→ Add indexes if needed

## 🔐 Security

### Environment Variables
- Never commit `.env` to Git
- Use `.env.template` as reference
- Rotate `SUPABASE_SERVICE_KEY` periodically

### Rate Limiting
- 100 requests per 15 minutes per IP
- Configurable in `middleware/rateLimit.js`

### CORS
- Configured in `server.js`
- Update `FRONTEND_ORIGIN` for production

### Input Validation
- Message length limited to 2000 chars
- Session ID validation
- SQL injection prevented by Supabase client

## 📚 Dependencies

```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "@supabase/supabase-js": "^2.48.1",
  "openai": "^4.20.1",
  "express-rate-limit": "^7.1.5"
}
```

## 📖 Documentation

- **Deployment Guide**: `../DEPLOYMENT_CHECKLIST.md`
- **Migration Details**: `../MIGRATION_SUMMARY.md`
- **Database Schema**: `schema.sql`
- **Supabase Guide**: `../SUPABASE_DEPLOYMENT.md`

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Setup Supabase database
3. ✅ Configure `.env` file
4. ✅ Test locally: `node server.js`
5. ✅ Deploy to Render/Railway
6. ✅ Monitor in Supabase dashboard

## 🆘 Need Help?

- Check the guides in parent directory
- Supabase docs: https://supabase.com/docs
- Express docs: https://expressjs.com
- OpenAI docs: https://platform.openai.com/docs

---

**Built with ❤️ for Velontri marketplace**

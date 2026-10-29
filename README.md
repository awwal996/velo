# Velontri AI Chatbot

Production-ready conversational AI assistant for the Velontri marketplace with PostgreSQL/Supabase database, natural language understanding, and Nigerian slang support.

## 🚀 Current Status

✅ **Backend**: Migrated to PostgreSQL/Supabase  
✅ **Frontend**: Green theme with inline SVG logo  
✅ **Features**: Context-aware conversations, multi-turn dialogue, budget extraction  
✅ **Database Schema**: Complete with RLS policies, triggers, indexes  
✅ **Package Installed**: @supabase/supabase-js  
✅ **Credentials Configured**: `.env` file created  
⏳ **Pending**: Supabase database tables creation

---

## 🎯 Quick Start (5 Minutes)

### 1. Activate Your Supabase Project
Your project might be paused! Go to:
- https://supabase.com/dashboard
- Find project: **jlvgwlayyjbwvttrmlvf**
- If paused, click **"Resume Project"**
- Wait 2-3 minutes for activation

### 2. Create Database Tables
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `backend/schema.sql`
3. Paste and click **RUN**
4. Verify in Table Editor: sessions, conversations, messages, memories, search_history, feedback

### 3. Test Connection
```powershell
cd backend
node test-db.js
```

**Expected**: `🎉 ALL TESTS PASSED!`

### 4. Start Backend
```powershell
node server.js
# Should see: ✅ Connected to Supabase/PostgreSQL
```

### 5. Start Frontend
```powershell
cd ../frontend
node server.js
```

### 6. Test Chatbot
Open http://localhost:3000 and try:
- "hi"
- "show me phones"
- "toyota camry under 5 million"

---

## 📁 Project Structure

```
velontri-chatbot/
├── backend/
│   ├── server.js              # Express server
│   ├── velo.js                # Conversation engine
│   ├── db-postgres.js         # Supabase client (NEW!)
│   ├── schema.sql             # PostgreSQL schema (NEW!)
│   ├── test-db.js             # Connection tester (NEW!)
│   ├── .env                   # Environment config (CREATED!)
│   ├── package.json
│   ├── config/
│   │   └── velontri.config.js
│   ├── middleware/
│   │   └── rateLimit.js
│   ├── routes/
│   │   └── chat.js            # Updated for async
│   └── services/
│       ├── aiService.js
│       ├── intentParser.js
│       ├── mockData.js
│       ├── toolDefinitions.js
│       ├── toolEngine.js
│       └── velontriClient.js
├── frontend/
│   ├── index.html             # Green theme UI
│   └── server.js
└── docs/
    ├── SETUP_NOW.md          # Quick setup guide
    ├── DEPLOYMENT_CHECKLIST.md
    ├── MIGRATION_SUMMARY.md  # Technical details
    ├── TROUBLESHOOTING.md    # Fix connection issues
    └── SUPABASE_DEPLOYMENT.md
```

---

## ⚙️ Configuration

### Environment Variables (`.env`)
```env
# Server
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000

# Supabase Database
SUPABASE_URL=https://jlvgwlayyjbwvttrmlvf.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...

# Velontri API
VELONTRI_API_URL=https://velontri.onrender.com/api/v1

# OpenAI (Optional)
OPENAI_API_KEY=
```

---

## 🌟 Features

### Conversational AI
- ✅ Multi-turn context tracking
- ✅ Intent detection (greeting, search, chat, platform)
- ✅ Nigerian slang support ("how far", "wetin dey", etc.)
- ✅ Budget extraction ("under 100k", "5 million max")
- ✅ Location detection (Lagos, Abuja, etc.)
- ✅ Brand/model recognition (Toyota Camry, iPhone, etc.)
- ✅ Color-based search ("white car")
- ✅ Verified seller filtering

### Database Features
- ✅ Session management
- ✅ Conversation history
- ✅ Long-term memory (preferences)
- ✅ Search analytics
- ✅ User feedback tracking
- ✅ Auto-cleanup (7 days)
- ✅ Full-text search (GIN indexes)
- ✅ Row-level security (RLS)

### UI Features
- ✅ Green theme (#16845B)
- ✅ Inline SVG gradient logo
- ✅ Real-time typing indicators
- ✅ Markdown support
- ✅ Listing cards with images
- ✅ WhatsApp integration
- ✅ Verified seller badges

---

## 🐛 Troubleshooting

### "fetch failed" or timeout errors
→ **Solution**: Check `TROUBLESHOOTING.md`
→ **Most likely**: Supabase project is paused - go resume it!

### "relation does not exist"
→ **Solution**: Run `backend/schema.sql` in Supabase SQL Editor

### Port 4000 already in use
```powershell
Get-NetTCPConnection -LocalPort 4000 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force
```

### Can't connect to Supabase
1. Verify project is active in dashboard
2. Check firewall isn't blocking Node.js
3. Test with: `node test-db.js`

---

## 📊 Database Schema

### Tables
- **sessions** - User session tracking, auto-cleanup
- **conversations** - Chat conversations with titles/summaries
- **messages** - Individual messages (user/assistant/tool)
- **memories** - Long-term user preferences
- **search_history** - Analytics and popular queries
- **feedback** - User ratings and comments

### Indexes
- B-tree on foreign keys
- GIN for full-text search
- Composite for common queries

### Triggers
- Auto-update `updated_at` timestamps
- Conversation activity tracking

### RLS Policies
- Session-based access control
- Prevent cross-user data access

See `backend/schema.sql` for complete schema.

---

## 🚀 Deployment

### Backend → Render.com
1. Push to GitHub
2. New Web Service → Connect repo
3. Build command: `cd backend && npm install`
4. Start command: `node server.js`
5. Add environment variables
6. Deploy!

### Frontend → Vercel
1. Update API URL in `index.html`
2. Drag `frontend` folder to vercel.com
3. Done!

See `DEPLOYMENT_CHECKLIST.md` for detailed steps.

---

## 🧪 Testing

### Test Database
```powershell
cd backend
node test-db.js
```

### Test Chat API
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/api/chat" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"message":"show me phones","session_id":"test123"}'
```

### Test Frontend
1. Open http://localhost:3000
2. Send: "hi"
3. Send: "show me toyota camry"

---

## 📖 Documentation

- **SETUP_NOW.md** - 2-minute setup guide ⭐ START HERE
- **TROUBLESHOOTING.md** - Fix connection issues
- **DEPLOYMENT_CHECKLIST.md** - Production deployment
- **MIGRATION_SUMMARY.md** - SQLite → PostgreSQL details
- **SUPABASE_DEPLOYMENT.md** - Database technical guide
- **backend/README.md** - Backend API documentation

---

## 🎨 UI Customization

### Colors (Green Theme)
```css
--primary: #16845B      /* Buttons, links */
--header: #102A43       /* Header background */
--ai-bubble: #FFFFFF    /* AI message bubbles */
--user-bubble: #16845B  /* User message bubbles */
```

### Logo
Inline SVG gradient in `frontend/index.html` - fully customizable!

---

## 💡 Tips

### Performance
- First 5 listings are enriched with details
- 15-second timeout for Velontri API
- Built-in engine is faster than GPT-4o

### Nigerian Slang Support
Test these:
- "how far?" → Greeting
- "wetin dey?" → Greeting  
- "my budget is 100 million" → Extracts budget
- "i need a white car" → Color + vehicle search

### Context Tracking
- "show me toyota camry" → Searches for Toyota
- "in lagos" → Adds location to previous search
- "cheaper ones" → Reduces max price
- "used only" → Filters by condition

---

## 🤝 Support

### Common Questions

**Q: Do I need OpenAI API key?**  
A: No! Built-in engine works great. OpenAI is optional for advanced features.

**Q: How much does Supabase cost?**  
A: Free tier: 500MB database, 2GB bandwidth/month. More than enough!

**Q: Can I use PostgreSQL locally?**  
A: Yes! Update connection string in `db-postgres.js`

**Q: How do I backup my data?**  
A: Supabase → Settings → Database → Backups (automatic daily backups on paid plan)

---

## 📈 Roadmap

Future enhancements:
- [ ] User authentication (Supabase Auth)
- [ ] Real-time chat updates (Supabase Realtime)
- [ ] Image uploads (Supabase Storage)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Voice input
- [ ] Mobile app (React Native)

---

## 📄 License

MIT License - See LICENSE file

---

## 🎉 You're Almost Done!

### Next Steps:
1. ⭐ **Read SETUP_NOW.md**
2. Resume your Supabase project
3. Run schema.sql in SQL Editor
4. Test with: `node test-db.js`
5. Start chatting!

**Need help?** Check TROUBLESHOOTING.md

---

**Built with ❤️ for Velontri marketplace**
#   v e l o  
 
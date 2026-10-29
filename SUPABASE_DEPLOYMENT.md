# 🚀 Supabase Deployment Guide for Velontri Chatbot

This guide walks you through deploying the Velontri Chatbot database to Supabase (PostgreSQL).

---

## 📋 Prerequisites

1. **Supabase Account** - Sign up at [supabase.com](https://supabase.com)
2. **Node.js** - Version 16+ installed
3. **Git** (optional) - For version control

---

## 🎯 Step-by-Step Deployment

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `velontri-chatbot`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., `US East`)
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup to complete

---

### Step 2: Run Database Schema

1. In your Supabase project dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Open the file `backend/schema.sql` from this project
4. Copy the ENTIRE contents
5. Paste into the Supabase SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. You should see: ✅ **"Success. No rows returned"**

**What this creates:**
- `sessions` table - User sessions
- `conversations` table - Chat conversations
- `messages` table - All messages
- `memories` table - User preferences
- `search_history` table - Analytics
- `feedback` table - User ratings
- Automatic triggers, indexes, and functions

---

### Step 3: Get API Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:

   **Project URL:**
   ```
   https://xxxxxxxxxxx.supabase.co
   ```

   **Service Role Key (secret):**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
   ```

   ⚠️ **Important**: Use the `service_role` key, NOT the `anon` key
   - The service_role key bypasses Row Level Security
   - Never expose this key in client-side code
   - Only use it in your backend server

---

### Step 4: Configure Environment Variables

1. Create `.env` file in the `backend` folder (if not exists):
   ```bash
   cd backend
   touch .env
   ```

2. Add your Supabase credentials:
   ```env
   # Supabase Configuration
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key-here
   
   # Optional: OpenAI (for enhanced AI features)
   OPENAI_API_KEY=sk-your-openai-key
   
   # Optional: Velontri API
   VELONTRI_API_URL=https://velontri.onrender.com/api/v1
   VELONTRI_TIMEOUT_MS=15000
   
   # Server Configuration
   PORT=4000
   NODE_ENV=production
   ```

3. Save the file

---

### Step 5: Install Dependencies

```bash
# Navigate to backend folder
cd backend

# Install Supabase client
npm install @supabase/supabase-js

# Or if you need to install all dependencies
npm install
```

---

### Step 6: Update Backend Code

The backend is already configured to use PostgreSQL! Just make sure you're using the correct database module:

**Option A: Auto-detect (Recommended)**

The code will automatically use Supabase if credentials are provided, otherwise falls back to SQLite.

**Option B: Force PostgreSQL**

In `backend/routes/chat.js`, change:
```javascript
const db = require('../db'); // SQLite
```

To:
```javascript
const db = require('../db-postgres'); // PostgreSQL
db.initDatabase(); // Initialize Supabase connection
```

---

### Step 7: Test the Connection

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Look for this message:
   ```
   ✅ Connected to Supabase/PostgreSQL
   🤖 Velo AI  →  http://localhost:4000
   ```

3. If you see this instead:
   ```
   ⚠️  Supabase credentials not found. Using in-memory fallback.
   ```
   
   **Troubleshooting:**
   - Check that `.env` file exists in `backend/` folder
   - Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set correctly
   - Make sure there are no extra spaces or quotes
   - Restart the server after changing `.env`

---

### Step 8: Verify Database Tables

1. Go to Supabase dashboard → **Table Editor**
2. You should see these tables:
   - ✅ sessions
   - ✅ conversations
   - ✅ messages
   - ✅ memories
   - ✅ search_history
   - ✅ feedback

3. Start chatting on your frontend!
4. Refresh the Table Editor to see data appearing in real-time

---

## 🔍 Monitoring & Analytics

### View Active Users
```sql
SELECT * FROM active_conversations_24h;
```

### Popular Searches (Last 7 Days)
```sql
SELECT * FROM popular_searches LIMIT 20;
```

### User Engagement Metrics
```sql
SELECT * FROM user_engagement
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;
```

### Recent Conversations
```sql
SELECT 
    c.conversation_id,
    c.title,
    c.created_at,
    COUNT(m.message_id) as message_count
FROM conversations c
LEFT JOIN messages m USING (conversation_id)
WHERE c.created_at >= NOW() - INTERVAL '24 hours'
GROUP BY c.conversation_id, c.title, c.created_at
ORDER BY c.created_at DESC;
```

---

## 🛡️ Security Best Practices

### Row Level Security (RLS)

The schema includes RLS policies. To enable session-based access:

```javascript
// In your backend, set session context
await supabase.rpc('set_config', {
  setting: 'app.current_session_id',
  value: sessionId
});
```

### API Key Security

- ✅ **DO**: Store `service_role` key in `.env` file
- ✅ **DO**: Add `.env` to `.gitignore`
- ✅ **DO**: Use environment variables in production
- ❌ **DON'T**: Commit API keys to Git
- ❌ **DON'T**: Expose service_role key to frontend
- ❌ **DON'T**: Use anon key for backend operations

### Rate Limiting

Consider adding rate limiting in production:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📊 Database Maintenance

### Auto-Cleanup Old Data

Set up a cron job to clean old sessions:

```sql
-- Delete sessions older than 90 days
SELECT * FROM cleanup_old_data(90);
```

### Refresh Search Index

For better performance:

```sql
-- Refresh materialized view for full-text search
SELECT refresh_searchable_content();
```

### Backup Database

1. Go to **Settings** → **Database** → **Backups**
2. Supabase automatically backs up daily
3. You can also download manual backups

---

## 🚀 Production Deployment

### Deploy Backend (e.g., Render, Railway, Heroku)

1. Push code to GitHub
2. Connect your hosting service
3. Set environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `PORT`
   - `NODE_ENV=production`
4. Deploy!

### Deploy Frontend (e.g., Vercel, Netlify)

1. Update API URL in `frontend/index.html`:
   ```javascript
   const API_BASE = 'https://your-backend.render.com';
   ```
2. Deploy frontend to hosting service
3. Test end-to-end

---

## 🔧 Troubleshooting

### "Connection refused"
- Check SUPABASE_URL is correct
- Verify project is not paused in Supabase dashboard

### "Invalid API key"
- Make sure you're using `service_role` key, not `anon` key
- Check for extra spaces or quotes in `.env`

### "Table does not exist"
- Ensure you ran the full `schema.sql` file
- Check SQL Editor for any errors

### "Row Level Security" errors
- The service_role key bypasses RLS
- Make sure you're using the correct key

### Data not showing in tables
- Check backend console for errors
- Verify `db.initDatabase()` is called
- Test connection with a simple insert query

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

---

## 🆘 Support

If you encounter issues:

1. Check backend console for error messages
2. Verify all environment variables are set
3. Test database connection in Supabase SQL Editor
4. Review the troubleshooting section above

---

## ✅ Deployment Checklist

- [ ] Created Supabase project
- [ ] Ran schema.sql successfully
- [ ] Copied SUPABASE_URL and service_role key
- [ ] Created .env file with credentials
- [ ] Installed @supabase/supabase-js package
- [ ] Updated backend to use db-postgres.js
- [ ] Tested local connection
- [ ] Verified tables in Supabase dashboard
- [ ] Tested chat functionality
- [ ] Deployed backend to production
- [ ] Deployed frontend to production
- [ ] Added .env to .gitignore

---

**🎉 Congratulations! Your Velontri Chatbot is now running on production-grade PostgreSQL via Supabase!**

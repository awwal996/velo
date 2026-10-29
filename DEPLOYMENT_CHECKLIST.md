# Velontri Chatbot - Deployment Checklist

## ✅ Quick Setup (5 minutes)

### 1. Create Supabase Project
- Go to https://supabase.com
- New Project → Choose name, password, region
- Wait for provisioning (~2 min)

### 2. Setup Database
- Open SQL Editor in Supabase
- Copy/paste entire `backend/schema.sql`
- Click Run
- Verify tables exist in Table Editor

### 3. Get Credentials
- Settings → API
- Copy **Project URL**
- Copy **service_role** key (click Reveal)

### 4. Configure Backend
Create `backend/.env`:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJxxxx...
VELONTRI_API_URL=https://velontri.onrender.com/api/v1
FRONTEND_ORIGIN=http://localhost:3000
PORT=4000
```

### 5. Test Locally
```powershell
cd backend
npm install
node server.js
```

In another terminal:
```powershell
cd frontend
node server.js
```

Visit http://localhost:3000 and test chat!

---

## 🚀 Production Deploy

### Backend → Render.com
1. Push code to GitHub
2. Render.com → New Web Service
3. Connect repo → Choose `backend` folder
4. Add environment variables
5. Deploy (auto-builds on push)

### Frontend → Vercel
1. Update API_URL in `frontend/index.html`
2. Drag `frontend` folder to vercel.com
3. Done!

---

## 🔑 Important Variables

| Variable | Where to Get | Example |
|----------|-------------|---------|
| SUPABASE_URL | Supabase → Settings → API | https://abc123.supabase.co |
| SUPABASE_SERVICE_KEY | Supabase → Settings → API → service_role | eyJhbG... |
| FRONTEND_ORIGIN | Your frontend URL | https://myapp.vercel.app |
| VELONTRI_API_URL | Velontri marketplace API | https://velontri.onrender.com/api/v1 |

---

## 🧪 Testing

### Test Database Connection
```javascript
// Should see no errors when starting server
node server.js
```

### Test Chat API
```powershell
curl -X POST http://localhost:4000/api/chat `
  -H "Content-Type: application/json" `
  -d '{"message":"show me phones","session_id":"test123"}'
```

### Check Database
- Supabase → Table Editor → sessions (should have data)
- Supabase → Table Editor → messages (should have data)

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| "Could not connect to Supabase" | Check SUPABASE_URL and SUPABASE_SERVICE_KEY |
| "relation does not exist" | Run schema.sql in Supabase SQL Editor |
| CORS error | Update FRONTEND_ORIGIN to match frontend URL |
| Data not saving | Check Supabase → Logs → API for errors |

---

## 📊 Files Changed

✅ `backend/db-postgres.js` - Supabase client created  
✅ `backend/schema.sql` - PostgreSQL schema created  
✅ `backend/routes/chat.js` - Updated to use db-postgres  
✅ `backend/velo.js` - Updated to async/await for Supabase  
✅ `backend/.env.example` - Added Supabase config  
✅ `backend/package.json` - Added @supabase/supabase-js  

---

## 🎯 Next: Go to Step 1!

Open the detailed guide: `SUPABASE_DEPLOYMENT_GUIDE.md`

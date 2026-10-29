# 🚀 Quick Deploy Instructions

## ⚠️ Git Not Installed

I noticed Git is not installed on your system. Here's how to proceed:

---

## Option 1: Install Git First (Recommended)

### Step 1: Install Git
1. Download: https://git-scm.com/download/win
2. Run installer (use default settings)
3. Restart PowerShell
4. Verify: `git --version`

### Step 2: Push to GitHub
```powershell
cd C:\Users\HP\Documents\velontri-chatbot

git init
git add .
git commit -m "Initial commit: Velontri AI Chatbot"
git branch -M main
git remote add origin https://github.com/awwal996/velo.git
git push -u origin main
```

### Step 3: Deploy to Render
1. Go to https://render.com
2. Sign up with GitHub
3. New Web Service → Select `awwal996/velo`
4. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. Add environment variables (see below)
6. Deploy!

---

## Option 2: Use GitHub Desktop (Easier)

### Step 1: Install GitHub Desktop
1. Download: https://desktop.github.com
2. Install and sign in to GitHub
3. Add this folder as repository
4. Publish to GitHub

### Step 2: Deploy (same as above)

---

## Environment Variables for Render

Add these in Render dashboard:

```env
PORT=4000
FRONTEND_ORIGIN=*
VELONTRI_API_URL=https://velontri.onrender.com/api/v1
VELONTRI_TIMEOUT_MS=60000
SESSION_TTL_SECONDS=3600

# If using Supabase:
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here

# If using OpenAI (optional):
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o
```

---

## Frontend Deployment (Vercel)

1. Go to https://vercel.com
2. Sign up with GitHub  
3. Import `awwal996/velo`
4. Root Directory: `frontend`
5. Deploy!

Then update `frontend/index.html`:
```javascript
const API_BASE = 'https://your-backend.onrender.com';
```

---

## Quick Links

- **Full Guide:** See `DEPLOYMENT_GUIDE.md`
- **Supabase Setup:** See `SETUP_NOW.md`
- **Troubleshooting:** See `TROUBLESHOOTING.md`

---

**After installing Git, run the commands above to deploy!** 🚀

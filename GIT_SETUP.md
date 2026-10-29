# 🔧 Git Installation & Push to GitHub

## Current Status
The automated Git installation timed out. Here are your options:

---

## ✅ Option 1: Manual Git Installation (5 minutes)

### Step 1: Download Git
1. Open: **https://git-scm.com/download/win**
2. Click **"64-bit Git for Windows Setup"**
3. Run the installer
4. Click **"Next"** through all options (defaults are fine)
5. Click **"Install"**

### Step 2: Restart Terminal
- Close your current PowerShell/Terminal
- Open a new PowerShell window

### Step 3: Verify Installation
```powershell
git --version
```
You should see: `git version 2.x.x`

### Step 4: Configure Git (First Time Only)
```powershell
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

### Step 5: Push to GitHub
```powershell
cd C:\Users\HP\Documents\velontri-chatbot

git init
git add .
git commit -m "Initial commit: Velontri AI Chatbot"
git branch -M main
git remote add origin https://github.com/awwal996/velo.git
git push -u origin main
```

**When asked for password:** Use a GitHub Personal Access Token (see below)

---

## ✅ Option 2: GitHub Desktop (Easiest!)

**No terminal needed!**

### Step 1: Install GitHub Desktop
1. Download: **https://desktop.github.com**
2. Install and sign in to your GitHub account

### Step 2: Add Your Project
1. File → **Add Local Repository**
2. Choose: `C:\Users\HP\Documents\velontri-chatbot`
3. If it says "not a git repository", click **"Create a repository"**

### Step 3: Publish
1. Click **"Publish repository"**
2. Repository name: `velo`
3. Uncheck **"Keep this code private"** (or keep it checked if you want)
4. Click **"Publish repository"**

**Done!** Your code is now on GitHub! ✅

---

## 🔑 GitHub Personal Access Token (If Needed)

When pushing via terminal, GitHub requires a token instead of password:

### Create Token:
1. Go to: **https://github.com/settings/tokens**
2. Click: **"Generate new token (classic)"**
3. Note: `Velontri Chatbot`
4. Select scope: **`repo`** (check the checkbox)
5. Click: **"Generate token"**
6. **Copy the token** (it starts with `ghp_`)

### Use Token:
- Username: `awwal996`
- Password: **Paste your token** (not your GitHub password!)

---

## ✅ Option 3: Use VS Code

If you have VS Code installed:

1. Open folder in VS Code
2. Click **Source Control** icon (left sidebar)
3. Click **"Initialize Repository"**
4. Click **"Commit"** (enter message)
5. Click **"Publish Branch"**
6. Choose repository name: `velo`

---

## 🚀 After Code is on GitHub

Once your code is on GitHub (using any option above):

### 1. Deploy Backend to Render
- Go to: **https://render.com**
- Sign up with GitHub
- New → **Web Service**
- Select repository: **awwal996/velo**
- Settings:
  - **Root Directory:** `backend`
  - **Build Command:** `npm install`
  - **Start Command:** `node server.js`
- Add Environment Variables (see below)
- Click **"Create Web Service"**

### 2. Deploy Frontend to Vercel
- Go to: **https://vercel.com**
- Sign up with GitHub
- Import Project → Select **awwal996/velo**
- Settings:
  - **Root Directory:** `frontend`
- Click **"Deploy"**

### 3. Update Frontend API URL
After backend is deployed, update `frontend/index.html`:
```javascript
const API_BASE = 'https://your-backend-name.onrender.com';
```
Then commit and push the change.

---

## 🔐 Environment Variables for Render

Add these in Render dashboard (Environment tab):

```
PORT=4000
FRONTEND_ORIGIN=*
VELONTRI_API_URL=https://velontri.onrender.com/api/v1
VELONTRI_TIMEOUT_MS=60000
SESSION_TTL_SECONDS=3600
```

### Optional - Supabase (if you set it up):
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

### Optional - OpenAI:
```
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4o
```

---

## 🎯 Recommended Path

**I recommend GitHub Desktop** because:
- ✅ No terminal commands needed
- ✅ No configuration required
- ✅ Visual interface
- ✅ Works immediately
- ✅ 5 minutes total time

---

## ❓ Troubleshooting

### Git command not found after installation
→ Restart your terminal/PowerShell

### Permission denied when pushing
→ Use Personal Access Token instead of password

### Repository already exists
→ Use: `git remote set-url origin https://github.com/awwal996/velo.git`

### Fatal: not a git repository
→ Make sure you ran `git init` first

---

## 📝 Quick Command Reference

```powershell
# Check Git version
git --version

# Configure Git (first time)
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Initialize repository
git init

# Add all files
git add .

# Commit
git commit -m "Your message"

# Add remote
git remote add origin https://github.com/awwal996/velo.git

# Push
git push -u origin main
```

---

**Choose Option 1, 2, or 3 above and let me know when your code is on GitHub!** 🚀

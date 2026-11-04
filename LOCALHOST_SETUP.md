# 🏠 Running Chatbot on Localhost

## Quick Start (No React Issues!)

Testing on localhost bypasses all React integration problems on the production site.

---

## 🚀 **Steps to Run Locally**

### 1. Open TWO Terminal Windows

**Terminal 1: Backend**
```powershell
cd c:\Users\HP\Documents\velontri-chatbot\backend
node server.js
```

**Terminal 2: Frontend**
```powershell
cd c:\Users\HP\Documents\velontri-chatbot\frontend
node server.js
```

---

### 2. Access the Chatbot

Open your browser to:
```
http://localhost:3000
```

**OR** if frontend is on port 3001:
```
http://localhost:3001
```

---

### 3. Test Conversations

Try these:
- "hi" (should remember your name if you told it before)
- "show me samsung phones" (should show listings)
- "toyota camry" (should show cars)

Check if:
- ✅ Conversations appear in sidebar
- ✅ Conversations persist after refresh
- ✅ Delete button works
- ✅ Pin button works
- ✅ Listing images show in history

---

## 🔍 **Debug Console Logs**

Open DevTools (F12) → Console tab

You should see:
```
========================================
VELO CHATBOT VERSION: 2.1.1-DEBUG
Build: Added Debug Logging for Conversation Save
========================================

[Velo] API Response: {
  hasError: false,
  hasConvId: true,
  hasText: true,
  listingsCount: 3,
  convId: "abc-123..."
}

[Velo] Set CURRENT_CONV_ID to: abc-123...
[Velo] Loading conversations for session: xyz-789...
[Velo] Conversations API response: {
  status: 200,
  ok: true,
  count: 1,
  conversations: [...]
}
```

---

## ⚙️ **Configuration**

### Backend Port
Default: `http://localhost:4000`

To change:
```powershell
# Edit backend/.env
PORT=5000
```

### Frontend Port
Default: `http://localhost:3000`

To change:
```javascript
// Edit frontend/server.js
const PORT = 3001;
```

### API Endpoint
Frontend automatically connects to:
```javascript
const API = 'http://localhost:4000/api/chat';
```

---

## 🐛 **Troubleshooting**

### Backend won't start
```powershell
# Check if port 4000 is in use
Get-NetTCPConnection -LocalPort 4000

# Kill the process
Get-NetTCPConnection -LocalPort 4000 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force
```

### Frontend won't start
```powershell
# Check if port 3000 is in use
Get-NetTCPConnection -LocalPort 3000

# Kill the process
Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force
```

### Database connection error
```powershell
# Test database connection
cd backend
node test-db.js
```

Expected output:
```
✅ Connected to Supabase/PostgreSQL
🎉 ALL TESTS PASSED!
```

If it fails:
1. Check if Supabase project is paused (go to dashboard and resume)
2. Verify `.env` file has correct credentials
3. Check internet connection

### "Cannot find module" errors
```powershell
# Reinstall dependencies
cd backend
npm install

cd ../frontend
npm install
```

### Conversations not saving (even on localhost)
Check console logs for:
```
[Velo] API Response: { hasConvId: false, ... }
```

This means backend isn't creating conversations. Check:
1. Database connection (run `node test-db.js`)
2. Backend logs for errors
3. `.env` file configuration

---

## 📊 **Expected Backend Logs**

When backend starts:
```
[Backend] Starting Velontri Chatbot Backend...
[Backend] Environment: development
[Backend] Port: 4000
[DB] Initializing database connection...
✅ Connected to Supabase/PostgreSQL
[Backend] ✅ Server running on http://localhost:4000
[Backend] CORS enabled for: http://localhost:3000
```

When you send a message:
```
[API] POST /api/chat
[DB] Creating conversation for session: xyz-789
[DB] ✅ Conversation created: abc-123
[Velo] Processing message: "show me phones"
[Velo] Intent: SEARCH
[Velontri API] Searching with filters: { category: "Electronics" }
[Velo] ✅ Found 15 listings
[API] ✅ Response sent
```

---

## 📝 **Testing Checklist**

### Basic Chat
- [ ] Send "hi" → Gets greeting response
- [ ] Send "my name is MJ" → Remembers name
- [ ] Send "what's my name?" → Responds with "MJ"

### Product Search
- [ ] Send "samsung phone" → Shows listing cards
- [ ] Click listing → Opens in new tab
- [ ] Click WhatsApp → Opens WhatsApp link

### Conversation Management
- [ ] New conversation appears in sidebar
- [ ] Conversation has correct title
- [ ] Hover → see pin and delete buttons
- [ ] Click pin → moves to top
- [ ] Click delete → custom modal appears
- [ ] Confirm delete → conversation disappears
- [ ] Refresh page → conversations persist

### Listing Persistence (THE BIG FIX!)
- [ ] Search for products → see listing cards
- [ ] Navigate away (click "New Chat")
- [ ] Click back to that conversation
- [ ] ✅ Listing cards should still show
- [ ] Refresh page
- [ ] Open conversation again
- [ ] ✅ Listing cards still show

### Pin Feature
- [ ] Pin a conversation → star turns yellow
- [ ] Pinned conv shows at top with blue border
- [ ] Refresh page → pin persists
- [ ] Unpin → goes back to chronological order

### Dark Mode (if testing in production)
- [ ] Parent site dark mode toggle
- [ ] Chatbot syncs automatically
- [ ] Toggle back → chatbot follows

---

## 🎯 **Advantages of Localhost Testing**

1. **No React conflicts** - Your chatbot runs standalone
2. **Fast iteration** - No deployment needed
3. **Full debug logs** - See everything in console
4. **Database access** - Can inspect Supabase directly
5. **Network inspection** - See all API calls in DevTools

---

## 🔄 **Development Workflow**

### Make Changes → Test Immediately

1. **Edit frontend/index.html**
2. Save (Ctrl+S)
3. Refresh browser (Ctrl+R)
4. ✅ Changes visible immediately

No deployment needed!

### Backend Changes

1. **Edit backend files**
2. Stop backend (Ctrl+C in terminal)
3. Restart: `node server.js`
4. ✅ Changes active

---

## 📦 **Production vs Localhost**

| Feature | Localhost | Production (velo.pxxlspace.cv) |
|---------|-----------|-------------------------------|
| React conflicts | ❌ None | ⚠️ Need fix |
| Deployment | ❌ Not needed | ✅ Manual upload required |
| Testing speed | ✅ Instant | ⏰ Slow (cache, upload) |
| Debug logs | ✅ Full access | ⚠️ Limited |
| Database | ✅ Same (Supabase) | ✅ Same |
| Conversations | ✅ Save properly | ❌ React breaks it |

**Recommendation:** Test on localhost first, deploy to production after confirming everything works!

---

## 🚀 **Next Steps**

Once everything works on localhost:

1. **Verify all features work** ✅
2. **Fix React integration** on `velontri.pxxl.click` (see REACT_INTEGRATION_FIX.md)
3. **Deploy updated frontend** to `velo.pxxlspace.cv`
4. **Test production** in incognito mode

---

## 💡 **Pro Tips**

### Keep Terminals Open
Don't close the terminal windows - backend and frontend need to keep running!

### Use Incognito for Testing
Avoids cache issues, gives clean state each time.

### Check Both Consoles
- **Browser Console** - Frontend errors
- **Terminal** - Backend errors

### Monitor Network Tab
DevTools → Network → See all API calls to `/api/chat`

---

## ✅ **You're Ready!**

Run both servers and open http://localhost:3000

**Have fun testing without React issues!** 🎉

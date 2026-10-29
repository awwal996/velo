# 🔧 Troubleshooting Supabase Connection

## Current Issue: "fetch failed" / Connection Timeout

Your credentials are configured, but the connection to Supabase is failing.

---

## ✅ Quick Fixes (Try These First)

### Fix 1: Verify Supabase Project is Active

1. Go to https://supabase.com/dashboard
2. Find your project: **jlvgwlayyjbwvttrmlvf**
3. Check the status indicator:
   - 🟢 **Active** = Good!
   - 🟡 **Paused** = Click "Restore Project"
   - 🔴 **Inactive** = Wait for it to wake up (can take 1-2 minutes)

**Supabase pauses free-tier projects after 1 week of inactivity!**

### Fix 2: Double-Check Your Credentials

1. Open Supabase Dashboard → Your Project
2. Click **Settings** (gear icon) → **API**
3. Verify these match your `.env` file:

```env
SUPABASE_URL=https://jlvgwlayyjbwvttrmlvf.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...  (starts with eyJ)
```

4. Make sure you're using **service_role** key, NOT the **anon** key!

### Fix 3: Check Network/Firewall

**Windows Defender Firewall might be blocking Node.js:**

1. Open Windows Security → Firewall & network protection
2. Click "Allow an app through firewall"
3. Find "Node.js" → Make sure both Private and Public are checked
4. If not found, click "Change settings" → "Allow another app" → Browse to:
   `C:\Program Files\nodejs\node.exe`

### Fix 4: Test Internet Connection to Supabase

```powershell
# Test if you can reach Supabase
Test-NetConnection -ComputerName jlvgwlayyjbwvttrmlvf.supabase.co -Port 443
```

**Expected output:**
```
TcpTestSucceeded : True
```

If **False**, your network is blocking Supabase!

---

## 🔍 Diagnostic Steps

### Step 1: Test with Browser

1. Open this URL in your browser:
   ```
   https://jlvgwlayyjbwvttrmlvf.supabase.co/rest/v1/
   ```

2. **Expected:** You should see either:
   - A JSON response
   - An authentication error (this is OK - means Supabase is reachable)

3. **If you see "This site can't be reached":**
   - Your project might be paused
   - Or DNS/network issue

### Step 2: Verify Service Role Key

The service_role key should:
- Start with `eyJ`
- Be very long (~250+ characters)
- NOT be the same as the `anon` key

**Wrong key (anon - public):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI...
(if you decode it, role: "anon")
```

**Correct key (service_role - admin):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI...
(if you decode it, role: "service_role")
```

Your key looks correct based on the JWT payload! ✅

### Step 3: Try Pausing/Resuming Project

Sometimes Supabase projects need a restart:

1. Dashboard → Your Project
2. **Settings** → **General**
3. Scroll to bottom → "Pause project"
4. Wait 30 seconds
5. Click "Resume project"
6. Wait 2-3 minutes for full initialization

---

## 🌐 Alternative: Use Supabase REST API Directly

If the JS client doesn't work, we can use direct HTTP requests:

### Test with PowerShell:
```powershell
$headers = @{
    "apikey" = "eyJhbGci...your-service-role-key"
    "Authorization" = "Bearer eyJhbGci...your-service-role-key"
}

Invoke-RestMethod -Uri "https://jlvgwlayyjbwvttrmlvf.supabase.co/rest/v1/sessions?select=count" -Headers $headers
```

---

## 🛠️ Temporary Workaround: Use SQLite

While troubleshooting Supabase, you can temporarily use SQLite:

1. In `backend/routes/chat.js` and `backend/velo.js`:
   ```javascript
   // Change from:
   const db = require('./db-postgres');
   
   // Back to:
   const db = require('./db');
   ```

2. Remove all `await` keywords in velo.js (use old version)

3. Your chatbot will work locally with SQLite

4. Once Supabase is working, switch back to `db-postgres`

---

## 📞 Common Error Messages

### "TypeError: fetch failed"
→ Network connectivity issue or project paused

### "Invalid API key"
→ Wrong key format or missing Bearer token

### "relation does not exist"
→ Schema not created yet (run schema.sql)

### "ECONNREFUSED"
→ Firewall blocking or project down

### Connection timeout
→ Project is waking up (wait 2-3 minutes) or network issue

---

## ✅ When It's Working

You should see:
```
✅ Connected to Supabase/PostgreSQL
🤖 Velo AI  →  http://localhost:4000
```

AND the test command should work:
```powershell
node test-db.js
# Should show: 🎉 ALL TESTS PASSED!
```

---

## 🆘 Still Not Working?

### Option 1: Check Supabase Status
- https://status.supabase.com
- See if there's an outage

### Option 2: Try Different Network
- Mobile hotspot
- Different WiFi
- VPN off/on

### Option 3: Create New Project
1. Create fresh Supabase project
2. Get new URL and key
3. Update `.env`
4. Run `schema.sql`

### Option 4: Use PostgreSQL Locally
Instead of Supabase, install PostgreSQL locally:
- Download: https://www.postgresql.org/download/windows/
- Install and run
- Update connection string in code

---

## 📊 Current Configuration

Your `.env` has:
```
SUPABASE_URL=https://jlvgwlayyjbwvttrmlvf.supabase.co
SUPABASE_SERVICE_KEY=eyJhbG...  ✅ (service_role key)
```

Project ref: **jlvgwlayyjbwvttrmlvf**

---

## 🎯 Next Steps

1. **Verify project is active** in Supabase dashboard
2. **Test browser access** to the URL above
3. **Check firewall** settings
4. **Run schema.sql** once connection works
5. **Test with** `node test-db.js`

---

**Most likely cause:** Project is paused due to inactivity. Go to dashboard and click "Resume"! 🚀

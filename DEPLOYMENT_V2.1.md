# 🚀 Velo Chatbot Version 2.1 - Deployment Guide

## Version: 2.1-LISTINGS-PIN
**Build Date:** Latest  
**Status:** Ready for deployment

---

## 🎯 What's New in Version 2.1

### ✅ FIXED: Listing Persistence in Conversation History
**Problem:** When users searched for listings and then viewed past conversations, the listing images/cards would not appear.

**Root Cause:** The database stored listings in the `listings_shown` column, but when loading past messages, the frontend didn't map this field to the `listings` property that the rendering function expects.

**Solution:**
- Updated `loadConversation()` function to map database column `listings_shown` → `listings`
- Added support for both column names for backward compatibility
- Added logging to track messages with listings

**Files Changed:**
- `frontend/index.html` - `loadConversation()` function (lines ~1345-1370)

**Test:** 
1. Search for "Samsung phone" → see listing cards
2. Navigate away or refresh
3. Open that conversation from history
4. ✅ Listing cards should now appear in the conversation

---

### ✨ NEW: Pin Conversations
**Feature:** Users can now pin important conversations to keep them at the top of the sidebar.

**Implementation:**
- Added pin/unpin button (⭐ star icon) next to each conversation
- Pinned conversations show at the top with:
  - Yellow star icon
  - Blue left border
  - Subtle background highlight
- Pin state persists in database
- Conversations automatically sort: Pinned first, then by most recent

**Files Changed:**
- `frontend/index.html`:
  - Added `togglePinConversation()` function
  - Added CSS for `.conv-pin` and `.conv-item.pinned` styles
  - Pin button already in UI (was non-functional, now works)
  
- `backend/routes/chat.js`:
  - Added `PATCH /api/chat/conversations/:id/pin` endpoint
  
- `backend/db-postgres.js`:
  - Added `togglePinConversation()` function
  - Updated `listConversations()` to return `is_pinned` flag
  - Updated query to order by `is_pinned DESC` first, then `updated_at DESC`
  - Exported `togglePinConversation` in module.exports

**Database:** The `conversations` table must have an `is_pinned` BOOLEAN column (likely already exists).

**Test:**
1. Hover over any conversation → see star icon appear
2. Click star → conversation moves to top with yellow star
3. Click star again → unpins and moves back to chronological order
4. Refresh page → pin state should persist

---

## 📦 Files Modified

### Frontend
- ✅ `frontend/index.html`
  - Fixed listing persistence in `loadConversation()`
  - Added `togglePinConversation()` function
  - Added CSS for pinned conversations and pin button
  - Updated version banner to `2.1-LISTINGS-PIN`

### Backend
- ✅ `backend/routes/chat.js`
  - Added `PATCH /conversations/:id/pin` endpoint
  
- ✅ `backend/db-postgres.js`
  - Added `togglePinConversation()` function
  - Updated `listConversations()` to support pinning
  - Exported new function

---

## 🔍 Version Detection

The chatbot logs its version to the browser console on load:

```javascript
========================================
VELO CHATBOT VERSION: 2.1-LISTINGS-PIN
Build: Listing Persistence + Pin Conversations
========================================
```

**To verify deployment:**
1. Open chatbot
2. Open browser DevTools (F12)
3. Check Console tab
4. Look for version banner above
5. If you see old version (2.0-FIXED-DELETE), the old cached file is still loaded

---

## 🚨 CRITICAL: Manual Deployment Required

### ⚠️ IMPORTANT NOTICE
**The frontend at `velo.pxxlspace.cv` does NOT auto-deploy from GitHub pushes!**

You have been seeing old cached code because:
1. GitHub commits/pushes do NOT trigger deployment to `velo.pxxlspace.cv`
2. The hosting platform requires **MANUAL file upload**
3. Browser cache may also serve stale files

### 📤 Deployment Steps

#### Option A: Direct File Upload (Recommended)
1. **Download the updated file:**
   - `frontend/index.html` (main file with all changes)

2. **Access your hosting control panel:**
   - Log into your hosting provider for `velo.pxxlspace.cv`
   - Navigate to File Manager / FTP / SSH

3. **Upload the new file:**
   - Replace the old `index.html` with the new one
   - Clear any server-side cache if available

4. **Verify deployment:**
   - Clear browser cache (Ctrl+Shift+Delete)
   - Open chatbot in incognito/private window
   - Check console for version `2.1-LISTINGS-PIN`

#### Option B: FTP Upload
```bash
# Using FileZilla or similar FTP client
Host: ftp.pxxlspace.cv (or your FTP host)
Username: your_username
Password: your_password

Upload: frontend/index.html → /public_html/ (or your web root)
```

#### Option C: SSH/Command Line
```bash
# If you have SSH access
scp frontend/index.html user@pxxlspace.cv:/path/to/webroot/

# Or using rsync
rsync -avz frontend/index.html user@pxxlspace.cv:/path/to/webroot/
```

### 🧹 Clear Cache After Deployment
Users may still see old version due to browser cache:

**For Users:**
```
Chrome/Edge: Ctrl + Shift + Delete → Clear cache
Firefox: Ctrl + Shift + Delete → Clear cache
Safari: Cmd + Option + E
Or: Open in incognito/private window
```

**For You (Testing):**
```
1. Hard refresh: Ctrl + Shift + R (Windows) / Cmd + Shift + R (Mac)
2. Or: Open DevTools → Right-click refresh → Empty Cache and Hard Reload
3. Or: Use incognito mode for clean test
```

---

## 🧪 Testing Checklist

After deployment, test these features:

### Listing Persistence
- [ ] Search for products (e.g., "Samsung phone")
- [ ] Verify listing cards appear with images
- [ ] Navigate to a different conversation or refresh
- [ ] Go back to that conversation from sidebar
- [ ] ✅ Listing cards should still appear

### Pin Conversations
- [ ] Create multiple conversations
- [ ] Hover over a conversation → pin icon (⭐) appears
- [ ] Click pin → conversation moves to top
- [ ] Pin icon turns yellow
- [ ] Blue left border appears
- [ ] Refresh page → pin persists
- [ ] Click pin again → unpins and moves back

### Delete Conversations (Previous Fix)
- [ ] Delete a conversation → custom modal appears (not browser confirm)
- [ ] Confirm deletion → conversation disappears
- [ ] Refresh → stays deleted

### Dark Mode (Previous Fix)
- [ ] Parent site (velontri.pxxl.click) has dark mode toggle
- [ ] Toggle parent site dark mode
- [ ] Chatbot should sync automatically
- [ ] No manual toggle in chatbot

---

## 📊 Database Schema Requirements

Ensure your `conversations` table has these columns:

```sql
CREATE TABLE conversations (
  conversation_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  title TEXT,
  summary TEXT,
  is_active BOOLEAN DEFAULT true,
  is_pinned BOOLEAN DEFAULT false,  -- ⭐ Required for pin feature
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Index for faster queries
CREATE INDEX idx_conversations_session_pinned 
ON conversations(session_id, is_active, is_pinned DESC, updated_at DESC);
```

The `messages` table should have:

```sql
CREATE TABLE messages (
  message_id TEXT PRIMARY KEY,
  conversation_id TEXT REFERENCES conversations(conversation_id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  listings_shown JSONB,  -- Stores listing data
  intent TEXT,
  query_filters JSONB,
  response_time_ms INTEGER,
  token_count INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🐛 Troubleshooting

### Issue: Still seeing old version after deployment
**Symptoms:** Console shows `2.0-FIXED-DELETE` instead of `2.1-LISTINGS-PIN`

**Solutions:**
1. Verify file was actually uploaded to correct location
2. Check hosting panel for file modification timestamp
3. Clear server-side cache if available
4. Clear browser cache completely
5. Test in incognito window
6. Wait 5-10 minutes for CDN propagation (if using CDN)

### Issue: Pin button doesn't work
**Symptoms:** Clicking star does nothing, or error in console

**Check:**
1. Backend API endpoint exists: `PATCH /api/chat/conversations/:id/pin`
2. Database has `is_pinned` column
3. `togglePinConversation` is exported from `db-postgres.js`
4. Console logs for error messages

### Issue: Listings still don't appear in history
**Symptoms:** New searches show listings, but old conversations don't

**Check:**
1. Frontend version is `2.1-LISTINGS-PIN` (not old cached version)
2. Database `messages` table has `listings_shown` column
3. Past messages actually have listings data (query database)
4. Console logs show: "Messages with listings: X" when loading conversation

### Issue: Database errors
**Symptoms:** 500 errors, "column does not exist"

**Solutions:**
```sql
-- Add missing columns if needed
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS listings_shown JSONB;

-- Update existing conversations
UPDATE conversations SET is_pinned = false WHERE is_pinned IS NULL;
```

---

## 📝 API Endpoints Summary

### New in v2.1:
```
PATCH /api/chat/conversations/:id/pin?session_id=xxx
Body: { "is_pinned": true | false }
Response: { "ok": true, "is_pinned": true, "message": "..." }
```

### Existing (Enhanced):
```
GET /api/chat/conversations?session_id=xxx
Response: { 
  "conversations": [
    { 
      "id": "...", 
      "title": "...", 
      "is_pinned": false,  // ⭐ Now included
      "created_at": "...", 
      "updated_at": "..." 
    }
  ] 
}

GET /api/chat/conversations/:id/messages?session_id=xxx
Response: { 
  "messages": [
    { 
      "role": "assistant", 
      "content": "...", 
      "listings_shown": [...],  // Database column name
      "created_at": "..." 
    }
  ] 
}
```

---

## 🎉 Success Criteria

Deployment is successful when:
1. ✅ Console shows version `2.1-LISTINGS-PIN`
2. ✅ Past conversations show listing images
3. ✅ Pin button appears on hover
4. ✅ Pinned conversations stay at top
5. ✅ Pin state persists after refresh
6. ✅ No console errors
7. ✅ Delete conversations still works (custom modal)
8. ✅ Dark mode still syncs with parent site

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check network tab for failed API calls
3. Review server logs for backend errors
4. Verify database schema matches requirements above
5. Ensure environment variables are set (`.env` file)

---

## 🔄 Rollback Plan

If something goes wrong:
1. Keep a backup of old `index.html` before deploying
2. To rollback: re-upload the old file
3. Or: Revert to previous Git commit and re-deploy

---

**Deployed by:** [Your Name]  
**Deployment Date:** [Date/Time]  
**Git Commit:** [Optional - latest commit hash]  
**Notes:** [Any additional deployment notes]

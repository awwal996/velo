# 🌓 Dark Mode Detection - Testing Guide

## 🎯 Goal
The chatbot should automatically detect and sync with the parent website (velontri.pxxl.click) dark mode toggle in real-time, while defaulting to white background.

## 🔧 What Was Fixed

### 1. Enhanced Dark Mode Detection
- Added comprehensive console logging to track every step
- Improved MutationObserver to watch for `class`, `data-theme`, and `style` attribute changes
- Added support for both same-origin and cross-origin iframe scenarios
- Enhanced error handling and debugging information

### 2. Detection Methods

#### Same-Origin (when chatbot and parent are on same domain):
- Automatically detects parent's HTML/Body classes: `.dark`, `.dark-mode`
- Monitors `data-theme="dark"` attribute
- Real-time sync using MutationObserver
- Zero latency - instant detection

#### Cross-Origin (when chatbot and parent are on different domains):
- Falls back to postMessage API
- Listens for `darkModeChange` messages from parent
- Requires parent site to send messages (see integration guide below)

## 🧪 How to Test

### Option 1: Local Test (Recommended)

1. **Start the chatbot frontend:**
   ```powershell
   cd frontend
   node server.js
   ```
   This should run on `http://localhost:3000`

2. **Open the test page:**
   ```
   Open: test-dark-mode.html
   ```
   (Double-click the file or open it in your browser)

3. **Open Browser Console:**
   - Press `F12` or `Ctrl+Shift+I`
   - Go to the "Console" tab

4. **Test the toggle:**
   - Click the "🌙 Toggle Dark Mode" button
   - Watch the console logs - you should see:
     ```
     [Parent] 🔄 Dark mode toggled: true
     [Velo Dark Mode] 🔄 Mutation detected in parent!
     [Velo Dark Mode] ✅ Switched to DARK mode
     ```
   - The chatbot iframe should change from white to dark background
   - Toggle back and forth multiple times to verify sync

5. **What to look for:**
   - ✅ Console shows `[Velo Dark Mode]` messages
   - ✅ Chatbot background changes instantly when you toggle
   - ✅ No errors in console
   - ✅ Smooth transition (0.3s ease animation)

### Option 2: Production Test (velontri.pxxl.click)

1. **Deploy the chatbot** to your production URL

2. **Embed in velontri.pxxl.click** as an iframe

3. **Check the integration:**
   - Open velontri.pxxl.click
   - Open Browser Console (F12)
   - Look for `[Velo Dark Mode]` logs when page loads
   - Toggle the site's dark mode button
   - Verify chatbot syncs

## 🔍 Console Logs Explained

### On Page Load:
```
[Velo] ========================================
[Velo] Chatbot initializing...
[Velo Dark Mode] Starting dark mode detection...
[Velo Dark Mode] Running in iframe: true
[Velo Dark Mode] Successfully accessed parent document (same-origin)
[Velo Dark Mode] Parent HTML classes: dark-mode
[Velo Dark Mode] Dark mode detected: true
[Velo Dark Mode] ✅ Applied dark-mode class
[Velo Dark Mode] ✅ MutationObserver attached and monitoring parent
```

### On Toggle:
```
[Velo Dark Mode] 🔄 Mutation detected in parent!
[Velo Dark Mode] Changed: attributes class HTML
[Velo Dark Mode] Dark mode detected: false
[Velo Dark Mode] ✅ Switched to LIGHT mode
```

## 🚨 Troubleshooting

### Issue: Console shows "Not in iframe"
**Solution:** Make sure you're testing with the `test-dark-mode.html` file, not accessing the chatbot directly.

### Issue: Console shows "Cross-origin iframe detected"
**Cause:** The parent site and chatbot are on different domains.
**Solution:** The parent site needs to send postMessage updates (see integration below).

### Issue: No logs appear at all
**Check:**
1. Browser console is set to show all log levels (not just errors)
2. The chatbot frontend is running on `http://localhost:3000`
3. The iframe `src` in test-dark-mode.html matches your chatbot URL

### Issue: Dark mode doesn't change
**Check:**
1. Look for errors in console
2. Verify parent site uses `.dark-mode` class on `<body>` or `<html>`
3. Check if parent uses a different attribute (like `data-theme`)
4. Inspect the parent HTML: Right-click > Inspect > Check `<html>` and `<body>` attributes

## 🔌 Integration with velontri.pxxl.click

### Method 1: Same-Origin (Easiest)
If the chatbot is served from the same domain (e.g., velontri.pxxl.click/chat):

**No additional code needed!** The chatbot will automatically detect these:
- `<html class="dark">` or `<html class="dark-mode">`
- `<body class="dark">` or `<body class="dark-mode">`
- `<html data-theme="dark">` or `<body data-theme="dark">`

### Method 2: Cross-Origin (Advanced)
If the chatbot is on a different domain (e.g., velontri-chat.com):

**Add this to your dark mode toggle code on velontri.pxxl.click:**

```javascript
// In your dark mode toggle function
function toggleDarkMode() {
  // Your existing toggle code
  document.body.classList.toggle('dark-mode');
  
  // Notify chatbot iframe
  const chatbotIframe = document.querySelector('iframe'); // Adjust selector
  if (chatbotIframe) {
    const isDark = document.body.classList.contains('dark-mode');
    chatbotIframe.contentWindow.postMessage({
      type: 'darkModeChange',
      isDark: isDark
    }, '*'); // Or specify chatbot domain for security
  }
}

// On page load, send initial state
window.addEventListener('load', () => {
  const chatbotIframe = document.querySelector('iframe');
  if (chatbotIframe) {
    chatbotIframe.addEventListener('load', () => {
      const isDark = document.body.classList.contains('dark-mode');
      chatbotIframe.contentWindow.postMessage({
        type: 'darkModeChange',
        isDark: isDark
      }, '*');
    });
  }
});
```

## 📝 CSS Variables Used

The chatbot uses CSS custom properties that automatically update:

**Light Mode (Default):**
- Background: `#FFFFFF` (pure white)
- Text: `#0a0a0a` (almost black)
- Primary: `#4F46E5` (Velontri Blue)

**Dark Mode:**
- Background: `#0a0a0a` (dark)
- Text: `#F8F9FA` (light gray)
- Primary: `#6366F1` (brighter blue)

**Transition:** 0.3s ease on all color changes

## ✅ Success Criteria

- [x] White background by default
- [x] Velontri blue theme (no green)
- [x] Detects parent site dark mode
- [x] Real-time sync with parent toggle
- [x] Works in iframe context
- [x] Comprehensive logging for debugging
- [x] Smooth transitions
- [x] No manual toggle button in chatbot

## 🎉 Next Steps

1. Test locally with `test-dark-mode.html`
2. Verify all console logs appear correctly
3. Deploy to production
4. Test on actual velontri.pxxl.click site
5. If cross-origin, add postMessage code to parent site

---

**Need Help?**
Check the console logs first - they tell you exactly what's happening!

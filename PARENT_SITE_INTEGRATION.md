# 🔗 Parent Site Integration Guide

## For velontri.pxxl.click Integration

This guide shows how to integrate the Velontri chatbot into your parent website (`velontri.pxxl.click`) with full support for dark mode sync and seamless navigation.

---

## 📦 Step 1: Embed the Chatbot

Add this iframe code to your website where you want the chatbot to appear:

```html
<iframe 
  id="velontri-chatbot"
  src="https://your-chatbot-url.onrender.com" 
  style="width: 100%; height: 600px; border: none; border-radius: 12px;"
  allow="clipboard-write"
  title="Velontri Shopping Assistant"
></iframe>
```

**Recommended Styles:**
```css
#velontri-chatbot {
  width: 100%;
  height: 600px;
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

/* Optional: Full-height sidebar style */
.chatbot-sidebar {
  position: fixed;
  right: 0;
  top: 0;
  width: 400px;
  height: 100vh;
  z-index: 1000;
}

.chatbot-sidebar #velontri-chatbot {
  width: 100%;
  height: 100vh;
  border-radius: 0;
}

/* Optional: Modal/overlay style */
.chatbot-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.chatbot-modal #velontri-chatbot {
  width: 90%;
  max-width: 1200px;
  height: 80vh;
  border-radius: 16px;
}
```

---

## 🌓 Step 2: Dark Mode Integration

The chatbot automatically detects these patterns on your site:

### Automatic Detection (No Code Needed)
If your site uses any of these, the chatbot will sync automatically:

```html
<!-- Option 1: Class on HTML -->
<html class="dark-mode">

<!-- Option 2: Class on Body -->
<body class="dark-mode">

<!-- Option 3: Data attribute on HTML -->
<html data-theme="dark">

<!-- Option 4: Data attribute on Body -->
<body data-theme="dark">

<!-- Also detects: .dark class -->
<html class="dark">
<body class="dark">
```

### Manual Integration (Cross-Origin Only)
If the chatbot is on a different domain, add this to your dark mode toggle:

```javascript
// Get reference to chatbot iframe
const chatbotIframe = document.getElementById('velontri-chatbot');

// Your existing dark mode toggle function
function toggleDarkMode() {
  // Your existing toggle code
  document.body.classList.toggle('dark-mode');
  
  // Notify chatbot of theme change
  const isDark = document.body.classList.contains('dark-mode');
  chatbotIframe.contentWindow.postMessage({
    type: 'darkModeChange',
    isDark: isDark
  }, '*'); // Or use specific origin for security
}

// Send initial theme state when chatbot loads
chatbotIframe.addEventListener('load', () => {
  const isDark = document.body.classList.contains('dark-mode');
  chatbotIframe.contentWindow.postMessage({
    type: 'darkModeChange',
    isDark: isDark
  }, '*');
});
```

---

## 🔗 Step 3: Navigation Integration

The chatbot needs to navigate the parent page when users click on listings.

### For Same-Origin (Recommended)
**No code needed!** The chatbot automatically navigates the parent window.

### For Cross-Origin
Add this message listener to handle navigation requests:

```javascript
// Listen for navigation requests from chatbot
window.addEventListener('message', (event) => {
  // Security: Verify origin in production
  // if (event.origin !== 'https://your-chatbot-url.onrender.com') return;
  
  if (event.data && event.data.type === 'navigate') {
    const url = event.data.url;
    
    // Option 1: Direct navigation (seamless UX)
    window.location.href = url;
    
    // Option 2: Optional confirmation (more control)
    // if (confirm('View this listing?')) {
    //   window.location.href = url;
    // }
    
    // Option 3: Open in new tab (fallback)
    // window.open(url, '_blank');
  }
});
```

**Recommended Implementation:**
```javascript
// Add this to your main site JavaScript
(function() {
  const chatbot = document.getElementById('velontri-chatbot');
  
  if (!chatbot) return;
  
  // Handle navigation requests
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'navigate') {
      console.log('Navigating to listing:', event.data.url);
      window.location.href = event.data.url;
    }
  });
  
  // Send initial dark mode state
  chatbot.addEventListener('load', () => {
    const isDark = document.body.classList.contains('dark-mode') || 
                   document.documentElement.classList.contains('dark-mode');
    chatbot.contentWindow.postMessage({
      type: 'darkModeChange',
      isDark: isDark
    }, '*');
  });
})();
```

---

## 🎨 Step 4: Responsive Design

### Desktop Layout
```css
/* Full-width embedded */
.chatbot-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

#velontri-chatbot {
  width: 100%;
  height: 700px;
}
```

### Mobile-Friendly
```css
@media (max-width: 768px) {
  #velontri-chatbot {
    height: 500px;
    border-radius: 8px;
  }
}

/* Full-screen on mobile */
@media (max-width: 768px) {
  .chatbot-modal #velontri-chatbot {
    width: 100%;
    height: 100vh;
    border-radius: 0;
  }
}
```

### Floating Chat Button (Optional)
```html
<!-- Chat button -->
<button id="open-chat-btn" class="floating-chat-btn">
  💬 Chat with Velo
</button>

<!-- Chat overlay -->
<div id="chat-overlay" class="chatbot-modal" style="display: none;">
  <div class="chatbot-container">
    <button id="close-chat-btn">✕</button>
    <iframe id="velontri-chatbot" src="..."></iframe>
  </div>
</div>

<style>
.floating-chat-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4F46E5, #6366F1);
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(79, 70, 229, 0.3);
  z-index: 9998;
  transition: transform 0.2s ease;
}

.floating-chat-btn:hover {
  transform: scale(1.1);
}
</style>

<script>
const openBtn = document.getElementById('open-chat-btn');
const closeBtn = document.getElementById('close-chat-btn');
const overlay = document.getElementById('chat-overlay');

openBtn.addEventListener('click', () => {
  overlay.style.display = 'flex';
  openBtn.style.display = 'none';
});

closeBtn.addEventListener('click', () => {
  overlay.style.display = 'none';
  openBtn.style.display = 'flex';
});
</script>
```

---

## 🔒 Security Best Practices

### 1. Validate Message Origin
```javascript
window.addEventListener('message', (event) => {
  // Whitelist your chatbot domain
  const allowedOrigins = [
    'https://your-chatbot-url.onrender.com',
    'http://localhost:3000' // For local testing
  ];
  
  if (!allowedOrigins.includes(event.origin)) {
    console.warn('Blocked message from unauthorized origin:', event.origin);
    return;
  }
  
  // Process the message
  if (event.data?.type === 'navigate') {
    window.location.href = event.data.url;
  }
});
```

### 2. Content Security Policy
Add this to your HTML `<head>`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="frame-src 'self' https://your-chatbot-url.onrender.com;">
```

### 3. Sandbox Attribute (Optional)
For extra security, add sandbox with required permissions:
```html
<iframe 
  id="velontri-chatbot"
  src="https://your-chatbot-url.onrender.com"
  sandbox="allow-scripts allow-same-origin allow-forms"
></iframe>
```

---

## 🧪 Testing Checklist

### Before Going Live:

- [ ] Chatbot loads in iframe without errors
- [ ] Dark mode syncs when toggling site theme
- [ ] Clicking listings navigates parent page (not new tabs)
- [ ] Mobile responsive (test on real devices)
- [ ] Console shows no CORS errors
- [ ] Message handlers are working (check browser console)
- [ ] Navigation works for all listing types
- [ ] WhatsApp contact buttons still open in new tab (expected)
- [ ] Security: Origin validation is in place
- [ ] Performance: Iframe doesn't slow down page load

### Console Logs to Look For:

```
[Velo Dark Mode] Successfully accessed parent document (same-origin)
[Velo Dark Mode] ✅ Applied dark-mode class
[Velo Nav] ✅ Navigated parent window
```

### Test URLs:
1. `http://localhost:3000` (local testing)
2. `https://your-chatbot-url.onrender.com` (staging)
3. `https://velontri.pxxl.click` (production)

---

## 📊 Analytics Integration (Optional)

Track chatbot interactions:

```javascript
window.addEventListener('message', (event) => {
  if (event.data?.type === 'navigate') {
    // Google Analytics
    gtag('event', 'chatbot_listing_click', {
      'listing_url': event.data.url
    });
    
    // Or custom analytics
    analytics.track('Chatbot Listing Viewed', {
      url: event.data.url
    });
    
    // Navigate
    window.location.href = event.data.url;
  }
});
```

---

## 🆘 Troubleshooting

### Issue: Listings open in new tab
**Check:** Is the navigation message handler installed?
**Fix:** Add the `window.addEventListener('message', ...)` code above

### Issue: Dark mode doesn't sync
**Check:** Console logs for `[Velo Dark Mode]` messages
**Fix:** Ensure your site uses one of the detected patterns or add postMessage integration

### Issue: "Blocked by CORS"
**Cause:** Cross-origin restrictions
**Fix:** Add proper CORS headers on chatbot server, or use postMessage

### Issue: Iframe not visible
**Check:** 
- Iframe has width/height set
- Chatbot URL is accessible
- No CSP blocking iframe

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify chatbot URL is accessible
3. Test with the included `test-dark-mode.html` file locally first

---

## ✅ Quick Start Summary

**Minimal Integration (3 lines of code):**

```html
<!-- 1. Add iframe -->
<iframe id="velontri-chatbot" src="YOUR_CHATBOT_URL" 
        style="width:100%;height:600px;border:none"></iframe>

<!-- 2. Add navigation handler -->
<script>
window.addEventListener('message', e => {
  if (e.data?.type === 'navigate') window.location.href = e.data.url;
});
</script>
```

That's it! Dark mode will work automatically if you use standard classes.

---

**Last Updated:** 2026-08-21
**Version:** 1.0

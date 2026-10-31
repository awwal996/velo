/**
 * Velontri Chatbot Bridge - ONE-LINE INTEGRATION
 * 
 * Add this single line to velontri.pxxl.click:
 * <script src="https://velo.pxxlspace.cv/velontri-chatbot-bridge.js"></script>
 * 
 * Or copy this entire file and host it on velontri.pxxl.click
 */

(function() {
  'use strict';
  
  console.log('[Velontri Bridge] 🌉 Initializing chatbot integration...');
  
  // Configuration
  const CHATBOT_ORIGIN = 'https://velo.pxxlspace.cv';
  const CHECK_INTERVAL = 1000; // Check every 1 second
  
  // Find chatbot iframe
  function getChatbotIframe() {
    return document.querySelector(`iframe[src*="${CHATBOT_ORIGIN}"]`) ||
           document.querySelector('iframe[src*="velo.pxxlspace.cv"]') ||
           document.getElementById('velontri-chatbot') ||
           document.querySelector('iframe[title*="Velo"]');
  }
  
  // Detect dark mode on THIS site (velontri.pxxl.click)
  function isDarkMode() {
    const html = document.documentElement;
    const body = document.body;
    
    return html.classList.contains('dark') ||
           html.classList.contains('dark-mode') ||
           html.classList.contains('theme-dark') ||
           html.getAttribute('data-theme') === 'dark' ||
           html.getAttribute('data-color-scheme') === 'dark' ||
           html.getAttribute('data-mode') === 'dark' ||
           body.classList.contains('dark') ||
           body.classList.contains('dark-mode') ||
           body.classList.contains('theme-dark') ||
           body.getAttribute('data-theme') === 'dark' ||
           body.getAttribute('data-color-scheme') === 'dark' ||
           body.getAttribute('data-mode') === 'dark';
  }
  
  // Send theme to chatbot
  function syncTheme(iframe) {
    if (!iframe || !iframe.contentWindow) return;
    
    const isDark = isDarkMode();
    
    try {
      iframe.contentWindow.postMessage({
        type: 'darkModeChange',
        isDark: isDark
      }, CHATBOT_ORIGIN);
      
      console.log('[Velontri Bridge] 📤 Sent theme to chatbot:', isDark ? 'DARK' : 'LIGHT');
    } catch (err) {
      console.error('[Velontri Bridge] Failed to send message:', err);
    }
  }
  
  // Initialize
  function init() {
    const iframe = getChatbotIframe();
    
    if (!iframe) {
      console.log('[Velontri Bridge] ⏳ Waiting for chatbot iframe...');
      return;
    }
    
    console.log('[Velontri Bridge] ✅ Chatbot iframe found');
    
    // Send initial theme
    iframe.addEventListener('load', function() {
      console.log('[Velontri Bridge] 🔄 Chatbot loaded');
      setTimeout(() => syncTheme(iframe), 500);
    });
    
    // Send theme now if already loaded
    syncTheme(iframe);
    
    // Listen for chatbot requests
    window.addEventListener('message', function(event) {
      if (event.origin !== CHATBOT_ORIGIN) return;
      
      if (event.data && event.data.type === 'requestDarkMode') {
        console.log('[Velontri Bridge] 📨 Chatbot requested theme');
        syncTheme(iframe);
      }
      
      if (event.data && event.data.type === 'navigate') {
        console.log('[Velontri Bridge] 🔗 Navigating to:', event.data.url);
        window.location.href = event.data.url;
      }
    });
    
    // Watch for theme changes on THIS site
    const observer = new MutationObserver(function() {
      console.log('[Velontri Bridge] 🔄 Theme changed on parent site');
      syncTheme(iframe);
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'data-color-scheme', 'data-mode']
    });
    
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'data-color-scheme', 'data-mode']
    });
    
    // Continuous sync (fallback)
    setInterval(() => syncTheme(iframe), CHECK_INTERVAL);
    
    console.log('[Velontri Bridge] ✅ Integration complete');
  }
  
  // Wait for DOM and start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Keep trying to find iframe
  let attempts = 0;
  const maxAttempts = 30; // 30 seconds
  const initInterval = setInterval(function() {
    attempts++;
    
    if (getChatbotIframe()) {
      clearInterval(initInterval);
      init();
    } else if (attempts >= maxAttempts) {
      clearInterval(initInterval);
      console.warn('[Velontri Bridge] ⚠️ Chatbot iframe not found after 30 seconds');
    }
  }, 1000);
  
})();

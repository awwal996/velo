@echo off
echo ========================================
echo  Velontri Chatbot - Dark Mode Testing
echo ========================================
echo.
echo Starting frontend server on http://localhost:3000...
echo.
cd frontend
start cmd /k "node server.js"
timeout /t 3 /nobreak > nul
echo.
echo Opening test page in browser...
start ..\test-dark-mode.html
echo.
echo ========================================
echo  Instructions:
echo  1. Open Browser Console (F12)
echo  2. Click "Toggle Dark Mode" button
echo  3. Watch the console logs
echo  4. Chatbot should sync automatically
echo ========================================
echo.
pause

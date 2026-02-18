@echo off
echo Starting Financial Management System...

echo Launching Backend Server...
start "Backend Server" cmd /k "cd /d "%~dp0server" && npm start"

timeout /t 5

echo Launching Frontend Client...
start "Frontend Client" cmd /k "cd /d "%~dp0client" && npm run dev"

echo System Started! Check the new windows.
pause

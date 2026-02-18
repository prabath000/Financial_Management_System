@echo off
echo Stopping all Node.js and related processes...
taskkill /F /IM node.exe /T
taskkill /F /IM cmd.exe /FI "WINDOWTITLE eq Server*"
taskkill /F /IM cmd.exe /FI "WINDOWTITLE eq Client*"
echo.
echo All Node.js processes stopped.
echo Starting fresh...
timeout /t 2
call start-all.bat

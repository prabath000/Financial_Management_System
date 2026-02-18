@echo off
cd /d "%~dp0server"
echo Seeding database...
node seed.js
pause

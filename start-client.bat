@echo off
echo Script location: "%~dp0"
cd /d "%~dp0client"
if %errorlevel% neq 0 (
    echo Failed to change directory to client folder.
    echo Expected path: "%~dp0client"
    pause
    exit /b
)
echo Current directory: "%CD%"
echo Starting Frontend Client...
npm run dev
pause


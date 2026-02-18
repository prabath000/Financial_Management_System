@echo off
echo Script location: "%~dp0"
cd /d "%~dp0server"
if %errorlevel% neq 0 (
    echo Failed to change directory to server folder.
    echo Expected path: "%~dp0server"
    pause
    exit /b
)
echo Current directory: "%CD%"
echo Starting Backend Server...
npm start
pause

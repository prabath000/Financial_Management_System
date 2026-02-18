@echo off
echo Cleaning up port 5000 and restarting system...

:: Find the process ID using port 5000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    taskkill /f /pid %%a
)

echo Port 5000 cleared.
pause

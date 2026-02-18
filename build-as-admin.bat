@echo off
:: This ensures the window stays open even if the script crashes
if not "%1"=="am_admin" (
    powershell -Command "Start-Process -FilePath '%0' -ArgumentList 'am_admin' -Verb RunAs"
    exit /b
)

echo ====================================================
echo Uswaththa TMS - Cleaning Cache ^& Building
echo ====================================================
echo.

:: Navigate to the script's folder
cd /d "%~dp0"

echo [1/2] Cleaning build cache...
powershell -Command "if (Test-Path '$env:LOCALAPPDATA\electron-builder\Cache') { Remove-Item -Recurse -Force '$env:LOCALAPPDATA\electron-builder\Cache' }"

echo [2/2] Starting build process...
echo.
call npm run electron:build

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed.
) else (
    echo.
    echo [SUCCESS] Build completed! Check 'dist-electron' folder.
)

echo.
echo Press any key to close this window...
pause >nul

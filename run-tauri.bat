@echo off
echo Refreshing environment variables...
call refreshenv >nul 2>&1

echo Adding Cargo to PATH...
set PATH=%USERPROFILE%\.cargo\bin;%PATH%

echo Starting Tauri dev server...
npm run tauri:dev

pause

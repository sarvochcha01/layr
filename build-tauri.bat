@echo off
echo Building Website Builder Desktop App...
echo.

echo Step 1: Building Next.js app...
call npm run build
if %errorlevel% neq 0 (
    echo Failed to build Next.js app
    pause
    exit /b %errorlevel%
)

echo.
echo Step 1.5: Copying static assets to standalone build...
xcopy /E /I /Y "public" ".next\standalone\public"
xcopy /E /I /Y ".next\static" ".next\standalone\.next\static"

echo.
echo Step 2: Building Tauri app...
call npm run tauri build
if %errorlevel% neq 0 (
    echo Failed to build Tauri app
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo Build complete!
echo.
echo Your installer is located at:
echo src-tauri\target\release\bundle\msi\
echo.
echo The executable is at:
echo src-tauri\target\release\website-builder.exe
echo ========================================
echo.

pause

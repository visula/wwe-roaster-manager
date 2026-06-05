@echo off
REM WWE Universe Mode Manager - Quick Start
REM This script starts the application. Run from the project folder.

echo.
echo ========================================
echo WWE Universe Mode Manager
echo Starting Application...
echo ========================================
echo.

REM Check if node_modules exists (dependencies installed)
if not exist "node_modules" (
    echo Dependencies not found. Installing...
    call npm install
    if errorlevel 1 (
        echo Failed to install dependencies.
        pause
        exit /b 1
    )
)

REM Check for required files
if not exist "server\index.js" (
    echo ERROR: server\index.js not found!
    echo Make sure you renamed server-index.js to server\index.js
    pause
    exit /b 1
)

if not exist "public\index.html" (
    echo ERROR: public\index.html not found!
    echo Make sure you renamed public-index.html to public\index.html
    pause
    exit /b 1
)

echo.
echo [OK] Starting server...
echo.
echo Application will be available at:
echo   http://localhost:5000
echo.
echo To stop: Press Ctrl+C
echo.
echo ========================================
echo.

node server/index.js
if errorlevel 1 (
    echo.
    echo ========================================
    echo ERROR: Server exited with an error.
    echo See message above for details.
    echo ========================================
)
pause
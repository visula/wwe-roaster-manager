@echo off
REM WWE Universe Mode Manager - Windows Setup Script

echo.
echo ========================================
echo WWE Universe Mode Manager - Setup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found
node --version

echo.
echo Creating project structure...

REM Create directories
if not exist "server" mkdir server
if not exist "public" mkdir public
if not exist "data" mkdir data

echo [OK] Directories created

echo.
echo Checking for required files...

REM Check for files
if not exist "package.json" (
    echo [ERROR] package.json not found!
    pause
    exit /b 1
)

if not exist "server\db.js" (
    echo [ERROR] server\db.js not found!
    echo Please copy db.js to server folder
    pause
    exit /b 1
)

if not exist "public\index.html" (
    echo [ERROR] public\index.html not found!
    echo Please copy public-index.html to public\index.html
    pause
    exit /b 1
)

echo [OK] All files present

echo.
echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo [OK] Dependencies installed

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the application, run:
echo   npm start
echo.
echo Then open your browser to:
echo   http://localhost:5000
echo.
echo Press any key to exit...
pause >nul

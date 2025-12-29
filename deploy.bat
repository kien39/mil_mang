@echo off
REM Attendance Management System - Windows Deployment Script
REM This script automates Node.js dependency installation and app startup

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ========================================
echo Dai Doi 2 - Quan ly Diem danh
echo Next.js Attendance Management System
echo ========================================
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js found: %NODE_VERSION%

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] npm is not installed!
    echo Please reinstall Node.js.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] npm found: %NPM_VERSION%

echo Project directory: %CD%
echo.

REM Check if data file exists
if not exist "data\detail.xlsx" (
    echo [WARNING] data\detail.xlsx not found
    echo Please ensure your Excel file is in the data folder
    echo.
)

REM Install dependencies
echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to install dependencies
    echo.
    pause
    exit /b 1
)
echo [OK] Dependencies installed successfully
echo.

REM Ask user for deployment mode
:choose_mode
echo Choose deployment mode:
echo.
echo 1 = Development mode (npm run dev)
echo 2 = Production mode (npm run build ^&^& npm start)
echo.
set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" (
    echo.
    echo Starting development server...
    echo The app will be available at: http://localhost:3000
    echo.
    REM Start server in new window and automatically open browser after delay
    start cmd /k "npm run dev"
    echo Waiting for server to start...
    timeout /t 5 /nobreak
    start http://localhost:3000
    echo [OK] Browser opened at http://localhost:3000
    exit /b 0
) else if "%choice%"=="2" (
    echo.
    echo Building for production...
    call npm run build
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Build failed
        echo.
        pause
        exit /b 1
    )
    echo [OK] Build completed successfully
    echo.
    echo Starting production server...
    REM Start server in new window and automatically open browser after delay
    start cmd /k "npm start"
    echo Waiting for server to start...
    timeout /t 5 /nobreak
    start http://localhost:3000
    echo [OK] Browser opened at http://localhost:3000
    exit /b 0
) else (
    echo Invalid choice. Please enter 1 or 2.
    echo.
    goto choose_mode
)

:end
echo.
pause
exit /b 0

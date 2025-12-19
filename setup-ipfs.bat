@echo off
REM BharatVote IPFS Setup Script for Windows
REM This script helps you quickly set up IPFS integration

echo ========================================
echo  BharatVote IPFS Setup
echo ========================================
echo.

REM Check if .env exists
if not exist "backend\.env" (
    echo [1/4] Creating .env file...
    copy backend\.env.example backend\.env
    echo.
    echo ⚠️  IMPORTANT: Edit backend\.env and add your Pinata API keys!
    echo     Visit: https://app.pinata.cloud/
    echo.
    pause
) else (
    echo [✓] .env file already exists
)

echo.
echo [2/4] Installing dependencies...
cd backend
call npm install
cd ..

echo.
echo [3/4] Testing IPFS integration...
node scripts\test-ipfs-integration.js

echo.
echo [4/4] Starting backend with IPFS...
echo.
echo Press Ctrl+C to stop the server
echo.
cd backend
call npm run start:ipfs

pause


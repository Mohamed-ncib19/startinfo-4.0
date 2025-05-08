@echo off
echo Starting StartInfo Platform...

:: Set the current directory as the working directory
cd /d "%~dp0"

:: Stop any running Node.js processes
echo Stopping any running Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 3 /nobreak >nul

:: Start the backend server in a new window
echo Starting backend server...
start "StartInfo Backend" cmd /k "npx tsx src/server/index.ts"

:: Wait for backend to start
timeout /t 5 /nobreak >nul

:: Start the frontend server in a new window
echo Starting frontend server...
start "StartInfo Frontend" cmd /k "npx vite"

echo.
echo Servers are starting up...
echo Frontend will be available at: http://localhost:8080
echo Backend will be available at: http://localhost:5000
echo.
echo Press any key to close all servers...
pause >nul

:: Kill all Node.js processes
echo Stopping servers...
taskkill /F /IM node.exe
echo Servers stopped. 
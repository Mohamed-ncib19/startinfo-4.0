@echo off
echo Fixing StartInfo Platform setup...

:: Set the current directory as the working directory
cd /d "%~dp0"

:: Stop any running Node.js processes
echo Stopping any running Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 3 /nobreak >nul

:: Clean up existing dependencies
echo Cleaning up existing dependencies...
if exist "node_modules" (
    echo Waiting for processes to release files...
    timeout /t 5 /nobreak >nul
    rmdir /s /q "node_modules"
)
if exist "package-lock.json" (
    del "package-lock.json"
)

:: Install dependencies
echo Installing dependencies...
call npm install

:: Install Prisma and its dependencies
echo Installing Prisma and its dependencies...
call npm install prisma @prisma/client --save-dev

:: Clean up Prisma client
echo Cleaning up Prisma client...
if exist "node_modules\.prisma" (
    rmdir /s /q "node_modules\.prisma"
)
if exist "node_modules\@prisma" (
    rmdir /s /q "node_modules\@prisma"
)

:: Generate Prisma client
echo Generating Prisma client...
call npx prisma generate

:: Install additional required packages
echo Installing additional required packages...
call npm install use-callback-ref@latest

:: Start the backend server
echo Starting backend server...
start "StartInfo Backend" cmd /k "npx tsx src/server/index.ts"

:: Wait for backend to start
timeout /t 5 /nobreak >nul

:: Start the frontend server
echo Starting frontend server...
start "StartInfo Frontend" cmd /k "npx vite"

echo.
echo Setup completed successfully!
echo Frontend will be available at: http://localhost:8080
echo Backend will be available at: http://localhost:5000
echo.
echo Press any key to close all servers...
pause >nul

:: Kill all Node.js processes
echo Stopping servers...
taskkill /F /IM node.exe
echo Servers stopped. 
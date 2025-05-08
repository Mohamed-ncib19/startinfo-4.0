@echo off
echo Setting up the project...

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

:: Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo npm is not installed. Please install npm first.
    pause
    exit /b 1
)

:: Clean up any existing node_modules
echo Cleaning up existing dependencies...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

:: Install dependencies
echo Installing dependencies...
call npm install --no-package-lock
if %ERRORLEVEL% neq 0 (
    echo Failed to install dependencies
    pause
    exit /b 1
)

:: Install Prisma CLI
echo Installing Prisma CLI...
call npm install prisma @prisma/client --save-dev
if %ERRORLEVEL% neq 0 (
    echo Failed to install Prisma CLI
    pause
    exit /b 1
)

:: Check if Prisma is already initialized
if exist prisma\schema.prisma (
    echo Prisma is already initialized. Validating schema...
    call npx prisma validate
    if %ERRORLEVEL% neq 0 (
        echo Prisma schema validation failed
        pause
        exit /b 1
    )
) else (
    echo Initializing Prisma...
    call npx prisma init
    if %ERRORLEVEL% neq 0 (
        echo Failed to initialize Prisma
        pause
        exit /b 1
    )
)

:: Generate Prisma Client
echo Generating Prisma Client...
call npx prisma generate
if %ERRORLEVEL% neq 0 (
    echo Failed to generate Prisma Client
    pause
    exit /b 1
)

:: Check if migrations exist
if exist prisma\migrations (
    echo Running database migrations...
    call npx prisma migrate deploy
    if %ERRORLEVEL% neq 0 (
        echo Failed to run database migrations
        pause
        exit /b 1
    )
) else (
    echo Creating initial migration...
    call npx prisma migrate dev --name init --create-only
    if %ERRORLEVEL% neq 0 (
        echo Failed to create initial migration
        pause
        exit /b 1
    )
    echo Applying initial migration...
    call npx prisma migrate deploy
    if %ERRORLEVEL% neq 0 (
        echo Failed to apply initial migration
        pause
        exit /b 1
    )
)

:: Format code
echo Formatting code...
call npm run format
if %ERRORLEVEL% neq 0 (
    echo Warning: Code formatting failed
)

:: Start the development server
echo Starting development server...
call npm run dev
if %ERRORLEVEL% neq 0 (
    echo Failed to start development server
    pause
    exit /b 1
)

pause 
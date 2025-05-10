@echo off
REM Windows batch script to start the DIY Formulations app on port 3000

echo ========================================
echo    DIY Formulations - Port 3000 Setup
echo ========================================

REM Check if port 3000 is already in use and kill it if needed
echo [%time%] Checking if port 3000 is available...
netstat -ano | findstr :3000 | findstr LISTENING
if %ERRORLEVEL% EQU 0 (
  echo [WARNING] Port 3000 is already in use. Attempting to free it...
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Killing process with PID %%a
    taskkill /F /PID %%a
  )
  timeout /t 1 /nobreak > nul
  echo [SUCCESS] Port 3000 is now available
) else (
  echo [SUCCESS] Port 3000 is available
)

REM Clear cache for a fresh start
echo [%time%] Clearing cache...
if exist .next\cache rd /s /q .next\cache
if exist node_modules\.cache rd /s /q node_modules\.cache
echo [SUCCESS] Cache cleared

REM Create logs directory
if not exist logs mkdir logs

REM Set up required environment variables
echo [%time%] Setting up environment variables...
set PORT=3000
set NEXT_PUBLIC_PORT=3000
set NEXT_PUBLIC_UI_MODE=terminal
set NEXT_PUBLIC_ENABLE_MODULES=true
set NEXT_PUBLIC_ENABLE_RECIPE_VERSIONING=true
set NEXT_PUBLIC_TERMINAL_UI_ENABLED=true
set NODE_OPTIONS=--max-old-space-size=4096

REM Check if we should use mock data
if "%1"=="--use-mock-data" (
  echo [%time%] Mock data mode enabled
  set NEXT_PUBLIC_USE_MOCK_DATA=true
) else (
  if "%1"=="-m" (
    echo [%time%] Mock data mode enabled
    set NEXT_PUBLIC_USE_MOCK_DATA=true
  ) else (
    set NEXT_PUBLIC_USE_MOCK_DATA=false
  )
)

REM Check if we want development auth
if "%1"=="--dev-auth" (
  echo [%time%] Development authentication enabled
  set NEXT_PUBLIC_AUTO_DEV_LOGIN=true
) else (
  if "%2"=="--dev-auth" (
    echo [%time%] Development authentication enabled
    set NEXT_PUBLIC_AUTO_DEV_LOGIN=true
  ) else (
    set NEXT_PUBLIC_AUTO_DEV_LOGIN=false
  )
)

echo [%time%] Starting application on port 3000...
echo ----------------------------------------
echo   Environment Configuration:
echo   - Port: 3000
echo   - UI Mode: %NEXT_PUBLIC_UI_MODE%
echo   - Mock Data: %NEXT_PUBLIC_USE_MOCK_DATA%
echo   - Dev Auth: %NEXT_PUBLIC_AUTO_DEV_LOGIN%
echo   - Modules: %NEXT_PUBLIC_ENABLE_MODULES%
echo   - Recipe Versioning: %NEXT_PUBLIC_ENABLE_RECIPE_VERSIONING%
echo ----------------------------------------

REM Run application with explicit port setting
npx next dev -p 3000

REM This will only execute if next dev fails
echo [ERROR] Application failed to start properly
exit /b 1
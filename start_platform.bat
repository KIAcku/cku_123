@echo off
chcp 65001 > nul 2>&1
title MaumIum Platform Starter

echo.
echo  =====================================================
echo     MaumIum - Student Care Platform
echo  =====================================================
echo.

:: Python check
set PYTHON_EXE=C:\Users\User\AppData\Local\Programs\Python\Python39\python.exe
if not exist "%PYTHON_EXE%" (
    set PYTHON_EXE=python
)

:: Node check
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install from https://nodejs.org
    pause
    exit /b
)

:: ---- Backend ----
echo [1/3] Setting up Backend...
cd /d "%~dp0backend"

if not exist "venv" (
    echo   Creating virtual environment...
    "%PYTHON_EXE%" -m venv venv
)

echo   Installing Python packages...
call venv\Scripts\pip.exe install -r requirements.txt -q

echo   Starting FastAPI server (port 8000)...
start "Backend - FastAPI" cmd /k "cd /d %~dp0backend && venv\Scripts\uvicorn.exe app.main:app --reload --host 0.0.0.0 --port 8000"

:: ---- Frontend ----
echo [2/3] Setting up Frontend...
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo   Installing npm packages (first time, may take a few minutes)...
    call npm install
)

echo   Starting Next.js server (port 3000)...
start "Frontend - Next.js" cmd /k "cd /d %~dp0frontend && npm run dev"

:: ---- Wait & Open ----
echo [3/3] Waiting for servers to start...
timeout /t 5 /nobreak > nul

echo.
echo  =====================================================
echo   Platform is starting!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo  =====================================================
echo.

start "" "http://localhost:3000"

echo   Press any key to close this window...
pause > nul

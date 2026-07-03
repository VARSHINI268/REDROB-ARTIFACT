@echo off
echo Starting REDROB ARTIFACT...
echo.
echo Starting Backend (Node.js/Express)...
cd backend
call npm install --silent
start "REDROB Backend" npm start

echo.
echo Starting Frontend (React)...
cd ..\frontend
call npm install --silent
start "REDROB Frontend" npm start

echo.
echo ================================================
echo [OK] REDROB ARTIFACT is starting...
echo    Backend: http://localhost:5000
echo    Frontend: http://localhost:3000
echo ================================================
echo.

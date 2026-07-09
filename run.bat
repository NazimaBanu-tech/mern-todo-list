@echo off
title PriorityFlow Run Utility
echo Starting PriorityFlow App...

echo [1/2] Launching Backend Server...
start cmd /k "cd todo-calendar-app\backend && npm run dev"

echo [2/2] Launching Frontend Client...
start cmd /k "cd frontend && npm run dev"

echo Waiting for Vite server to start...
timeout /t 3 /nobreak >nul

echo Opening PriorityFlow in the browser...
start http://localhost:5173

echo All systems running! Check the launched terminal windows for server logs.
pause

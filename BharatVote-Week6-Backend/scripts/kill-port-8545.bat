@echo off
REM Batch script to kill process on port 8545
REM Usage: scripts\kill-port-8545.bat

echo Checking for processes on port 8545...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8545') do (
    echo Found process on port 8545: PID %%a
    echo Killing process...
    taskkill /F /PID %%a
    echo Process killed successfully
    goto :done
)

echo Port 8545 is free
:done
pause


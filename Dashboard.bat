@echo off
title Lights Dashboard
cd /d "%~dp0"
set "PYTHONIOENCODING=utf-8"

rem `python` on this machine is the Microsoft Store stub, which prints an advert
rem and exits. Use the real interpreter, and only fall back to the PATH if it
rem has moved.
set "PY=D:\Apps\Python312\python.exe"
if not exist "%PY%" (
  where py >nul 2>&1 && (set "PY=py") || (set "PY=python")
)

echo Starting the lights dashboard...
echo.
echo   Here          http://127.0.0.1:8790/
echo   On the wall   run admin-open-port.ps1 once, then use this laptop's
echo                 192.168.x.x address on the tablet.
echo.
echo   Close this window to stop the server.
echo.
"%PY%" serve.py
pause

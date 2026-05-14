@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Файли Романа Горіна — локальний сервер
echo.
echo ============================================================
echo   Файли Романа Горіна
echo   Сервер запускається на http://localhost:8080
echo   Не закривай це вікно поки користуєшся сайтом.
echo ============================================================
echo.

REM Чекаємо 1 секунду і відкриваємо браузер
start "" http://localhost:8080/

REM Пробуємо різні способи запустити python
where py >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    py -3 -m http.server 8080
    goto :end
)

where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    python -m http.server 8080
    goto :end
)

where python3 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    python3 -m http.server 8080
    goto :end
)

echo.
echo [ПОМИЛКА] Python не знайдено в PATH.
echo Встанови Python з https://www.python.org/downloads/
echo Обов'язково постав галочку "Add Python to PATH" під час установки.
echo Або в командному рядку:   winget install Python.Python.3
echo.
pause

:end

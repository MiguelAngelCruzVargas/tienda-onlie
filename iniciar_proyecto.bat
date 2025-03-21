@echo off
title Tienda de Rines - Desarrollo
echo Iniciando proyecto Tienda de Rines...

REM Verificar si npm está instalado
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: npm no está instalado. Por favor, instala Node.js.
    pause
    exit /b 1
)

REM Cambiar al directorio del proyecto
cd /d "%~dp0"

REM Instalar dependencias (opcional, comentar si ya están instaladas)
echo Instalando dependencias (si es necesario)...
npm install

REM Iniciar proyecto en modo desarrollo
echo Iniciando proyecto en modo desarrollo...
start cmd /k "npm run dev:frontend"
start cmd /k "npm run dev:backend"

echo Proyecto iniciado. Revisa las ventanas de comandos.
pause
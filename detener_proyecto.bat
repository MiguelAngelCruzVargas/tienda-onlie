@echo off
title Detener Proyecto Tienda de Rines

echo Deteniendo procesos del proyecto...

REM Matar procesos de Node
taskkill /F /IM node.exe /T
taskkill /F /IM npm.cmd /T

echo Procesos detenidos.
pause
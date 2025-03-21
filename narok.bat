@echo off
title Exponer Proyecto con Ngrok

echo Exponiendo servidor backend con Ngrok...

REM Exponer puerto 3000 (backend)
ngrok http 3000

pause
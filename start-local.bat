@echo off
title NutriMart AI - Local Preview
cd /d "%~dp0"
start "" http://localhost:5500
python -m http.server 5500
pause

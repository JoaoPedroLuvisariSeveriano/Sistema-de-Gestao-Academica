@echo off
cd /d "%~dp0backend"
npx ts-node src/seed.ts
pause

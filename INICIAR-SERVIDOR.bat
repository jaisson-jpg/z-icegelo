@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   Z-ice Gelo - Servidor local
echo ========================================
echo.
echo Acesse no PC:  http://localhost:3000
echo.
echo Mantenha esta janela aberta enquanto usar o site.
echo Para parar: feche esta janela ou pressione Ctrl+C
echo.

npm run dev

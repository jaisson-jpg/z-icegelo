@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   Z-ice Gelo - Abrindo site no PC
echo ========================================
echo.

REM Verifica se o servidor ja esta rodando na porta 3000
powershell -Command "try { (Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 2).StatusCode } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
    echo Servidor nao encontrado. Iniciando...
    echo Aguarde alguns segundos e o navegador abrira.
    echo.
    start "Z-ice Servidor" cmd /k "cd /d \"%~dp0\" && npm run dev"
    timeout /t 8 /nobreak >nul
) else (
    echo Servidor ja esta rodando.
)

echo Abrindo: http://localhost:3000
start "" "http://localhost:3000"

echo.
echo No PC use:     http://localhost:3000
echo Na rede Wi-Fi: http://192.168.100.21:3000
echo   (o IP pode mudar - veja no terminal ao iniciar o servidor)
echo.
echo Admin: http://localhost:3000/admin
echo Login: admin@zicegelo.com.br / admin123
echo.
pause

@echo off
chcp 65001 >nul
title Criar ZIP do site Z-ICEGELO

cd /d "%~dp0"

echo.
echo ==========================================
echo   CRIANDO ZIP DO SITE Z-ICEGELO
echo ==========================================
echo.
echo Nao serao incluidos:
echo - node_modules
echo - .next
echo - .netlify
echo - android
echo - .env
echo - .git
echo - tsconfig.tsbuildinfo
echo.

if exist "Z-ICEGELO-ATUALIZADO.zip" del /f /q "Z-ICEGELO-ATUALIZADO.zip"

tar -a -c -f "Z-ICEGELO-ATUALIZADO.zip" ^
  --exclude="node_modules" ^
  --exclude=".next" ^
  --exclude=".netlify" ^
  --exclude="android" ^
  --exclude=".env" ^
  --exclude=".git" ^
  --exclude="tsconfig.tsbuildinfo" ^
  --exclude="Z-ICEGELO-ATUALIZADO.zip" ^
  .

if exist "Z-ICEGELO-ATUALIZADO.zip" (
    echo.
    echo ==========================================
    echo   PRONTO!
    echo ==========================================
    echo.
    echo Foi criado:
    echo Z-ICEGELO-ATUALIZADO.zip
    echo.
    echo Agora arraste esse ZIP para o ChatGPT.
) else (
    echo.
    echo ERRO: nao foi possivel criar o ZIP.
    echo Me mande uma foto desta tela.
)

echo.
pause

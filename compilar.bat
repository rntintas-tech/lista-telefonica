@echo off
REM Script para compilar automaticamente o projeto

echo ========================================
echo  COMPILADOR LISTA TELEFONICA RN TINTAS
echo ========================================
echo.

REM Verificar se está no venv
python --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Python nao encontrado!
    echo Por favor, ative seu venv primeiro.
    pause
    exit /b 1
)

echo [1/4] Testando se PyInstaller esta instalado...
pip show pyinstaller >nul 2>&1
if errorlevel 1 (
    echo PyInstaller nao encontrado. Instalando...
    pip install pyinstaller
)

echo.
echo [2/4] Limpando compilacoes antigas...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
if exist *.spec del /q *.spec

echo.
echo [3/4] Compilando Python para .exe...
echo (Isso pode demorar 1-2 minutos)
pyinstaller --onefile --windowed --name "Lista Telefonica RN Tintas" app.py

if not exist "dist\Lista Telefonica RN Tintas.exe" (
    echo.
    echo ERRO: Compilacao falhou!
    pause
    exit /b 1
)

echo.
echo [4/4] Verificando resultado...
if exist "dist\Lista Telefonica RN Tintas.exe" (
    echo.
    echo ========================================
    echo  SUCESSO!
    echo ========================================
    echo.
    echo O executavel foi criado em:
    echo dist\Lista Telefonica RN Tintas.exe
    echo.
    echo PROXIMOS PASSOS:
    echo 1. Teste o .exe clicando nele
    echo 2. Abra o Inno Setup
    echo 3. Compile o instalador.iss
    echo.
) else (
    echo ERRO: Nao foi possivel criar o .exe
)

pause

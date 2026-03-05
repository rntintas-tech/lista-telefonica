@echo off
echo.
echo  =====================================
echo   COMPILADOR MSI - Lista Telefonica
echo  =====================================
echo.

where wix >nul 2>&1
if errorlevel 1 (
    echo ERRO: Comando "wix" nao encontrado no PATH.
    pause
    exit /b 1
)

if not exist "dist\Lista Telefonica RN Tintas.exe" (
    echo ERRO: Executavel nao encontrado!
    echo Execute compilar.bat primeiro para gerar o .exe
    pause
    exit /b 1
)

if not exist "instalador" mkdir instalador

echo [1/1] Compilando MSI...
echo.

wix build instalador.wxs -ext WixToolset.UI.wixext -o "instalador\Lista_Telefonica_RN_Tintas.msi"

if errorlevel 1 (
    echo.
    echo ERRO na compilacao. Veja a mensagem acima.
    pause
    exit /b 1
)

echo.
echo  =====================================
echo   SUCESSO!
echo  =====================================
echo.
echo  MSI criado em:
echo  instalador\Lista_Telefonica_RN_Tintas.msi
echo.
pause

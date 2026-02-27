; Script para Inno Setup - Cria instalador profissional Windows
; Baixe Inno Setup em: https://jrsoftware.org/isdl.php

#define MyAppName "Lista Telefônica RN Tintas"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "RN Tintas"
#define MyAppURL "https://rntintas-tech.github.io/lista-telefonica/"
#define MyAppExeName "Lista Telefonica RN Tintas.exe"

[Setup]
; Informações básicas
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
OutputBaseFilename=Instalador_Lista_Telefonica_RN_Tintas
Compression=lzma
SolidCompression=yes
WizardStyle=modern

; Ícone do instalador (opcional)
; SetupIconFile=icon.ico

; Privilégios
PrivilegesRequired=lowest

; Diretórios
OutputDir=instalador
SourceDir=.

; Idioma
ShowLanguageDialog=no

[Languages]
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

[Tasks]
Name: "desktopicon"; Description: "Criar atalho na Área de Trabalho"; GroupDescription: "Atalhos:"
Name: "quicklaunchicon"; Description: "Criar atalho na Barra de Tarefas"; GroupDescription: "Atalhos:"; Flags: unchecked

[Files]
; O executável que você compilou com PyInstaller
Source: "dist\Lista Telefonica RN Tintas.exe"; DestDir: "{app}"; Flags: ignoreversion
; Adicione outros arquivos se necessário
; Source: "README.txt"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
; Atalho no Menu Iniciar
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Desinstalar {#MyAppName}"; Filename: "{uninstallexe}"

; Atalho na Área de Trabalho (se o usuário escolher)
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

; Atalho na Barra de Tarefas (se o usuário escolher)
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: quicklaunchicon

[Run]
; Pergunta se quer executar após instalar
Filename: "{app}\{#MyAppExeName}"; Description: "Executar {#MyAppName} agora"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
; Remove atalhos ao desinstalar
Type: files; Name: "{autodesktop}\{#MyAppName}.lnk"
Type: files; Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\{#MyAppName}.lnk"

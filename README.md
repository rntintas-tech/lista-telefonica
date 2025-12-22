# Lista Telefônica - RN Tintas

Sistema web de lista telefônica interna para facilitar a comunicação entre colaboradores da RN Tintas.

## 📋 Sobre o Projeto

Este projeto é uma aplicação web responsiva que exibe a lista telefônica interna da empresa, organizada por departamentos. Os dados são carregados dinamicamente de uma planilha Google Sheets, permitindo fácil atualização sem necessidade de modificar código.

## ✨ Funcionalidades

- 🔍 **Busca em tempo real** - Pesquise por nome, departamento ou telefone
- 📱 **Design responsivo** - Funciona perfeitamente em desktop e mobile
- 📞 **Ações rápidas** - Copiar número, ligar diretamente (mobile) ou abrir WhatsApp
- 📧 **Informações completas** - Visualize e-mail e atribuições de cada contato
- 🎨 **Interface moderna** - Design limpo com animações suaves
- 📊 **Organização por departamento** - Contatos agrupados de forma intuitiva

## 🚀 Tecnologias Utilizadas

- HTML5
- CSS3 (com variáveis CSS e animações)
- JavaScript Vanilla
- Google Sheets API
- Bootstrap Icons

## 🎯 Recursos Implementados

### Interface de Usuário

- Header com logo e legenda de ícones
- Campo de busca com contador de resultados
- Cards de departamento com expansão/recolhimento
- Modal de informações detalhadas
- Toast notifications para feedback ao usuário
- Loading state durante carregamento de dados

### Funcionalidades de Contato

- **Botão Info**: Exibe modal com atribuições e e-mail
- **Botão E-mail**: Abre cliente de e-mail com destinatário pré-preenchido
- **Botão Copiar/Ligar**:
  - Desktop: Copia número para área de transferência
  - Mobile: Inicia ligação telefônica
- **Botão WhatsApp**: Abre conversa no WhatsApp Web/App

### Otimizações

- Busca otimizada com debounce
- Feedback visual em todas as interações
- Ordenação automática de departamentos
- Tratamento de erros de carregamento

## 📂 Estrutura do Projeto

```
lista-telefonica/
│
├── index.html          # Estrutura HTML principal
├── styles.css          # Estilos e animações
├── scripts.js          # Lógica da aplicação
└── README.md           # Este arquivo
```

## 📊 Formato da Planilha

A planilha deve conter as seguintes colunas:

- Nome
- Telefone/Ramal
- Departamento
- Atribuições
- E-mail
- Ordem (para ordenação dos grupos)

## 🎨 Personalização

As cores e estilos podem ser facilmente personalizados através das variáveis CSS no arquivo `styles.css`:

```css
:root {
    --primary-color: #001564;
    --accent-color: #ff6b35;
    /* ... outras variáveis */
}
```

## 📱 Compatibilidade

- ✅ Chrome/Edge (versões recentes)
- ✅ Firefox (versões recentes)
- ✅ Safari (versões recentes)
- ✅ Dispositivos móveis (iOS/Android)

## 📄 Licença

Este projeto é de uso interno da RN Tintas.

Desenvolvido para RN Tintas - 2025

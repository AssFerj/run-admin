# 🏃‍♂️ Race Day Core | Sistema de Gestão Esportiva

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
</div>

<br />

**Race Day Core (Race Admin)** é um sistema web completo e moderno construído para o gerenciamento de eventos esportivos e corridas de rua. Ele combina uma **Landing Page de alta conversão** com estética visual premium (Cyberpunk/Neon) e um **Painel Administrativo em tempo real** para controle total da operação do evento.

---

## ✨ Principais Funcionalidades

### 🌐 Landing Page Pública
- **Design Premium & Dinâmico**: Estética moderna com elementos em *glassmorphism*, cortes diagonais (`slant-cut`), *neon-glows* e animações fluidas baseadas em *Framer Motion*.
- **Inscrição Simples e Rápida**: Formulário de inscrição interativo integrado diretamente com o banco de dados.
- **Responsividade Total**: Layout totalmente adaptado para qualquer dispositivo (Celulares, Tablets e Desktops).
- **Informativos Claros**: Seções de percurso, largada, solidariedade (arrecadação de alimentos) e informações sobre os kits.

### ⚙️ Painel Administrativo (Admin)
- **Live Monitoring Dashboard**: Acompanhe o número de inscritos, status de entregas de kits e arrecadações em tempo real.
- **Gestão de Inscrições (Atletas)**:
  - Tabela com filtros dinâmicos e instantâneos (Sem botão "Buscar").
  - Ações rápidas: *Checkout* de Kit (entrega) em um clique.
  - Inserção de inscrições manuais, edição de dados e exclusão de cadastros.
- **Exportação de Dados (CSV)**: Exporte planilhas prontas, já formatadas e separadas por ponto-e-vírgula para perfeita abertura no Excel/Google Sheets. (Permite exportação com base em filtros).
- **Gestão de Categorias e Kits**: Cadastre, edite e vincule categorias da corrida e kits do evento.
- **Módulo de Sorteios**: (Em Desenvolvimento) - Gestão e realização de sorteios e prêmios para os atletas.
- **Segurança e Acesso**: Interface de administração de usuários para controle de quem acessa o painel.

---

## 🚀 Tecnologias Utilizadas

Este projeto foi desenhado utilizando o que há de mais moderno no ecossistema Web:

- **[Next.js](https://nextjs.org/)** (App Router) - Framework React para estrutura e rotas da aplicação.
- **[React](https://reactjs.org/)** - Biblioteca de UI e gerenciamento de estado.
- **[Tailwind CSS](https://tailwindcss.com/)** - Estilização utilitária super-rápida, customizada com classes neon exclusivas.
- **[Firebase Firestore](https://firebase.google.com/)** - Banco de dados NoSQL Serverless para sincronização de dados em **Tempo Real** (`onSnapshot`).
- **[Framer Motion](https://www.framer.com/motion/)** - Motor de animações complexas baseadas em scroll e interações do usuário.
- **[Lucide React](https://lucide.dev/)** - Ícones consistentes e bonitos.

---

## 🛠️ Como Executar o Projeto Localmente

Siga os passos abaixo para rodar a aplicação na sua máquina:

### 1. Pré-requisitos
- Ter o **Node.js** (v18+) instalado.
- Ter o **Git** instalado.
- Criar um projeto no **Firebase** e obter as credenciais do SDK Web.

### 2. Clonando o Repositório
```bash
git clone git@github.com:AssFerj/run-admin.git
cd run-admin
```

### 3. Instalando as Dependências
```bash
npm install
# ou
yarn install
```

### 4. Configuração das Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto e adicione suas credenciais do Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

### 5. Iniciando o Servidor de Desenvolvimento
```bash
npm run dev
# ou
yarn dev
```
O servidor será iniciado na porta **3000**. Acesse:
- **Landing Page**: `http://localhost:3000`
- **Painel Admin**: `http://localhost:3000/admin`

---

## 📐 Estrutura de Diretórios e Arquitetura
O sistema segue o modelo estrutural do Next.js App Router:
- `/src/app/page.tsx` - Landing Page interativa contendo informações e formulário de inscrição.
- `/src/app/admin/page.tsx` - Aplicação Admin do tipo SPA (Single Page Application) com abas reativas.
- `/src/app/globals.css` - Contém todas as abstrações, paletas e estilos utilitários customizados (Neon UI).

---

## 🛡️ Licença e Direitos Autorais
Todos os direitos reservados.
Desenvolvido e operado pela organização **AssFerj** / **Race Day Core**.

---
<p align="center">
  Desenvolvido com ⚡ energia e ☕ café.
</p>

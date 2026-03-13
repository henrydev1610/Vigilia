![Vigilia](frontend/assets/vigilia_collage_grid.jpg)

# Vigilia

Vigilia e um projeto de monitoramento de gastos parlamentares com foco em transparencia, exploracao de dados e acompanhamento de deputados federais. O repositorio esta organizado como um monorepo com backend em Node.js/Fastify e aplicativo mobile em React Native com Expo.

## O que o projeto faz

- consulta e organiza dados de deputados e despesas parlamentares
- oferece dashboard com visao consolidada dos gastos
- permite explorar parlamentares por busca, filtros, ranking e detalhes
- inclui autenticacao de usuarios e area de favoritos
- integra dados externos da Camara dos Deputados e expoe uma API propria para o app

## Arquitetura

### `backend/`

API REST em TypeScript com:

- Fastify
- Prisma
- PostgreSQL
- Redis
- JWT
- Zod
- Docker Compose

Principais responsabilidades:

- autenticacao e gerenciamento de usuario
- listagem e sincronizacao de deputados
- consulta de despesas e agregacoes
- ranking de gastos
- dashboard resumido para o aplicativo

### `frontend/`

Aplicativo mobile em React Native com Expo, com foco em:

- dashboard inicial
- exploracao de deputados
- ranking de gastos
- detalhes por deputado e por despesa
- login, cadastro e preferencias do usuario

## Estrutura do repositorio

```text
vigilia/
|- backend/     # API, banco, cache e integracoes
|- frontend/    # app mobile Expo / React Native
|- references/  # materiais de apoio
```

## Como rodar localmente

### 1. Subir o backend

Entre em `backend/`, crie o arquivo `.env` a partir de `.env.example` e inicie os servicos com Docker:

```bash
cd backend
docker compose up --build
```

API disponivel em:

```text
http://localhost:3334
```

### 2. Configurar e iniciar o app mobile

Entre em `frontend/`, crie o arquivo `.env` a partir de `.env.example` e ajuste a URL da API para o IP local da sua maquina:

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3334
```

Depois inicie o app:

```bash
cd frontend
npm install
npm run start:clean
```

Observacoes importantes:

- celular e computador precisam estar na mesma rede
- `localhost` nao funciona no celular fisico para acessar a API do host
- o endpoint `GET /health` pode ser usado para validar a conexao
- login com Google exige configurar `GOOGLE_WEB_CLIENT_ID` no backend e `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` no app
- para iOS, configure tambem o reversed client ID em `EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME`

## Endpoints principais

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /auth/me`
- `GET /api/deputados`
- `GET /api/deputados/:id`
- `GET /api/deputados/:id/despesas`
- `GET /api/ranking/ceap`
- `GET /api/favoritos`

## Tecnologias

- React Native
- Expo
- TypeScript
- Fastify
- Prisma
- PostgreSQL
- Redis
- Docker

## Objetivo

O projeto busca transformar dados publicos em uma experiencia de consulta mais clara, acessivel e util para acompanhamento de atividade parlamentar no Brasil.

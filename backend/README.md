# Backend - Gastos de Deputados

API REST em Node.js + TypeScript com Fastify, Prisma, PostgreSQL e Redis.

## Stack
- Node.js + TypeScript
- Fastify
- Prisma + PostgreSQL
- Redis
- JWT
- Zod
- Docker Compose

## Fluxo oficial (Docker-first)

Este projeto foi preparado para funcionar mesmo com **Node v24 no host Windows**.

Regra pratica:
- **Nao rode `npm install` no host**.
- Rode tudo pelo Docker (Node 20 LTS dentro do container).

### Rodando com Node 24 (Windows)
1. `Copy-Item .env.example .env -Force`
2. `docker compose build --no-cache`
3. `docker compose up`

A API sobe em `http://localhost:3334`.

## Comandos DX via Docker

Scripts no `package.json` que nao dependem de Node local:
- `npm run dev:docker`
- `npm run logs:docker`
- `npm run prisma:migrate:docker`
- `npm run prisma:generate:docker`
- `npm run db:reset:docker`
- `npm run seed:docker`

Equivalentes PowerShell:
- `scripts/dev.ps1`
- `scripts/migrate.ps1`
- `scripts/seed.ps1`

## Migrations e seed

O container da API executa no startup:
- espera Postgres e Redis
- roda `prisma migrate deploy`
- roda seed se `SEED=true`

Variaveis relevantes no `docker-compose.yml`:
- `RUN_MIGRATIONS=true`
- `SEED=false`
- `WAIT_FOR_DB=true`
- `WAIT_FOR_REDIS=true`

## Deploy no Dokploy (producao)

Pontos criticos para evitar erro Prisma `P1001`:
- `DATABASE_URL` deve usar o hostname interno do servico Postgres no Dokploy (normalmente o nome do servico: `postgres`).
- nao use `HOST` placeholder nem `localhost` em producao.
- API e Postgres/Redis precisam estar no mesmo projeto/rede interna.

Exemplo:
- `DATABASE_URL=postgresql://postgres:SENHA@postgres:5432/gasto_politico?schema=public`
- `DATABASE_ADMIN_URL=postgresql://postgres:SENHA@postgres:5432/postgres` (opcional; usado para criar DB se faltar)
- `REDIS_URL=redis://:SENHA@redis:6379` (ou `redis://redis:6379` sem senha)
- `ENABLE_REDIS=true` (ou `false` para modo sem cache)
- `REDIS_HOST=redis` + `REDIS_PORT=6379` + `REDIS_PASSWORD=` (alternativa ao REDIS_URL)
- `RUN_MIGRATIONS=true`
- `AUTO_CREATE_DATABASE=true`
- `MIGRATION_MAX_RETRIES=8`
- `MIGRATION_RETRY_DELAY_SECONDS=3`
- `START_ON_MIGRATION_FAILURE=false`
- `START_ON_DEPENDENCY_FAILURE=false` (recomendado em producao)
- `WAIT_FOR_DB=true`
- `WAIT_FOR_REDIS=true`
- `DB_CONNECT_MAX_RETRIES=8`
- `DB_CONNECT_RETRY_DELAY_MS=2000`
- `DB_REQUIRED_ON_START=true` (recomendado em producao para fail-fast)
- `DB_HOST_ALIASES=postgres,db` (fallback de host interno em runtime)

Se o volume do Postgres ja existia sem `gasto_politico`, o entrypoint da API tenta criar o banco automaticamente e aplicar `GRANT ALL PRIVILEGES` para o usuario da `DATABASE_URL` antes de rodar migrations.

## CORS para Expo/React Native

Configuracao em `.env`:
- `CORS_ORIGINS=http://localhost:8081,http://localhost:19006,http://127.0.0.1:8081,http://127.0.0.1:19006,http://192.168.*:*,http://10.0.*:*,exp://*`
- suporta `*` por origem para facilitar desenvolvimento em rede local (LAN)

Comportamento:
- allowlist por origem (lista separada por virgula)
- aceita padroes com wildcard (`*`)
- aceita requests sem header `Origin` (comum em React Native)
- methods permitidos: `GET,POST,PUT,DELETE,OPTIONS`
- headers permitidos: `Authorization,Content-Type`
- `credentials=false`

## Modo local (opcional)

Se voce quiser rodar sem Docker:
- recomendado Node 20 (veja `.nvmrc`)
- `engines` e `volta` no `package.json` sao apenas aviso/recomendacao

## Troubleshooting

### Porta em uso
- API: `3334`
- Postgres: `5432`
- Redis: `6379`

Se precisar, derrube processos que ocupam essas portas ou altere mapeamentos no `docker-compose.yml`.

### Reset completo do banco (dev)
- `npm run db:reset:docker`

### Limpar containers/volumes e subir do zero
- `docker compose down -v`
- `docker compose build --no-cache`
- `docker compose up`

### Regerar Prisma Client no container
- `npm run prisma:generate:docker`

## Endpoints principais
- Health:
  - `GET /health` -> `200` com `status`, `uptime`, `version`, `timestamp`
  - `GET /health/db` -> `200` quando DB disponivel, `503` quando indisponivel
  - `GET /health/redis` -> `200` quando Redis ok, `503` degradado, `200` com `disabled` quando `ENABLE_REDIS=false`
- Auth:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `GET /auth/me`
  - `POST /auth/logout`
- Users:
  - `GET /api/users/me`
  - `PATCH /api/users/me`
  - `PATCH /api/users/me/password`
  - `DELETE /api/users/me`
- Deputados:
  - `GET /api/deputados`
  - `GET /api/deputados/:id`
  - `POST /api/deputados/sync`
- Despesas:
  - `GET /api/despesas/tipos`
  - `GET /api/deputados/:id/despesas`
  - `POST /api/deputados/:id/despesas/sync`
- Ranking:
  - `GET /api/ranking/ceap`
  - `GET /api/ranking/cecap` (alias)
- Favoritos:
  - `GET /api/favoritos`
  - `POST /api/favoritos`
  - `DELETE /api/favoritos/:deputyId`

## Postman

Collection em `postman/collection.json`.

## Campo salario

Os endpoints de deputados e ranking retornam `salario` (valor mensal atual).
O valor e obtido do portal oficial da Camara e cacheado por 24h em Redis.

## App mobile (Expo)

O app React Native completo esta em `mobile/`.

Passos rapidos:
1. `cd mobile`
2. `Copy-Item .env.example .env -Force`
3. `npm install`
4. `npx expo start`

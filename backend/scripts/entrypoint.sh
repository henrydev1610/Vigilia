#!/usr/bin/env sh
set -e

echo "[entrypoint] starting api container"

if [ "${WAIT_FOR_DB:-true}" = "true" ]; then
  echo "[entrypoint] waiting for postgres at postgres:5432"
  until nc -z postgres 5432; do
    sleep 1
  done
fi

if [ "${WAIT_FOR_REDIS:-true}" = "true" ]; then
  echo "[entrypoint] waiting for redis at redis:6379"
  until nc -z redis 6379; do
    sleep 1
  done
fi

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "[entrypoint] running prisma migrate deploy"
  npm run prisma:migrate
fi

if [ "${SEED:-false}" = "true" ]; then
  echo "[entrypoint] running prisma seed"
  npm run prisma:seed
fi

echo "[entrypoint] starting application: $*"
exec "$@"

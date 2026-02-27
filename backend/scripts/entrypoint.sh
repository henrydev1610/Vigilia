#!/usr/bin/env sh
set -e

echo "[entrypoint] starting api container"

extract_host_from_url() {
  printf "%s" "$1" | sed -E 's#^[a-zA-Z0-9+.-]+://([^/@]+@)?([^/:?]+).*#\2#'
}

extract_port_from_url() {
  value="$(printf "%s" "$1" | sed -nE 's#^[a-zA-Z0-9+.-]+://([^/@]+@)?[^/:?]+:([0-9]+).*#\2#p')"
  printf "%s" "$value"
}

if [ "${WAIT_FOR_DB:-true}" = "true" ]; then
  DB_HOST_RESOLVED="${DB_HOST:-$(extract_host_from_url "${DATABASE_URL:-}")}"
  DB_PORT_RESOLVED="${DB_PORT:-$(extract_port_from_url "${DATABASE_URL:-}")}"
  if [ -z "$DB_HOST_RESOLVED" ]; then DB_HOST_RESOLVED="postgres"; fi
  if [ -z "$DB_PORT_RESOLVED" ]; then DB_PORT_RESOLVED="5432"; fi
  echo "[entrypoint] waiting for postgres at ${DB_HOST_RESOLVED}:${DB_PORT_RESOLVED}"
  until nc -z "$DB_HOST_RESOLVED" "$DB_PORT_RESOLVED"; do
    sleep 1
  done
fi

if [ "${WAIT_FOR_REDIS:-false}" = "true" ] && [ "${ENABLE_REDIS:-true}" = "true" ]; then
  REDIS_HOST_RESOLVED="$(extract_host_from_url "${REDIS_URL:-}")"
  REDIS_PORT_RESOLVED="$(extract_port_from_url "${REDIS_URL:-}")"
  if [ -z "$REDIS_HOST_RESOLVED" ]; then REDIS_HOST_RESOLVED="redis"; fi
  if [ -z "$REDIS_PORT_RESOLVED" ]; then REDIS_PORT_RESOLVED="6379"; fi
  echo "[entrypoint] waiting for redis at ${REDIS_HOST_RESOLVED}:${REDIS_PORT_RESOLVED}"
  until nc -z "$REDIS_HOST_RESOLVED" "$REDIS_PORT_RESOLVED"; do
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

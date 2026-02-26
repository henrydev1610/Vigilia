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

wait_for_service() {
  service_name="$1"
  host="$2"
  port="$3"
  timeout_seconds="$4"

  if [ -z "$host" ] || [ -z "$port" ]; then
    echo "[entrypoint] missing host/port for ${service_name}"
    return 1
  fi

  echo "[entrypoint] waiting for ${service_name} at ${host}:${port} (timeout ${timeout_seconds}s)"
  start_ts="$(date +%s)"
  while ! nc -z "$host" "$port" >/dev/null 2>&1; do
    now_ts="$(date +%s)"
    elapsed="$((now_ts - start_ts))"
    if [ "$elapsed" -ge "$timeout_seconds" ]; then
      echo "[entrypoint] timeout waiting for ${service_name} at ${host}:${port}"
      return 1
    fi
    sleep 1
  done
}

WAIT_TIMEOUT_SECONDS="${WAIT_TIMEOUT_SECONDS:-90}"
DB_HOST_RESOLVED="${DB_HOST:-$(extract_host_from_url "${DATABASE_URL:-}")}"
DB_PORT_RESOLVED="${DB_PORT:-$(extract_port_from_url "${DATABASE_URL:-}")}"
REDIS_HOST_RESOLVED="${REDIS_HOST:-$(extract_host_from_url "${REDIS_URL:-}")}"
REDIS_PORT_RESOLVED="${REDIS_PORT:-$(extract_port_from_url "${REDIS_URL:-}")}"

if [ -z "$DB_PORT_RESOLVED" ]; then
  DB_PORT_RESOLVED="5432"
fi
if [ -z "$REDIS_PORT_RESOLVED" ]; then
  REDIS_PORT_RESOLVED="6379"
fi

if [ "${WAIT_FOR_DB:-true}" = "true" ]; then
  wait_for_service "postgres" "$DB_HOST_RESOLVED" "$DB_PORT_RESOLVED" "$WAIT_TIMEOUT_SECONDS"
fi

if [ "${WAIT_FOR_REDIS:-true}" = "true" ]; then
  wait_for_service "redis" "$REDIS_HOST_RESOLVED" "$REDIS_PORT_RESOLVED" "$WAIT_TIMEOUT_SECONDS"
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

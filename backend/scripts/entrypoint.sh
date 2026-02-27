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
MIGRATION_MAX_RETRIES="${MIGRATION_MAX_RETRIES:-8}"
MIGRATION_RETRY_DELAY_SECONDS="${MIGRATION_RETRY_DELAY_SECONDS:-3}"
START_ON_MIGRATION_FAILURE="${START_ON_MIGRATION_FAILURE:-false}"
START_ON_DEPENDENCY_FAILURE="${START_ON_DEPENDENCY_FAILURE:-}"
ENABLE_REDIS="${ENABLE_REDIS:-true}"
AUTO_CREATE_DATABASE="${AUTO_CREATE_DATABASE:-true}"
DB_HOST_RESOLVED="${DB_HOST:-$(extract_host_from_url "${DATABASE_URL:-}")}"
DB_PORT_RESOLVED="${DB_PORT:-$(extract_port_from_url "${DATABASE_URL:-}")}"
REDIS_HOST_RESOLVED="${REDIS_HOST:-$(extract_host_from_url "${REDIS_URL:-}")}"
REDIS_PORT_RESOLVED="${REDIS_PORT:-$(extract_port_from_url "${REDIS_URL:-}")}"
DB_HOST_ALIASES="${DB_HOST_ALIASES:-postgres,db}"

if [ -z "$DB_PORT_RESOLVED" ]; then
  DB_PORT_RESOLVED="5432"
fi
if [ -z "$REDIS_PORT_RESOLVED" ]; then
  REDIS_PORT_RESOLVED="6379"
fi

if [ -z "$START_ON_DEPENDENCY_FAILURE" ]; then
  if [ "${NODE_ENV:-production}" = "production" ]; then
    START_ON_DEPENDENCY_FAILURE="false"
  else
    START_ON_DEPENDENCY_FAILURE="true"
  fi
fi

replace_url_host() {
  original="$1"
  replacement="$2"
  if [ -z "$original" ] || [ -z "$replacement" ]; then
    printf "%s" "$original"
    return
  fi
  printf "%s" "$original" | sed -E \
    -e "s#^([a-zA-Z0-9+.-]+://[^/@]+@)[^/:?]+#\1${replacement}#" \
    -e "t updated" \
    -e "s#^([a-zA-Z0-9+.-]+://)[^/:?]+#\1${replacement}#" \
    -e ":updated"
}

resolve_reachable_db_host() {
  host_candidates="$1"
  current_host="$2"
  current_port="$3"

  if [ -n "$current_host" ] && nc -z "$current_host" "$current_port" >/dev/null 2>&1; then
    printf "%s" "$current_host"
    return
  fi

  OLD_IFS="$IFS"
  IFS=','
  for host in $host_candidates; do
    host_trimmed="$(printf "%s" "$host" | tr -d '[:space:]')"
    if [ -z "$host_trimmed" ]; then
      continue
    fi
    if nc -z "$host_trimmed" "$current_port" >/dev/null 2>&1; then
      IFS="$OLD_IFS"
      printf "%s" "$host_trimmed"
      return
    fi
  done
  IFS="$OLD_IFS"

  printf "%s" "$current_host"
}

if [ -n "$DATABASE_URL" ]; then
  db_host_probe_candidates="${DB_HOST_RESOLVED},${DB_HOST_ALIASES}"
  REACHABLE_DB_HOST="$(resolve_reachable_db_host "$db_host_probe_candidates" "$DB_HOST_RESOLVED" "$DB_PORT_RESOLVED")"
  if [ -n "$REACHABLE_DB_HOST" ] && [ "$REACHABLE_DB_HOST" != "$DB_HOST_RESOLVED" ]; then
    echo "[entrypoint] switched DB host from ${DB_HOST_RESOLVED} to ${REACHABLE_DB_HOST} after connectivity probe"
    DB_HOST_RESOLVED="$REACHABLE_DB_HOST"
    DATABASE_URL="$(replace_url_host "${DATABASE_URL}" "${REACHABLE_DB_HOST}")"
    export DATABASE_URL
    if [ -n "${DATABASE_ADMIN_URL:-}" ]; then
      DATABASE_ADMIN_URL="$(replace_url_host "${DATABASE_ADMIN_URL}" "${REACHABLE_DB_HOST}")"
      export DATABASE_ADMIN_URL
    fi
  fi
fi

if [ "${WAIT_FOR_DB:-true}" = "true" ]; then
  if ! wait_for_service "postgres" "$DB_HOST_RESOLVED" "$DB_PORT_RESOLVED" "$WAIT_TIMEOUT_SECONDS"; then
    if [ "$START_ON_DEPENDENCY_FAILURE" = "true" ]; then
      echo "[entrypoint] postgres not reachable, continuing startup"
    else
      echo "[entrypoint] postgres not reachable, exiting container"
      exit 1
    fi
  fi
fi

extract_db_name_from_url() {
  printf "%s" "$1" | sed -E 's#^[a-zA-Z0-9+.-]+://[^/]+/([^?]+).*$#\1#'
}

build_admin_db_url() {
  printf "%s" "$1" | sed -E 's#(^[a-zA-Z0-9+.-]+://[^/]+/)[^?]+#\1postgres#'
}

extract_db_user_from_url() {
  # Handles: postgresql://user:pass@host:5432/db
  printf "%s" "$1" | sed -nE 's#^[a-zA-Z0-9+.-]+://([^:/@?]+)(:[^@?]*)?@.*#\1#p'
}

if [ "${AUTO_CREATE_DATABASE}" = "true" ]; then
  TARGET_DB_NAME="$(extract_db_name_from_url "${DATABASE_URL:-}")"
  TARGET_DB_USER="$(extract_db_user_from_url "${DATABASE_URL:-}")"
  ADMIN_DATABASE_URL="${DATABASE_ADMIN_URL:-$(build_admin_db_url "${DATABASE_URL:-}")}"
  if [ -n "$TARGET_DB_NAME" ] && [ -n "$ADMIN_DATABASE_URL" ]; then
    echo "[entrypoint] checking database existence: ${TARGET_DB_NAME}"
    DB_EXISTS="$(psql "${ADMIN_DATABASE_URL}" -tAc "SELECT 1 FROM pg_database WHERE datname='${TARGET_DB_NAME}'" 2>/dev/null || true)"
    if [ -z "${DB_EXISTS}" ]; then
      echo "[entrypoint] could not check database existence via admin connection"
      if [ "$START_ON_DEPENDENCY_FAILURE" = "true" ]; then
        echo "[entrypoint] proceeding despite admin connection failure"
      else
        echo "[entrypoint] failing startup due to admin connection failure"
        exit 1
      fi
    fi
    if [ "${DB_EXISTS}" != "1" ]; then
      echo "[entrypoint] creating missing database: ${TARGET_DB_NAME}"
      if ! psql "${ADMIN_DATABASE_URL}" -c "CREATE DATABASE \"${TARGET_DB_NAME}\";"; then
        if [ "$START_ON_DEPENDENCY_FAILURE" = "true" ]; then
          echo "[entrypoint] create database failed, continuing startup"
        else
          echo "[entrypoint] create database failed, exiting container"
          exit 1
        fi
      fi
    fi
    if [ -n "${TARGET_DB_USER}" ]; then
      echo "[entrypoint] ensuring privileges on ${TARGET_DB_NAME} for ${TARGET_DB_USER}"
      if ! psql "${ADMIN_DATABASE_URL}" -c "GRANT ALL PRIVILEGES ON DATABASE \"${TARGET_DB_NAME}\" TO \"${TARGET_DB_USER}\";"; then
        if [ "$START_ON_DEPENDENCY_FAILURE" = "true" ]; then
          echo "[entrypoint] grant privileges failed, continuing startup"
        else
          echo "[entrypoint] grant privileges failed, exiting container"
          exit 1
        fi
      fi
    fi
  fi
fi

if [ "${WAIT_FOR_REDIS:-true}" = "true" ] && [ "${ENABLE_REDIS}" = "true" ]; then
  if ! wait_for_service "redis" "$REDIS_HOST_RESOLVED" "$REDIS_PORT_RESOLVED" "$WAIT_TIMEOUT_SECONDS"; then
    if [ "$START_ON_DEPENDENCY_FAILURE" = "true" ]; then
      echo "[entrypoint] redis not reachable, continuing startup"
    else
      echo "[entrypoint] redis not reachable, exiting container"
      exit 1
    fi
  fi
elif [ "${ENABLE_REDIS}" != "true" ]; then
  echo "[entrypoint] redis disabled by ENABLE_REDIS=${ENABLE_REDIS}"
fi

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "[entrypoint] running prisma migrate deploy with retries"
  migration_attempt=1
  migration_ok="false"
  while [ "$migration_attempt" -le "$MIGRATION_MAX_RETRIES" ]; do
    if npm run prisma:migrate; then
      migration_ok="true"
      break
    fi
    echo "[entrypoint] migration attempt ${migration_attempt}/${MIGRATION_MAX_RETRIES} failed"
    migration_attempt=$((migration_attempt + 1))
    sleep "$MIGRATION_RETRY_DELAY_SECONDS"
  done

  if [ "$migration_ok" != "true" ]; then
    if [ "$START_ON_MIGRATION_FAILURE" = "true" ]; then
      echo "[entrypoint] migration failed after retries, starting app anyway"
    else
      echo "[entrypoint] migration failed after retries, exiting container"
      exit 1
    fi
  fi
fi

if [ "${SEED:-false}" = "true" ]; then
  echo "[entrypoint] running prisma seed"
  npm run prisma:seed
fi

echo "[entrypoint] starting application: $*"
exec "$@"

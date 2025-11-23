#!/usr/bin/env bash
set -euo pipefail

# Small helper to start all backend services and frontend portals
# for the EMR/HMS monorepo from a single command.
#
# Usage:
#   chmod +x scripts/start-all.sh
#   ./scripts/start-all.sh
#
# Notes:
# - This script runs services/portals in the background and sends logs to /tmp/*.log
# - It does NOT automatically kill existing processes. If ports are already in use,
#   stop old processes manually (see START_ALL_SERVICES.md for guidance).

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="/tmp"

info() {
  printf "[start-all] %s\n" "$*"
}

start_docker_compose() {
  info "Starting Docker infrastructure (Kong, clinical-db, NATS, MinIO)..."
  # Only bring up shared infrastructure containers. Backend Node services
  # are started in dev mode via npm in start_backend_services.
  (cd "$ROOT_DIR" && \
    docker-compose up -d \
      kong-database \
      kong-migrations \
      kong \
      clinical-db \
      nats \
      minio \
      minio-client)
}

start_backend_services() {
  info "Starting backend services..."

  (
    cd "$ROOT_DIR/services/authentication-service" && \
      npm run start:dev >"$LOG_DIR/auth-service.log" 2>&1 &
  )
  (
    cd "$ROOT_DIR/services/patient-service" && \
      npm run start:dev >"$LOG_DIR/patient-service.log" 2>&1 &
  )
  (
    cd "$ROOT_DIR/services/clinical-workflow-service" && \
      npm run start:dev >"$LOG_DIR/workflow-service.log" 2>&1 &
  )
  (
    cd "$ROOT_DIR/services/encounter-service" && \
      npm run start:dev >"$LOG_DIR/encounter-service.log" 2>&1 &
  )
  (
    cd "$ROOT_DIR/services/pharmacy-service" && \
      npm run start:dev >"$LOG_DIR/pharmacy-service.log" 2>&1 &
  )
  (
    cd "$ROOT_DIR/services/lab-service" && \
      npm run start:dev >"$LOG_DIR/lab-service.log" 2>&1 &
  )
  (
    cd "$ROOT_DIR/services/radiology-service" && \
      npm run start:dev >"$LOG_DIR/radiology-service.log" 2>&1 &
  )
  (
    cd "$ROOT_DIR/services/aggregation-service" && \
      npm run start:dev >"$LOG_DIR/aggregation-service.log" 2>&1 &
  )
  (
    cd "$ROOT_DIR/services/notification-service" && \
      npm run start:dev >"$LOG_DIR/notification-service.log" 2>&1 &
  )

  (
    cd "$ROOT_DIR/services/fhir-service" && \
      npm run start:dev >"$LOG_DIR/fhir-service.log" 2>&1 &
  )

  info "Backend services starting (logs in $LOG_DIR/*-service.log)."
}

start_frontend_portals() {
  info "Starting frontend portals..."

  (
    cd "$ROOT_DIR/admin-portal" && \
      npm run dev -- --port 5173 >"$LOG_DIR/admin-portal.log" 2>&1 &
  )
  (
    cd "$ROOT_DIR/provider-portal" && \
      npm run dev -- --port 5174 >"$LOG_DIR/provider-portal.log" 2>&1 &
  )
  (
    cd "$ROOT_DIR/patient-portal" && \
      npm run dev -- --port 5175 >"$LOG_DIR/patient-portal.log" 2>&1 &
  )
  (
    cd "$ROOT_DIR/lab-portal" && \
      npm run dev -- --port 5176 >"$LOG_DIR/lab-portal.log" 2>&1 &
  )
  (
    cd "$ROOT_DIR/pharmacy-portal" && \
      npm run dev -- --port 5177 >"$LOG_DIR/pharmacy-portal.log" 2>&1 &
  )
  (
    cd "$ROOT_DIR/billing-portal" && \
      npm run dev -- --port 5178 >"$LOG_DIR/billing-portal.log" 2>&1 &
  )
  (
    cd "$ROOT_DIR/radiology-portal" && \
      npm run dev -- --port 5179 >"$LOG_DIR/radiology-portal.log" 2>&1 &
  )
  (
    cd "$ROOT_DIR/common-portal" && \
      npm run dev -- --port 5180 >"$LOG_DIR/common-portal.log" 2>&1 &
  )

  info "Frontend portals starting (logs in $LOG_DIR/*-portal.log)."
}

main() {
  info "Root directory: $ROOT_DIR"
  start_docker_compose
  start_backend_services
  start_frontend_portals

  info "All startup commands issued. Give services a few seconds to boot."
  info "Key URLs:"
  info "  Provider Portal:   http://localhost:5174"
  info "  Lab Portal:        http://localhost:5176"
  info "  Admin Portal:      http://localhost:5173"
  info "  Patient Portal:    http://localhost:5175"
  info "  Pharmacy Portal:   http://localhost:5177"
  info "  Billing Portal:    http://localhost:5178"
  info "  Radiology Portal:  http://localhost:5179"
  info "  Common Portal:     http://localhost:5180"
}

main "$@"

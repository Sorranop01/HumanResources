#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd -- "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROUTER_DIR="${REPO_ROOT}/.claude-router"
CONFIG_PATH="${HOME}/.claude-code-router/config.json"

if [[ ! -d "${ROUTER_DIR}" ]]; then
  echo "❌ Missing .claude-router directory at ${ROUTER_DIR}" >&2
  exit 1
fi

if [[ ! -f "${CONFIG_PATH}" ]]; then
  echo "❌ Missing router config at ${CONFIG_PATH}" >&2
  echo "   Run \`cp ${ROUTER_DIR}/config.json ${CONFIG_PATH}\` to provision it." >&2
  exit 1
fi

read_field() {
  local field="$1"
  node -e "const config=require(process.argv[1]); console.log(config['${field}'] ?? '');" "${CONFIG_PATH}"
}

ROUTER_PORT="$(read_field PORT)"
ROUTER_PORT="${ROUTER_PORT:-8080}"
ROUTER_KEY="$(read_field APIKEY)"

if [[ -z "${ROUTER_KEY}" ]]; then
  echo "❌ APIKEY missing in ${CONFIG_PATH}" >&2
  exit 1
fi

router_ready() {
  curl -fsS "http://127.0.0.1:${ROUTER_PORT}/health" >/dev/null 2>&1
}

ensure_router_running() {
  if router_ready; then
    echo "ℹ️  Router already running on port ${ROUTER_PORT}"
    return
  fi

  echo "🚀 Starting Claude router on port ${ROUTER_PORT}..."
  (cd "${ROUTER_DIR}" && node dist/cli.js start) >/tmp/claude-router.log 2>&1 &
  ROUTER_PID="$!"
  trap '[[ -n "${ROUTER_PID:-}" ]] && kill "${ROUTER_PID}" 2>/dev/null || true' EXIT
  for _ in {1..30}; do
    if router_ready; then
      echo "✅ Router is ready."
      return
    fi
    sleep 0.5
  done

  echo "❌ Router failed to start. Check /tmp/claude-router.log for details." >&2
  exit 1
}

ensure_router_running

export ANTHROPIC_BASE_URL="http://127.0.0.1:${ROUTER_PORT}"
export ANTHROPIC_AUTH_TOKEN="${ROUTER_KEY}"
export NO_PROXY="127.0.0.1"
export DISABLE_TELEMETRY="true"
export DISABLE_COST_WARNINGS="true"

if ! command -v claude >/dev/null 2>&1; then
  echo "❌ Claude CLI not found. Install it via \`npm install -g @anthropic-ai/claude-code\`." >&2
  exit 1
fi

echo ""
echo "🛠  Environment configured. Launching Claude CLI (press /model to swap Gemini variants)."
echo ""

claude "$@"

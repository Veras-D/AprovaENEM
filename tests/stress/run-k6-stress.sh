#!/usr/bin/env bash
# ==============================================================================
# AprovaENEM — Full-System Containerized Grafana k6 Stress & Load Runner
# ==============================================================================
# Usage:
#   ./tests/stress/run-k6-stress.sh [catalog|socratic|leaderboard|all]
#
# Environment variables:
#   BASE_URL   - Target base URL (default: http://localhost)
#   CI_FAST    - Set to "true" for quick 30s CI verification (default: false)
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="${1:-all}"
BASE_URL="${BASE_URL:-http://localhost}"
CI_FAST="${CI_FAST:-false}"

echo "========================================================================"
echo "🚀 Starting AprovaENEM Grafana k6 Stress & Load Testing Suite"
echo "========================================================================"
echo "🎯 Target URL : ${BASE_URL}"
echo "⏱️  CI Fast Run: ${CI_FAST}"
echo "📦 Scenario   : ${TARGET}"
echo "========================================================================"

run_k6() {
  local script_name="$1"
  local script_path="${SCRIPT_DIR}/${script_name}"

  if [[ ! -f "${script_path}" ]]; then
    echo "❌ Error: Script ${script_path} not found."
    exit 1
  fi

  echo ""
  echo "------------------------------------------------------------------------"
  echo "▶️  Executing k6 scenario: ${script_name}"
  echo "------------------------------------------------------------------------"

  docker run --rm -i \
    --network="host" \
    -e BASE_URL="${BASE_URL}" \
    -e CI_FAST="${CI_FAST}" \
    grafana/k6 run - < "${script_path}"
}

case "${TARGET}" in
  catalog)
    run_k6 "catalog-browse-load.js"
    ;;
  socratic)
    run_k6 "socratic-burst-stress.js"
    ;;
  leaderboard)
    run_k6 "leaderboard-concurrency.js"
    ;;
  all)
    echo "🌟 Running all 3 stress test scenarios..."
    run_k6 "catalog-browse-load.js"
    run_k6 "socratic-burst-stress.js"
    run_k6 "leaderboard-concurrency.js"
    ;;
  *)
    echo "❌ Unknown target scenario: ${TARGET}. Valid options: [catalog|socratic|leaderboard|all]"
    exit 1
    ;;
esac

echo ""
echo "========================================================================"
echo "✅ All requested k6 stress testing scenarios completed successfully!"
echo "========================================================================"

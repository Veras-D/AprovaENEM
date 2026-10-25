#!/usr/bin/env bash
#
# AprovaENEM — CI Quality Gate Inspector & Watcher Wrapper
# Usage:
#   ./scripts/ci.sh            # Inspect latest run and diagnose failure reason
#   ./scripts/ci.sh check [ID] # Inspect specific run
#   ./scripts/ci.sh watch [ID] # Watch live CI execution until completion
#   ./scripts/ci.sh list [N]   # List recent CI runs
#   ./scripts/ci.sh log <JOB>  # Inspect specific job log
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

if ! command -v gh >/dev/null 2>&1; then
  echo "Error: GitHub CLI (gh) is not installed or not in PATH." >&2
  echo "Please install gh: https://cli.github.com/" >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "Error: python3 is required to run the CI diagnostic inspector." >&2
  exit 1
fi

exec python3 "${REPO_ROOT}/scripts/ci.py" "$@"

#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PUB="${1:-$SCRIPT_DIR/Publications/publication}"
command -v node >/dev/null || { echo "ZINE: Node.js is required"; exit 1; }
node "$SCRIPT_DIR/src/cli/index.js" build "$PUB"

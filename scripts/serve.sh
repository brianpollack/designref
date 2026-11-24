#!/usr/bin/env bash
# serve.sh — serve the library over http://localhost (optional).
#
# Pages work straight from file:// (that is how they are shared on the network
# share). Use this only when a tool needs an http:// URL, e.g. browser automation.
#
# Usage: scripts/serve.sh [port]     (default 8787) then open http://localhost:8787
set -euo pipefail
cd "$(dirname "$0")/.."
PORT="${1:-8787}"
echo "Serving $(pwd) at http://localhost:${PORT}  (Ctrl+C to stop)"
exec python3 -m http.server "$PORT" --bind 127.0.0.1

#!/usr/bin/env bash
# open.sh — open the library (or one page) in Chrome straight from disk.
#
# Usage:  scripts/open.sh                                   home page
#         scripts/open.sh components/context-menus          a category
#         scripts/open.sh components/context-menus/radial-menu   a concept
# Prints the file:// URL too, ready to paste for a designer.
set -euo pipefail
cd "$(dirname "$0")/.."
TARGET="${1:-index}"
TARGET="${TARGET%.html}"
if [[ -d "$TARGET" ]]; then FILE="$TARGET/index.html"; else FILE="$TARGET.html"; fi
[[ -f "$FILE" ]] || { echo "No page at $FILE"; exit 1; }
URL="file://$(pwd)/$FILE"
echo "$URL"
open -a "Google Chrome" "$URL"

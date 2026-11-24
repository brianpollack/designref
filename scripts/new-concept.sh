#!/usr/bin/env bash
# new-concept.sh — create a concept page from _scaffold/concept.html.
#
# Usage:  scripts/new-concept.sh <section>/<category> <concept-id> ["Title"]
# Example: scripts/new-concept.sh components/context-menus radial-menu "Radial Menu"
#
# Add the concept to assets/catalog.js too (id, title, summary, features), then run
# `node scripts/check.mjs`. The page title shown on the site comes from the catalog.
set -euo pipefail
cd "$(dirname "$0")/.."
[[ $# -ge 2 ]] || { sed -n '2,9p' "$0"; exit 1; }
CAT_PATH="$1"; ID="$2"; TITLE="${3:-$ID}"
OUT="$CAT_PATH/$ID.html"
[[ -d "$CAT_PATH" ]] || { echo "No category folder $CAT_PATH (run scripts/new-category.sh first)"; exit 1; }
[[ -e "$OUT" ]] && { echo "$OUT already exists"; exit 1; }
sed -e "s|{{PAGE}}|$CAT_PATH/$ID|" -e "s|{{TITLE}}|$TITLE|" _scaffold/concept.html > "$OUT"
echo "Created $OUT"
grep -q "id: '$ID'" assets/catalog.js || echo "Next: add { id: '$ID', title: '$TITLE', summary: '…', features: [] } to assets/catalog.js"

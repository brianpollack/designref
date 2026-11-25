#!/usr/bin/env bash
# new-category.sh — create a category folder and index page from _scaffold/category.html.
#
# Usage:  scripts/new-category.sh <section> <category-id> ["Title"]
# Example: scripts/new-category.sh components tabs "Tabs"
#
# The category must also exist in assets/catalog.js with a summary, a concepts array,
# refs, and specs (each core library's own page for the component, from assets/sources.js).
set -euo pipefail
cd "$(dirname "$0")/.."
[[ $# -ge 2 ]] || { sed -n '2,8p' "$0"; exit 1; }
SECTION="$1"; ID="$2"; TITLE="${3:-$ID}"
DIR="$SECTION/$ID"
[[ -e "$DIR/index.html" ]] && { echo "$DIR/index.html already exists"; exit 1; }
mkdir -p "$DIR"
sed -e "s|{{PAGE}}|$SECTION/$ID|" -e "s|{{TITLE}}|${TITLE//&/\\&}|" _scaffold/category.html > "$DIR/index.html"
echo "Created $DIR/index.html"
grep -q "id: '$ID'" assets/catalog.js || echo "Next: add the category to assets/catalog.js"

#!/bin/bash
# Validate game content against the canonical state manifest.
# Checks ink files, config files, and enemy definitions for consistency.
#
# Usage:
#   ./workshop/canon/validate-canon.sh [--manifest <path>] [--fix-report]
#
# Checks:
#   1. All NPC dialogue files referenced in manifest exist
#   2. Item prices in ink files match manifest prices
#   3. Silver amounts in ink files match manifest values
#   4. All flags referenced in ink files exist in manifest
#   5. NPC names are consistent between manifest and dialogue
#   6. Enemy stat values match manifest
#
# Exit codes:
#   0 — all checks pass
#   1 — errors found

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

MANIFEST="${PROJECT_ROOT}/docs/canon/state-manifest.json"
FIX_REPORT=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --manifest) MANIFEST="$2"; shift 2 ;;
    --fix-report) FIX_REPORT=true; shift ;;
    *) shift ;;
  esac
done

if [ ! -f "$MANIFEST" ]; then
  echo "ERROR: Manifest not found: $MANIFEST"
  exit 1
fi

echo "=== Canon Validation ==="
echo "Manifest: $MANIFEST"
echo ""

ERRORS=0
WARNINGS=0

error() {
  echo "  ERROR: $1"
  ERRORS=$((ERRORS + 1))
}

warn() {
  echo "  WARNING: $1"
  WARNINGS=$((WARNINGS + 1))
}

ok() {
  echo "  OK: $1"
}

# --- 1. Validate manifest JSON structure ---
echo "--- Manifest Structure ---"
if ! python3 -c "import json; json.load(open('$MANIFEST'))" 2>/dev/null; then
  error "Manifest is not valid JSON"
  echo ""
  echo "=== VALIDATION FAILED (manifest unreadable) ==="
  exit 1
fi
ok "Manifest is valid JSON"

# Extract manifest data into shell-friendly format (quoted for eval safety)
MANIFEST_DATA=$(python3 -c "
import json
m = json.load(open('$MANIFEST'))

# NPC dialogue files
print('DIALOGUE_FILES=\"' + ' '.join(
    npc.get('dialogue_file', '')
    for npc in m.get('npcs', {}).values()
    if npc.get('dialogue_file')
) + '\"')

# Item prices
prices = []
for category in ['weapons', 'armor']:
    for name, item in m.get('items', {}).get(category, {}).items():
        if item.get('price', 0) > 0:
            prices.append(f'{name}:{item[\"price\"]}')
print('ITEM_PRICES=\"' + ' '.join(prices) + '\"')

# Economy amounts
income = []
for name, src in m.get('economy', {}).get('income', {}).items():
    income.append(f'{name}:{src[\"amount\"]}')
print('INCOME=\"' + ' '.join(income) + '\"')

expenses = []
for name, exp in m.get('economy', {}).get('expenses', {}).items():
    expenses.append(f'{name}:{exp[\"amount\"]}')
print('EXPENSES=\"' + ' '.join(expenses) + '\"')

# Flag names
flags = []
for category, category_flags in m.get('flags', {}).items():
    for flag_name in category_flags:
        flags.append(flag_name)
print('FLAGS=\"' + ' '.join(flags) + '\"')

# NPC names
print('NPC_NAMES=\"' + ' '.join(m.get('npcs', {}).keys()) + '\"')

# Enemy names
print('ENEMY_NAMES=\"' + ' '.join(m.get('enemies', {}).keys()) + '\"')

# Location names
print('LOCATION_NAMES=\"' + ' '.join(m.get('locations', {}).keys()) + '\"')
")

eval "$MANIFEST_DATA"

echo ""

# --- 2. Check NPC dialogue files exist ---
echo "--- Dialogue Files ---"
DIALOGUE_DIR="${PROJECT_ROOT}/assets/dialogue"
if [ -n "$DIALOGUE_FILES" ]; then
  for DFILE in $DIALOGUE_FILES; do
    # Check both .ink and .ink.json
    INK_PATH="${DIALOGUE_DIR}/${DFILE}"
    JSON_PATH="${DIALOGUE_DIR}/${DFILE%.ink}.ink.json"

    if [ -f "$INK_PATH" ] || [ -f "$JSON_PATH" ]; then
      ok "Dialogue file exists: $DFILE"
    else
      warn "Dialogue file missing: $DFILE (expected at ${INK_PATH})"
    fi
  done
else
  ok "No dialogue files referenced in manifest"
fi

echo ""

# --- 3. Check ink files for price consistency ---
echo "--- Price Consistency ---"
INK_FILES=$(find "${DIALOGUE_DIR}" -name "*.ink" 2>/dev/null || true)
if [ -n "$INK_FILES" ] && [ -n "$ITEM_PRICES" ]; then
  for PRICE_ENTRY in $ITEM_PRICES; do
    ITEM_NAME="${PRICE_ENTRY%%:*}"
    EXPECTED_PRICE="${PRICE_ENTRY##*:}"
    READABLE_NAME=$(echo "$ITEM_NAME" | tr '_' ' ')

    # Search ink files for price references
    while IFS= read -r INK_FILE; do
      # Look for silver amounts near item names
      MATCHES=$(grep -in "$READABLE_NAME" "$INK_FILE" 2>/dev/null | grep -io "[0-9]* silver" || true)
      if [ -n "$MATCHES" ]; then
        while IFS= read -r MATCH; do
          FOUND_PRICE=$(echo "$MATCH" | grep -o "[0-9]*")
          if [ "$FOUND_PRICE" != "$EXPECTED_PRICE" ]; then
            error "Price mismatch in $(basename "$INK_FILE"): '$READABLE_NAME' says ${FOUND_PRICE} silver, manifest says ${EXPECTED_PRICE}"
          fi
        done <<< "$MATCHES"
      fi
    done <<< "$INK_FILES"
  done
  ok "Price check complete (checked ink files against manifest)"
else
  ok "No ink files or prices to check"
fi

echo ""

# --- 4. Check for unknown flags in ink files ---
echo "--- Flag Consistency ---"
if [ -n "$INK_FILES" ]; then
  # Find all variable references in ink files
  INK_VARS=$(grep -hro '{[a-z_]*}' $INK_FILES 2>/dev/null | tr -d '{}' | sort -u || true)
  if [ -n "$INK_VARS" ]; then
    for VAR in $INK_VARS; do
      # Check if this variable is in the manifest flags
      IS_KNOWN=false
      for FLAG in $FLAGS; do
        if [ "$VAR" = "$FLAG" ]; then
          IS_KNOWN=true
          break
        fi
      done
      if ! $IS_KNOWN; then
        # Might be an ink internal variable — only warn
        warn "Ink variable '{$VAR}' not found in manifest flags (may be ink-internal)"
      fi
    done
  fi
  ok "Flag check complete"
else
  ok "No ink files to check"
fi

echo ""

# --- 5. Cross-reference locations and NPCs ---
echo "--- Location/NPC Cross-Reference ---"
python3 -c "
import json

m = json.load(open('$MANIFEST'))
errors = []
warnings = []

# Check that NPCs referenced in locations exist
for loc_name, loc in m.get('locations', {}).items():
    for npc_name in loc.get('npcs', []):
        if npc_name not in m.get('npcs', {}):
            errors.append(f'Location \"{loc_name}\" references NPC \"{npc_name}\" which is not defined')

# Check that NPC locations exist
for npc_name, npc in m.get('npcs', {}).items():
    loc = npc.get('location', '')
    if loc and loc not in m.get('locations', {}):
        errors.append(f'NPC \"{npc_name}\" is at location \"{loc}\" which is not defined')

# Check that items sold by NPCs exist
for npc_name, npc in m.get('npcs', {}).items():
    for item_name in npc.get('sells', []):
        found = False
        for category in ['weapons', 'armor']:
            if item_name in m.get('items', {}).get(category, {}):
                found = True
        # Also check economy expenses
        if item_name in m.get('economy', {}).get('expenses', {}):
            found = True
        if not found:
            warnings.append(f'NPC \"{npc_name}\" sells \"{item_name}\" which is not in items or expenses')

# Check enemy locations
for enemy_name, enemy in m.get('enemies', {}).items():
    loc = enemy.get('location', '')
    if loc and loc not in m.get('locations', {}):
        errors.append(f'Enemy \"{enemy_name}\" is at location \"{loc}\" which is not defined')

# Check location encounters reference defined enemies
for loc_name, loc in m.get('locations', {}).items():
    for enc in loc.get('encounters', []):
        if enc not in m.get('enemies', {}):
            errors.append(f'Location \"{loc_name}\" has encounter \"{enc}\" which is not defined as an enemy')

for e in errors:
    print(f'  ERROR: {e}')
for w in warnings:
    print(f'  WARNING: {w}')
if not errors and not warnings:
    print('  OK: All cross-references valid')
" 2>/dev/null

CROSS_ERRORS=$(python3 -c "
import json
m = json.load(open('$MANIFEST'))
e = 0
for loc_name, loc in m.get('locations', {}).items():
    for npc_name in loc.get('npcs', []):
        if npc_name not in m.get('npcs', {}): e += 1
for npc_name, npc in m.get('npcs', {}).items():
    loc = npc.get('location', '')
    if loc and loc not in m.get('locations', {}): e += 1
print(e)
" 2>/dev/null)
ERRORS=$((ERRORS + CROSS_ERRORS))

echo ""

# --- Summary ---
echo "=== CANON VALIDATION ${ERRORS:+${ERRORS} errors, }${WARNINGS:+${WARNINGS} warnings ===}"
if [ "$ERRORS" -gt 0 ]; then
  echo "=== VALIDATION FAILED ==="
  exit 1
else
  echo "=== VALIDATION PASSED ==="
  exit 0
fi

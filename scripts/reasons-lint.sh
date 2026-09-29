#!/usr/bin/env bash
# REASONS structure lint: validates that prompt files in spdd/prompt/ conform
# to the REASONS-Canvas framework (Requirements, Entities, Approach, Structure,
# Operations, Norms, Safeguards).

set -euo pipefail

FAIL=0
CHECKED=0

REASONS_SECTIONS=(
  "## Requirements"
  "## Entities"
  "## Approach"
  "## Structure"
  "## Operations"
  "## Norms"
  "## Safeguards"
)

lint_file() {
  local file="$1"
  local file_label
  file_label=$(basename "$file")
  local file_fail=0

  echo "▶ Checking: $file_label"

  # 1. Check each required section exists (exact line start)
  for section in "${REASONS_SECTIONS[@]}"; do
    if ! grep -qE "^${section}\$" "$file"; then
      echo "  FAIL: Missing section '$section'"
      file_fail=1
    fi
  done

  # 2. Check sections appear in the correct order
  if [ "$file_fail" -eq 0 ]; then
    local last_line=0
    for section in "${REASONS_SECTIONS[@]}"; do
      local line
      line=$(grep -nE "^${section}\$" "$file" | head -n 1 | cut -d: -f1 || true)
      if [ -n "$line" ]; then
        if [ "$line" -lt "$last_line" ]; then
          echo "  FAIL: Section '$section' appears out of order (line $line, expected after line$last_line)"
          file_fail=1
          break
        fi
        last_line="$line"
      fi
    done
  fi

  # 3. Check Entities section contains a mermaid diagram
  if [ "$file_fail" -eq 0 ]; then
    local entities_line
    entities_line=$(grep -nE '^## Entities$' "$file" | head -n 1 | cut -d: -f1 || true)

    if [ -n "$entities_line" ]; then
      # Extract from ## Entities to the next top-level/H2 heading or EOF
      local entities_block
      entities_block=$(tail -n +"$entities_line" "$file" | sed '1d' | sed -n '/^## /q; p')

      if ! echo "$entities_block" | grep -q '```mermaid'; then
        echo "  FAIL: Entities section does not contain a mermaid diagram"
        file_fail=1
      fi
    fi
  fi

  # 4. Check no placeholder/TODO items remain
  if [ "$file_fail" -eq 0 ]; then
    if grep -qiE 'TODO|PLACEHOLDER|\[TBD\]' "$file"; then
      echo "  FAIL: File contains TODO/PLACEHOLDER/TBD markers"
      file_fail=1
    fi
  fi

  # 5. Check no framework metadata leaked into the prompt
  if [ "$file_fail" -eq 0 ]; then
    if grep -qE '^\*\*(Objective|Construction Guidance|Quality Standards)\*\*' "$file"; then
      echo "  FAIL: File contains framework metadata (Objective/Construction Guidance/Quality Standards)"
      file_fail=1
    fi
  fi

  # 6. Check no "Business Context" section
  if [ "$file_fail" -eq 0 ]; then
    if grep -qE '^## Business Context$' "$file"; then
      echo "  FAIL: File contains '## Business Context' section (not allowed in final prompt)"
      file_fail=1
    fi
  fi

  if [ "$file_fail" -eq 0 ]; then
    echo "  PASS: All 7 REASONS sections present and valid"
  fi

  return "$file_fail"
}

# --- Main ---

echo "=== REASONS Structure Lint ==="
echo ""

if [ $# -ge 1 ]; then
  TARGET_FILES=("$@")
  for f in "${TARGET_FILES[@]}"; do
    if [ ! -f "$f" ]; then
      echo "ERROR: File not found: $f"
      exit 1
    fi
  done
else
  PROMPT_DIR="spdd/prompt"
  if [ ! -d "$PROMPT_DIR" ]; then
    echo "ERROR: Directory not found: $PROMPT_DIR"
    exit 1
  fi
  shopt -s nullglob
  TARGET_FILES=("$PROMPT_DIR"/*.md)
  shopt -u nullglob

  if [ ${#TARGET_FILES[@]} -eq 0 ]; then
    echo "No .md files found in $PROMPT_DIR"
    exit 0
  fi
fi

echo "Found ${#TARGET_FILES[@]} file(s) to check"
echo ""

for file in "${TARGET_FILES[@]}"; do
  CHECKED=$((CHECKED + 1))
  if ! lint_file "$file"; then
    FAIL=1
  fi
  echo ""
done

if [ "$FAIL" -eq 0 ]; then
  echo "REASONS lint passed: $CHECKED file(s) checked."
  exit 0
else
  echo "REASONS lint failed: $CHECKED file(s) checked."
  exit 1
fi
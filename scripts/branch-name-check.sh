#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -euo pipefail

# Pattern definition: wh-<string>-<string>
# Matches "wh-" followed by at least one non-dash segment, a dash, and at least one trailing segment.
PATTERN="^wh-[a-zA-Z0-9_-]+-[a-zA-Z0-9_-]+$"

# Get the target branch name:
# 1. First argument if provided ($1)
# 2. Environment variable target if set (e.g., CI/CD)
# 3. Current Git branch name
BRANCH_NAME="${1:-${BRANCH_NAME:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)}}"

if [[ -z "$BRANCH_NAME" ]]; then
  echo "Error: Could not determine branch name." >&2
  exit 1
fi

# Allow detached HEAD states (common in CI pipelines)
if [[ "$BRANCH_NAME" == "HEAD" ]]; then
  echo "Detached HEAD state detected. Skipping branch name check."
  exit 0
fi

echo "Checking branch name: '$BRANCH_NAME'..."

if [[ "$BRANCH_NAME" =~ $PATTERN ]]; then
  echo "✅ Branch name check passed."
  exit 0
else
  echo "❌ Branch name check failed!" >&2
  echo "Branch name '$BRANCH_NAME' does not match the required format: wh-*-**" >&2
  echo "Example valid names: wh-feature-auth-system, wh-fix-123, wh-jira-404" >&2
  exit 1
fi
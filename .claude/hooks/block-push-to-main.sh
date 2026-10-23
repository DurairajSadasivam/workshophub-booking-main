#!/bin/bash
# This hook blocks pushes to main branch to protect the production-ready codebase

# Git pre-push receives: <local ref> [ <remote url> ] [ <remote ref> ]
# We need to parse the local ref from the first token

if [ -n "$1" ]; then
    # Extract the reference name (first word)
    TARGET_REF="${1%% *}"
    
    if [ "$TARGET_REF" = "refs/heads/main" ]; then
        # Check if trying to push to main branch
        echo "❌ BLOCKED: Pushes to 'main' are restricted." >&2
        echo "   This script blocks pushes to branch 'main' to protect the production-ready codebase." >&2
        echo "   Please submit a Pull Request from your feature branch instead, or check with maintainers." >&2
        exit 1
    fi
fi

# Allow all other branches (feature, bugfix, develop, etc.)
exit 0

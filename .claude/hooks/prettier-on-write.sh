#!/bin/bash
# This hook runs Prettier to format files before commit
npx prettier --write "$@"

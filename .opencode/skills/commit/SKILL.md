---
name: commit
description: Create a conventional commit on the current branch with Trello card prefix. Use when user asks to commit, save work, or make a git commit.
---

# Commit – WorkshopHub

Safe local commit only. Never push.

## Rules

- Never commit on `main`. Refuse and stop if current branch is `main`.
- Never push. Stop after `git commit`.
- Never use `--no-verify`. Always run hooks.
- Never commit secrets: `.env`, `*.pem`, `*.key`, credentials, tokens, `database/*.sqlite`. If staged or unstaged secrets are present, stop and warn the user.

## Workflow

1. **Check branch:**
   ```sh
   git branch --show-current
   ```
   - If output is `main` (or empty/detached with no branch), refuse: explain commits must be on a feature branch, and stop. Do not proceed.
   - Extract Trello card ID (e.g. `WH-2`) from branch name with `WH-<number>` pattern (case-insensitive, normalize to uppercase, e.g. `feature/WH-2-login` → `WH-2`). If no match, ask the user for the card number before continuing.

2. **Show status and diff summary:**
   ```sh
   git status
   git diff --stat
   git diff --shortstat
   ```
   Show the output to the user. If nothing to commit (clean tree), stop.

3. **Stage relevant files if needed:**
   - If changes are already staged, do not add extra files.
   - Otherwise ask which files to include, then stage only those, e.g. `git add <paths>`.
   - Re-run `git status` and `git diff --cached --stat` to confirm. Verify no secrets are staged.

4. **Suggest message and confirm:**
   - Build a conventional commit message: `<type>(<scope>): WH-<N> <subject>` or `<type>: WH-<N> <subject>`.
   - Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`.
   - Keep subject imperative, lowercase, ≤72 chars, no period.
   - Example: `feat(auth): WH-2 add session registration validation`
   - Show the exact message and the staged file list to the user. Confirm with the user (via question tool) before committing. Do not commit without explicit approval. Offer to revise if rejected.

5. **Commit and stop:**
   ```sh
   git commit -m "<approved message>"
   ```
   - Use a single `-m` with the approved message. Do not amend unless asked. Do not add `--no-verify`.
   - Show `git status` after commit to confirm a clean state.
   - Stop. Do not run `git push`. Tell the user the commit is local only.

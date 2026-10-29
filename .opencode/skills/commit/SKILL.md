---
name: commit
description: Commit the current changes on a WorkshopHub feature branch with a Jira-prefixed conventional commit message (for example `WH-2 feat: add session registration form`). Refuses on `main`, confirms the message with the user, never pushes. Use when the user asks to commit, save work, or create a commit.
---

# Commit (WorkshopHub)

Create one commit on the current feature branch. Stop after the commit. Never push.

## Hard rules

- Never commit on `main`.
- Never commit secrets (see step 4).
- Never use `--no-verify` (or `-n`), and never bypass hooks in any other way. If a hook fails, fix the cause and make a new commit.
- Never run `git push`, and never `--amend` or rewrite history unless the user explicitly asks.
- Never use `git add -A` or `git add .`. Stage files by explicit path.

## Steps

### 1. Check the branch

```bash
git branch --show-current
```

- If the result is `main`, refuse: tell the user commits to `main` are not allowed and suggest creating a feature branch (`wh-{id}-{desc}`, see `/kickoff`). Stop. Do not stage or commit anything.
- If the result is empty (detached HEAD), tell the user and stop.

### 2. Show the state of the working tree

```bash
git status
git diff --stat
git diff --cached --stat
```

Show the user the `git status` output and a short summary of the changes (files touched and what changed, a few lines at most). If there is nothing to commit, say so and stop.

For the summary, read the actual diff (`git diff`, `git diff --cached`) as needed. For untracked files, read them or at least check their names.

### 3. Find the Jira number

Branches are named `wh-{id}-{desc}`, for example `wh-2-session-registration`, which means Jira key `WH-2`.

- Run `git branch` and look at the current branch (marked with `*`). Match `^wh-(\d+)` case-insensitively and build the key as `WH-<number>` (uppercase).
- If the branch has no such number, use the `question` tool to ask the user for the Jira number (for example `WH-2`). Do not guess and do not invent one. Accept only the `WH-<number>` format. If they say there is none, ask again once and explain it is required, then stop if they still do not provide one.

### 4. Decide what to stage, and check for secrets

- If files are already staged and the user has not asked for more, commit only what is staged. Mention any unstaged changes that are being left out.
- If nothing is staged, stage the relevant files by explicit path. Relevant means files that belong to the change being described. Leave unrelated changes alone and tell the user which files were skipped. If it is unclear which files belong together, ask the user, or suggest splitting into more than one commit.
- Never stage or commit:
  - `.env`, `.env.*` (except clearly safe templates like `.env.example` with placeholder values), `*.pem`, `*.key`, `*.p12`, `*.pfx`, `id_rsa*`, `credentials*`, `secrets*`, `*.keystore`
  - files containing API keys, tokens, passwords, connection strings with credentials, or private keys
  - MCP or tool config files that contain tokens (check `.mcp.json`, `.claude/settings.local.json`)
  - build output, `node_modules`, or large binaries
- Scan the diff that will be committed (`git diff --cached`) for secret-like content (`password`, `secret`, `token`, `api_key`, `BEGIN PRIVATE KEY`, `AKIA...`, long random strings). If anything looks like a secret, unstage it (`git restore --staged <path>`), tell the user, and do not commit that file until they have dealt with it.

After staging, run `git status --short` and `git diff --cached --stat` to confirm exactly what will be committed.

### 5. Suggest a message and confirm

Use the conventional commit format with the Jira key as a prefix:

```
WH-<n> <type>(<optional scope>): <subject>
```

Example: `WH-2 feat(registration): add seat capacity check`

- `type`: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- `subject`: imperative mood, lowercase start, no trailing period. Keep the whole first line at 72 characters or fewer.
- Add a short body (wrapped at about 72 characters, separated by a blank line) only if the why is not obvious from the subject.
- Base the message on the staged diff only.

Show the proposed message and the list of files to be committed, then use the `question` tool to confirm. Offer: use as is, or edit (the user provides their own text). If the user supplies their own message, make sure it still starts with the Jira key and follows the format above; if it does not, point it out and ask whether to fix it. Do not commit until the user confirms.

### 6. Commit

Use a heredoc so the message is preserved exactly:

```bash
git commit -m "$(cat <<'EOF'
WH-2 feat(registration): add seat capacity check
EOF
)"
```

- Do not add `--no-verify`, `-n`, or `--no-gpg-sign`.
- If a pre-commit hook fails or modifies files, report the failure, fix the cause (re-stage any hook-fixed files by path), re-confirm if the message needs to change, and create a new commit. Do not skip the hook.

### 7. Report and stop

```bash
git log -1 --stat
git status --short
```

Report the commit hash, the final message, and the files committed, plus any changes left uncommitted. Say that nothing was pushed, and that pushing is up to the user. Then stop.

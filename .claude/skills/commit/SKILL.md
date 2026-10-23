---
name: commit
description: Create a conventional commit for WorkshopHub, prefixed with the Jira key (e.g. WH-2) from the branch name. Refuses on main, confirms the message with the user, never pushes. Use when the user asks to commit their changes.
---

# Commit (WorkshopHub)

Make one local commit of the current work. Stop after the commit. Do not push.

## Hard rules

- **Never commit on `main`.** If the current branch is `main`, refuse and stop.
- **Never use `--no-verify`** (or `-n`) and never bypass the Husky hooks in any other way. If a hook fails, show the output, fix the underlying problem or ask the user, and do not retry with hooks disabled.
- **Never commit secrets.** That covers `.env`, `api/.env`, any `*.env*` other than `.env.example`, `*.pem`, `*.key`, credential or token files, and `api/database/*.db` files. If a file staged or about to be staged looks like it holds a secret (API keys, tokens, passwords, private keys, connection strings with credentials), stop and ask the user.
- **Never push**, open a PR, amend, rebase, or force anything unless the user explicitly asks in a separate request.
- Do not run `git add -A` or `git add .` blindly. Stage specific paths.

## Steps

### 1. Check the branch

```bash
git branch --show-current
```

- If it is `main`, say so and stop. Suggest creating a branch that matches `wh-<string>-<string>` (e.g. `git switch -c wh-2-session-registration`). The pre-commit hook (`scripts/branch-name-check.sh`) enforces this pattern.
- Otherwise get the Jira key from the branch name: the leading `wh-<number>` becomes `WH-<number>` (e.g. `wh-2-session-registration` gives `WH-2`).
- If the branch name has no `wh-<number>` prefix, ask the user for the Jira number. Do not invent one.

### 2. Show what changed

```bash
git status --short
git diff --stat
git diff --cached --stat
```

Give the user a short summary: which files changed, what is already staged, what is untracked, and in a sentence or two what the change does. Read the actual diff (`git diff`, `git diff --cached`) as needed to understand it. Do not paste the full diff back to the user.

Point out anything that should probably not be committed (secrets, local DBs, build output such as `dist/`, `node_modules/`, editor files).

### 3. Propose a commit message

Use Conventional Commits with the Jira key as a prefix:

```
WH-<n> <type>(<optional scope>): <short imperative summary>

<optional body: what and why, wrapped at ~72 chars>
```

- `type` is one of `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`, `ci`, `build`.
- Use `api` or `app` as the scope when the change is limited to one package.
- Keep the summary under ~72 characters, imperative mood, no trailing period.

Example: `WH-2 feat(api): add capacity check to session registration`

Show the proposed message and the exact list of files that will be staged. **Ask the user to confirm or edit it before committing.** Do not commit until they say yes.

### 4. Stage

Stage only the files the user confirmed, by path:

```bash
git add <path> <path> ...
```

If the user already staged files and is happy with them, leave the staging as it is. Run `git diff --cached --stat` once more and check it matches what was agreed.

### 5. Commit

Use a heredoc so multi-line messages survive:

```bash
git commit -F - <<'EOF'
WH-<n> <type>(<scope>): <summary>

<body>
EOF
```

The Husky pre-commit hook runs the branch-name check and `scripts/reasons-lint.sh`. If it fails, show the output and help fix the cause. Do not skip the hook.

### 6. Stop

Show the result:

```bash
git log -1 --stat
```

Report the commit hash and message, then stop. Do not push. If the user wants to push, they will ask.

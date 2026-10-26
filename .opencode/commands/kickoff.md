---
description: Kick off a Trello story - read the card, move it to In Progress (or comment on a repeat attempt), save it to ./stories, and create the wh-{id}-{desc} branch.
---

# Kickoff (WorkshopHub)

Start work on a story from Trello. Card: `$ARGUMENTS`

Stop after the branch is created and confirmed. Do not write any feature code, analysis docs, or prompts, and do not commit or push.

## Steps

### 1. Get the card

- If `$ARGUMENTS` is empty, use the `question` tool to ask for the Trello card URL or ID. Do not guess.
- Read the card with `trelloReadCard` (`action: "get"`, `cardIdOrUrl: <argument>`).
- Note the card's `id` (ARI, needed for writes), name, description, labels, comments, current list, and board.
- If the card cannot be found or read, report the error and stop.

### 2. Move to In Progress, or record the attempt

- Find the board's lists with `trelloReadCard` (`action: "list_by_board"`, `boardIdOrUrl: <the card's board>`). Page through with `cursor` until you find the list named `In Progress` (case-insensitive match).
- If no `In Progress` list exists, use the `question` tool to ask which list to use. Do not create one.
- **If the card is not in `In Progress`:** move it with `trelloWriteCard` (`action: "move"`, `cardId: <card ARI>`, `listId: <In Progress list ARI>`).
- **If the card is already in `In Progress`:** do not move it. Add a comment with `trelloWriteCard` (`action: "add_comment"`, `cardId: <card ARI>`) recording the new attempt, for example:
  `Kickoff attempt on <YYYY-MM-DD>: work (re)started on branch wh-<id>-<desc>.`
  Post the comment after the branch name is settled in step 4 so it names the right branch.

### 3. Clarify

Review the card for gaps before saving it: missing acceptance criteria, unclear scope, ambiguous rules (capacity, validation, error cases), or unknown UI/API expectations. Use the `question` tool for anything you cannot resolve from the card or the codebase (keep it to what really matters, at most 4 questions). Record the answers in the story file. If nothing is unclear, skip this step.

### 4. Decide the branch name

Format: `wh-{id}-{desc}`. It must match `wh-<string>-<string>` (enforced by `scripts/branch-name-check.sh`).

- `{id}`: the story number. Use a `WH-<n>` key from the card title, description, or labels if there is one; otherwise use the card's short ID (`idShort`/card number). If neither is clear, ask the user.
- `{desc}`: 2-5 word kebab-case summary of the card title: lowercase, `a-z0-9` and hyphens only, no leading/trailing or doubled hyphens.
- Example: `wh-2-session-registration`.

### 5. Save the story

Write `./stories/wh-{id}-{desc}.md` (create `./stories` if needed). If the file already exists, show it and ask before overwriting. Use this layout:

```markdown
# WH-{id}: <card title>

- **Trello card:** <card URL>
- **Status:** In Progress
- **Kicked off:** <YYYY-MM-DD>
- **Branch:** wh-{id}-{desc}
- **Labels:** <labels or "none">

## Description

<card description, verbatim>

## Acceptance Criteria

<from the card; "Not specified on card" if absent>

## Comments

<relevant card comments with author and date, or "None">

## Clarifications

<questions asked in step 3 and the user's answers, or "None">
```

### 6. Create and check out the branch

```bash
git status --short
git branch --show-current
```

- If there are uncommitted changes, tell the user and ask whether to carry them onto the new branch before continuing.
- If the branch already exists (`git show-ref --verify --quiet refs/heads/wh-{id}-{desc}`), ask whether to check it out instead of creating it.
- Otherwise:

```bash
git switch -c wh-{id}-{desc}
```

Then post the step 2 comment if the card was already in `In Progress`.

### 7. Confirm and stop

```bash
git branch --show-current
```

Report:
- the branch name now checked out,
- whether the card was moved to `In Progress` or a comment was added,
- the path of the saved story file.

Then stop.

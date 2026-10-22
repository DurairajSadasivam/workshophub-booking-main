---
description: Kick off a Trello story - move to In Progress, save spec, create branch
---

Kick off Trello card `$ARGUMENTS` for WorkshopHub.

Card ID is `$ARGUMENTS` (e.g. `WH-2`). If no argument is given, use the Question tool to ask for the card ID and stop until answered.

## Workflow

1. **Read card:**
   - Use `trelloReadCard` to read the issue content for the given card ID.
   - Show title, status/column, description, and acceptance criteria to the user.

2. **Update card status:**
   - Check the current status/column of the card.
   - If it is NOT already in the `In Progress` column, use the `transition` tool to move it to `In Progress`.
   - If it IS already in `In Progress`, do not transition. Instead use `trelloWriteCard` to leave a comment noting a new kickoff attempt (include date and branch intent).

3. **Clarify:**
   - Use the `Question` tool for clarifications (scope, acceptance criteria, approach) before creating files/branch. Do not assume ambiguous requirements.

4. **Save story:**
   - Save the story as a markdown file in `./stories`, named `wh-{id}-{desc}.md` (lowercase, hyphen-slug, e.g. `./stories/wh-2-session-registration.md`).
   - Include: card ID, title, status, source link/ID, summary, acceptance criteria, clarifications/notes.
   - Create `./stories` if it does not exist.

5. **Create branch and stop:**
   - Create and checkout branch `wh-{id}-{desc}` matching the story file slug, e.g.:
     ```sh
     git checkout -b wh-2-session-registration
     ```
   - Confirm the branch name with `git branch --show-current` and show it to the user.
   - Stop. Do not implement, commit, or push.

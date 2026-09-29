---
description: Kick off a Trello story - clone card, move clone to In Progress, save spec, create branch
---

Kick off Trello card `$ARGUMENTS` for WorkshopHub using Trello MCP tools (`trello-mcp`).

Card ID is `$ARGUMENTS` (e.g. `WH-2`) — this is the original/source card and is never modified. If no argument is given, use the `Question` tool to ask for the card ID and stop until answered.

## Workflow

1. **Read card:**
   - Use `trello_get_card` (or `trello_get_issue_content` / `trelloReadCard`) to read the card content for the given card ID/key.
   - Show title, status/column, description, and acceptance criteria to the user.

2. **Clone the card:**
   - NEVER modify the original card. No status change, no comment, no edit on the original.
   - Use `trello_create_card` (or `trelloWriteCard`) to clone the original card into a new card (copy title and description).
   - Get the current user's Trello username or ID (e.g. via `trello_get_current_user` or `trello_get_member`).
   - Set the title/name of the newly cloned card to `Clone-<name of Trello user>-WH2` using `trello_update_card`.
   - Assign the newly cloned card to the Trello user using `trello_add_member_to_card` (or `trello_update_card`).
   - Check the current status/column of the clone.
   - If the clone is NOT already in the `In Progress` column, use `trello_move_card` (or `transition`) to move the clone to `In Progress`.
   - Confirm the clone's card ID by showing it to the user. From here on, the clone (not the original) is the working card.

3. **Clarify:**
   - Use the `Question` tool for clarifications (scope, acceptance criteria, approach) before creating files/branch. Do not assume ambiguous requirements.

4. **Save story:**
   - Save the story as a markdown file in `./stories`, named `wh-{clone-id}-{desc}.md` (lowercase, hyphen-slug, e.g. `./stories/wh-2-session-registration.md`), using the clone's ID and title.
   - Include: clone card ID, title, status, original card ID as source link/ID, summary, acceptance criteria, clarifications/notes.
   - Create `./stories` if it does not exist.

5. **Create branch and stop:**
   - Create and checkout branch `wh-{clone-id}-{desc}` matching the story file slug, e.g.:
     ```sh
     git checkout -b wh-2-session-registration
     ```
   - Confirm the branch name with `git branch --show-current` and show it to the user.
   - Stop. Do not implement, commit, or push.
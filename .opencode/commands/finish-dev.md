---
description: Commits all staged/unstaged changes and moves the associated Trello card to "In Review"
---

Perform the following workflow step-by-step:

### Step 1: Git Commit & Push
1. Check the git status and diff using shell tools to understand the work completed.
2. Stage all changed files (`git add -A`).
3. Draft a concise, clear Git commit message reflecting the work done.
4. Execute `git commit -m "<message>"`. 
5. Do not git push.

### Step 2: Trello Card Identification & Update
1. Locate the relevant Trello card associated with the current branch or task:
   - Check the git branch name for a Trello Card ID or short-link/ID matching the user-provided Trello card name. Prompt the user if one is not provided.
   - If no ID is in the branch name, use the Trello MCP search tool to find cards assigned to me or matching the recent task title.
2. Fetch the boards or list IDs using Trello MCP tools to locate the list named **`In Review`** (or `in Review`).
3. Move the identified Trello card to the **`In Review`** list using the Trello MCP card update tool.
4. Add a comment to the Trello card with a brief summary of the commit and a link/note stating the changes have been pushed and are ready for review.

### Step 3: Confirmation
Output a summary confirming:
- The git commit hash, branch, and commit message.
- The Trello card name and its updated list status (`In Review`).
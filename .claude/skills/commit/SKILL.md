Write a commit for WorkshopHub following these rules:
1. Create a conventional commit prefixed with the Jira key (e.g. WH-2) from the branch name
2. Refuse to commit if the branch is `main`
3. Display `git status` and a short diff summary of staged changes
4. Suggest a conventional commit message and confirm with the user before committing
5. The commit message must include a Jira number as prefix (e.g. WH-2, which can be seen from `git branch`)
6. If there's no clear Jira key in the branch name, ask the user what to use
7. Stage relevant files if needed (staged changes)
8. Run `git commit` with appropriate message
9. Stop without pushing - never push automatically
10. Never commit secrets or use `--no-verify` flag

The commit should be reviewed and confirmed by the user before proceeding.

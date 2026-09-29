# Clone-ziym-WH2 — WH-2: Employee can register for an available training session

## Story metadata

| Field | Value |
| --- | --- |
| Clone card ID | `6abb3650b0b7b70db8dc2d9b` (Trello card #72) |
| Clone card ARI | `ari:cloud:trello::card/workspace/6aa996534e71639d8e083b9a/6abb3650b0b7b70db8dc2d9b` |
| Clone card URL | https://trello.com/c/AwRnFtNl/72-clone-ziym-wh2 |
| Title | `Clone-ziym-WH2` |
| Status / column | In Progress |
| Clone board | APAC Agentic Training (working board) |
| Original (source) card ID | `WH-2` |
| Source card URL | https://trello.com/c/FElt0vX1/2-wh-2-employee-can-register-for-an-available-training-session |
| Source board | [DO NOT CHANGE] APAC Agentic Training |
| Source card column | In Progress |
| Type / Priority | Story / Medium |
| Branch | `wh-72-clone-ziym-wh2` |

> The original card `WH-2` is read-only and must never be modified (no status change, comment, or edit).
> All further work happens on the clone, never the original.

## Summary

Employees can currently browse training sessions (WH-1). The next step is allowing them to
register. Registration is the core transactional action of WorkshopHub — it increments the
`registered` count on a session and records the employee's details.

As an employee, I want to register for an available training session so that I can secure my
place before it fills up.

An employee submits their name and email to register. The system confirms the registration and
shows the updated capacity. If the session is full, the employee cannot register (see WH-3 for
the waitlist).

This is a **trainee exercise story**. It is not implemented in the baseline template.

## Acceptance Criteria

**User interactions:**

- A register button or form is visible on each session card (or session detail page)
- The employee provides their name and email to register
- On success, the `registered` count increments by 1
- On success, a confirmation message is shown to the employee
- If `registered >= capacity`, the register button is disabled or hidden

**API behaviour:**

- `POST /api/training-sessions/:id/registrations` accepts `{ name, email }` and returns HTTP 201
  with registration details
- Returns HTTP 400 if required fields are missing
- Returns HTTP 409 if the session is full (see WH-3 for waitlist)
- Returns HTTP 404 if the session does not exist

## Out of Scope

- Duplicate registration prevention
- Waitlist behaviour when full (WH-3)
- Cancellation (WH-4)
- Email notification (WH-8)
- Authentication or SSO

## Suggested Tests

- `POST /api/training-sessions/1/registrations { name, email }` → 201
- `POST /api/training-sessions/1/registrations {}` → 400, missing fields
- `POST /api/training-sessions/999/registrations` → 404
- `POST` when session is full → 409
- `registered` count increments after successful registration

## Clarifications / Notes

Resolved with the requester during kickoff:

1. **Which WH-2 is the source** — two boards each hold a card `WH-2: Employee can register for
   an available training session`. The source is the one on **[DO NOT CHANGE] APAC Agentic
   Training** (column: In Progress); it was read only and left untouched. The clone was created
   on the **APAC Agentic Training** working board, alongside the other trainees' clones.
2. **Existing leftover** — an archived `Clone-ziym-WH2` from a previous run (card id
   `6abb304af02a141033195f9a`) exists on the source board. Decision: leave it archived and
   **create a fresh clone**, which is this card (#72).
3. **Member assignment (blocked)** — assigning the clone to `ziym` (Zi Yang Mok,
   `ari:cloud:trello::user/6a383ebf507c9529de349adc`) is **not possible with the available
   tooling**: `trelloWriteCard` exposes no `add_member` action (every action rejects
   `memberId`), `trelloWriteChecklist` `add_member` targets *check items* only, and the desktop
   browser was disconnected so the Trello web UI could not be used. Card members are currently
   empty — assign manually in Trello, or via a future MCP action.
4. **Slug** — story file and branch use `wh-72-clone-ziym-wh2` (clone's Trello card number +
   clone title slug), confirmed with the requester.
5. **Clone card hygiene** — a `Notes` checklist on the clone holds one item linking back to the
   source card (side effect of probing the only member-assignment path the MCP offers).

## Repo touch points (for implementation, not done in this kickoff)

- `api/src/routes/training-sessions.ts` — existing session routes; add the
  `POST /:id/registrations` endpoint here.
- `api/src/services/trainingSessionService.ts` — service layer used by the routes.
- `api/prisma/schema.prisma` — currently only has `TrainingSession`; needs `Registration`.
- `app/src/components/TrainingSessionCard.tsx` — session card UI; register form goes here.
- `app/src/pages/TrainingSessionsPage.tsx` — page that fetches/renders sessions.
- `api/tests/integration/training-sessions.test.ts`, `api/tests/unit/trainingSessionService.test.ts`
  — existing test patterns to follow.

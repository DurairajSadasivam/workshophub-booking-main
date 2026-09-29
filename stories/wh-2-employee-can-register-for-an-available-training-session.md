# WH-2: Employee can register for an available training session

## Story metadata

| Field | Value |
| --- | --- |
| Clone card ID | `6abb304af02a141033195f9a` |
| Clone card ARI | `ari:cloud:trello::card/workspace/6aa996534e71639d8e083b9a/6abb304af02a141033195f9a` |
| Clone card URL | https://trello.com/c/J2E4yaCr/1-wh-2-employee-can-register-for-an-available-training-session |
| Title | WH-2: Employee can register for an available training session |
| Status / column | In Progress |
| Original (source) card ID | WH-2 |
| Source card URL | https://trello.com/c/FElt0vX1/2-wh-2-employee-can-register-for-an-available-training-session |
| Source board | [DO NOT CHANGE] APAC Agentic Training |
| Type / Priority | Story / Medium |
| Branch | `wh-2-employee-can-register-for-an-available-training-session` |

> The original card `WH-2` is read-only and must never be modified (no status change, comment, or edit).

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

Resolved with the requester before any file or branch was created:

1. **UI location** — the registration form lives **inline on each session card**
   (`app/src/components/TrainingSessionCard.tsx`): a "Register" button that reveals name/email
   fields, plus a confirmation message and the refreshed `registered / capacity` count. No new
   detail page or modal; the app has no session detail route today.
2. **Persistence** — add a **new Prisma `Registration` model** to `api/prisma/schema.prisma`
   (fields roughly: `id`, `sessionId` → `TrainingSession`, `name`, `email`, `status`,
   `createdAt`), applied with `prisma db push`, keeping the seed working. Real persistence so
   WH-3 (waitlist) and WH-4 (cancellation) can build on it later.
3. **Tests** — cover the ACs with **integration tests in `api/tests/integration/`** (extending
   the existing `training-sessions.test.ts` style) for 201 / 400 / 404 / 409 and the `registered`
   count increment; no UI test runner work in `app/` for this story.
4. **Slug** — story file and branch use the card key form `wh-2-employee-can-register-...`
   (confirmed with the requester), not the raw clone hex ID.

## Repo touch points (for implementation)

- `api/src/routes/training-sessions.ts` — existing session routes; add the
  `POST /:id/registrations` endpoint here.
- `api/src/services/trainingSessionService.ts` — service layer used by the routes.
- `api/prisma/schema.prisma` — currently only has `TrainingSession`; needs `Registration`.
- `app/src/components/TrainingSessionCard.tsx` — session card UI; register form goes here.
- `app/src/pages/TrainingSessionsPage.tsx` — page that fetches/renders sessions.
- `api/tests/integration/training-sessions.test.ts`, `api/tests/unit/trainingSessionService.test.ts`
  — existing test patterns to follow.

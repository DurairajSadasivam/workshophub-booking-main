# WH-2: Employee can register for an available training session

- **Trello card:** https://trello.com/c/CFc0UVkT/1-wh-2-employee-can-register-for-an-available-training-session
- **Status:** In Progress
- **Kicked off:** 2026-10-22
- **Branch:** wh-2-session-registration
- **Labels:** orange (unnamed)

## Description

## Context

Employees can currently browse training sessions (WH-1). The next step is allowing them to register. Registration is the core transactional action of WorkshopHub — it increments the `registered` count on a session and records the employee's details.

This is a **trainee exercise story**. It is not implemented in the baseline template.

## Description

As an employee, I want to register for an available training session so that I can secure my place before it fills up.

An employee submits their name and email to register. The system confirms the registration and shows the updated capacity. If the session is full, the employee cannot register (see WH-3 for the waitlist).

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

---
Type: Story | Priority: Medium

## Acceptance Criteria

- A register button or form is visible on each session card (or session detail page)
- The employee provides their name and email to register
- On success, the `registered` count increments by 1
- On success, a confirmation message is shown to the employee
- If `registered >= capacity`, the register button is disabled or hidden
- `POST /api/training-sessions/:id/registrations` accepts `{ name, email }` and returns HTTP 201 with registration details
- Returns HTTP 400 if required fields are missing
- Returns HTTP 409 if the session is full (see WH-3 for waitlist)
- Returns HTTP 404 if the session does not exist

## Comments

None

## Clarifications

1. **How strict should input validation be?** The card only requires 400 for missing fields.
   - **Answer:** Return 400 when name or email is missing or blank (whitespace-only), and also when the email is malformed. Trim values before validating.
2. **Where should the registration form live in the UI?**
   - **Answer:** Inline on the session card. A Register button on each card expands an inline name/email form. The confirmation shows on the card, and the session list is refetched.
3. **What should the 201 response body contain?**
   - **Answer:** The registration record: `{ id, trainingSessionId, name, email, createdAt }`. The frontend refetches the sessions to get the updated count.

Codebase note at kickoff: there is no `Registration` Prisma model or registration endpoint on `main` yet. A previous attempt (commit 2a24ce3) was reverted in 2f9e9b0.

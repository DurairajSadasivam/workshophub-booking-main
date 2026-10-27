# WH-3: Waitlist when a training session is full

- **Trello card:** https://trello.com/c/WOj61CzY/7-wh-3-waitlist-when-a-training-session-is-full
- **Status:** In Progress
- **Kicked off:** 2026-10-26
- **Branch:** wh-3-waitlist-full-session
- **Labels:** orange (unnamed)

## Description

## Context

After WH-2 is implemented, a session can fill up. When a session reaches capacity, subsequent employees who want to attend should be placed on a waitlist rather than being turned away. This ensures demand is captured and can be fulfilled if a registered employee cancels (WH-4 → WH-5).

This is a **trainee exercise story**. It is not implemented in the baseline template.

## Description

As an employee, I want to join a waitlist for a full training session so that I can attend if a place becomes available.

When a session is full, an employee can join the waitlist. The system records their position and informs them they are waitlisted, not confirmed.

## Acceptance Criteria

- [x] When `registered >= capacity`, new registrations are added to the waitlist
- [x] The waitlisted employee sees a message confirming they are waitlisted (not confirmed)
- [x] The session card shows a "Join Waitlist" option when the session is full
- [x] `POST /api/training-sessions/:id/registrations` returns HTTP 202 with `{ status: "waitlisted", position: N }` when full
- [x] Waitlisted registrations have status `waitlisted` in the database
- [x] Confirmed registrations have status `confirmed`

## Out of Scope

- Promotion from waitlist (WH-5)
- Cancellation (WH-4)
- Email notification (WH-8)
- Maximum waitlist size

## Suggested Tests

- `POST` when session is full → 202 with `status: "waitlisted"`
- `POST` when session has space → 201 with `status: "confirmed"`
- Waitlisted count is tracked separately from registered count
- Position in waitlist is correct (1st, 2nd, etc.)

## Data Model Hint

The `Registration` model should include a `status` field: `confirmed | waitlisted | cancelled`.

## Acceptance Criteria

- When `registered >= capacity`, new registrations are added to the waitlist
- The waitlisted employee sees a message confirming they are waitlisted (not confirmed)
- The session card shows a "Join Waitlist" option when the session is full
- `POST /api/training-sessions/:id/registrations` returns HTTP 202 with `{ status: "waitlisted", position: N }` when full
- Waitlisted registrations have status `waitlisted` in the database
- Confirmed registrations have status `confirmed`

(Boxes are ticked on the card, but per the clarification below none of these are implemented yet.)

## Comments

None

## Clarifications

1. **Base branch?** WH-3 builds on WH-2, which exists only on `wh-2-session-registration` (not merged to main). Answer: branch from the current branch, `wh-2-session-registration`.
2. **Full-session response?** WH-2 returns 409 when full; WH-3 specifies 202 with `{ status: "waitlisted", position: N }`. Answer: replace the 409 behaviour with 202.
3. **Ticked criteria on the card?** All criteria are ticked `[x]` although the card says the story is not implemented. Answer: treat them as not done; all criteria still need implementing.

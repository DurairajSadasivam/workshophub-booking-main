# SPDD Analysis: Employee Registration for an Available Training Session (WH-2)

## Original Business Requirement

Source: `stories/wh-72-clone-ziym-wh2.md` (Trello clone card #72, branch `wh-72-clone-ziym-wh2`), which carries the verbatim WH-2 story. Companion source story: `stories/wh-2-employee-can-register-for-an-available-training-session.md`.

```markdown
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

## Repo touch points (for implementation, not done in this kickoff)

- `api/src/routes/training-sessions.ts` — existing session routes; add the
  `POST /:id/registrations` endpoint here.
- `api/src/services/trainingSessionService.ts` — service layer used by the routes.
- `api/prisma/schema.prisma` — currently only has `TrainingSession`; needs `Registration`.
- `app/src/components/TrainingSessionCard.tsx` — session card UI; register form goes here.
- `app/src/pages/TrainingSessionsPage.tsx` — page that fetches/renders sessions.
- `api/tests/integration/training-sessions.test.ts`, `api/tests/unit/trainingSessionService.test.ts`
  — existing test patterns to follow.
```

Additional clarifications resolved on the companion source story (`stories/wh-2-employee-can-register-for-an-available-training-session.md`) that bind this work:

1. **UI location** — the registration form lives **inline on each session card** (`app/src/components/TrainingSessionCard.tsx`): a "Register" button that reveals name/email fields, plus a confirmation message and the refreshed `registered / capacity` count. No new detail page or modal; the app has no session detail route today.
2. **Persistence** — add a **new Prisma `Registration` model** to `api/prisma/schema.prisma` (fields roughly: `id`, `sessionId` → `TrainingSession`, `name`, `email`, `status`, `createdAt`), applied with `prisma db push`, keeping the seed working. Real persistence so WH-3 (waitlist) and WH-4 (cancellation) can build on it later.
3. **Tests** — cover the ACs with **integration tests in `api/tests/integration/`** (extending the existing `training-sessions.test.ts` style) for 201 / 400 / 404 / 409 and the `registered` count increment; no UI test runner work in `app/` for this story.

## Domain Concept Identification

### Existing Concepts (from codebase)

- **TrainingSession**: the core catalog entity — a bookable workshop with a title, date, location, delivery mode, a `capacity` ceiling and a `registered` occupancy counter, plus a `status` flag. It is the root of this requirement: every registration attaches to exactly one session. Persisted via Prisma on SQLite (`training_sessions`), served by the sessions API, rendered as cards by the frontend.
- **Capacity counters (`capacity` / `registered`)**: a denormalized occupancy pair maintained on `TrainingSession` itself rather than derived from child records. The existing card UI already computes `spots left` and a `Full` badge from this pair, and the seed populates all sessions with `registered: 0`. The full/not-full rule of this story is expressed entirely in terms of this pair.
- **Session browsing experience (WH-1)**: the existing read-only listing — `TrainingSessionsPage` fetches `/api/training-sessions` and renders `TrainingSessionCard` components. This is the surface the registration interaction must attach to; there is no session detail route, modal, or router in the app today.
- **Session API surface**: an Express router mounted at `/api/training-sessions` exposing list, keyword search, and by-id reads, delegating to a small service layer over a shared Prisma client, with errors returned as `{ error: string }` JSON status codes (400/404/500 patterns already established).
- **Employee / attendee (implicit only)**: the person registering exists in the requirement as a name + email pair. The codebase has **no user, employee, or identity entity** — nothing to link a registration to. This concept currently lives only as free-form input.
- **Test conventions**: Jest + supertest integration tests against the real Express app and the shared SQLite database, plus unit tests that mock the Prisma client at the service boundary. Both existing test files are read-only with respect to session state.

### New Concepts Required

- **Registration**: a persisted record that one employee has secured a place in one training session — the new transactional entity. Belongs to a single `TrainingSession` (many registrations per session) and carries the attendee's name/email plus a lifecycle status and creation time. It is the durable evidence behind the `registered` counter.
- **Registration lifecycle status**: a state on each registration (initially simply "registered/confirmed"). Not exercised by this story, but the requirement explicitly defers waitlist (WH-3) and cancellation (WH-4) onto this concept, so the model must reserve room for it rather than treating a registration as a terminal write.
- **Registration submission interaction (UI)**: an inline form on the session card — reveal name/email fields on "Register", submit, then show a confirmation message alongside the refreshed `registered / capacity` figures. A new client-side state and error-handling surface (success, 400 validation, 409 full, network failure) inside an app that today only performs GET fetches.
- **Capacity guard**: the business rule object that decides whether a registration may proceed (`registered` at or above `capacity` means full). Conceptually new because no write path or validation logic exists anywhere in the API today — the rule exists only as UI display logic.

### Key Business Rules

- **Capacity invariant**: a session must never end up with `registered` exceeding `capacity`; a registration attempt against a full session is rejected with a conflict (409). Governs `TrainingSession` ↔ `Registration`.
- **Atomic occupancy update**: every successful registration increases `registered` by exactly one, and the registration record and counter change must succeed or fail together — the counter is the only occupancy truth the UI reads, so drift between it and the registration records breaks the full/not-full rule. Governs `Registration` → `TrainingSession`.
- **Required attendee details**: a registration must carry both a name and an email; a submission missing them is rejected with 400 before any state changes. Governs `Registration`.
- **Session existence**: registrations can only target an existing session; unknown ids yield 404. Governs `Registration` → `TrainingSession`.
- **Implicit — no identity verification**: with authentication out of scope, anyone can register any name/email, and nothing ties a registration to a real person. Acceptance relies on this being explicitly temporary, but it silently weakens the value of "secure my place".
- **Implicit — duplicates allowed**: duplicate prevention is out of scope, so the same email can register repeatedly and inflate `registered`. The capacity invariant therefore counts *registrations*, not *distinct employees* — a definition WH-3/WH-4 will inherit.
- **Implicit — counter is the capacity truth**: full/not-full is evaluated from the stored counter, not from counting registration rows. Any pre-existing or manually edited `registered` value (the seed and direct DB edits) is treated as authoritative.
- **Implicit — registrations are open regardless of session state**: the story does not say whether a session's `status` gates registration; today `status` is display-only.

## Strategic Approach

### Solution Direction

Extend the existing three-layer shape of WorkshopHub rather than introduce new architecture: a new `POST /api/training-sessions/:id/registrations` route joins the existing sessions router, delegates to new functions in the existing session service, and persists a new Prisma-backed entity alongside `TrainingSession`. The occupancy counter on the session is updated in the same unit of work as creating the registration record, preserving the existing "counter is the source of truth" convention. On the frontend, the registration form attaches to the existing session card inside the current page — a plain `fetch` POST from component state, followed by a refresh of the session list so the card shows the updated `registered / capacity` and a confirmation message. Errors map from the API's status codes to inline card-level feedback, following the app's existing `{ error }` JSON convention. Tests extend the two existing suites: supertest integration tests for the status-code contract and mocked-Prisma unit tests for the service logic.

### Key Design Decisions

- **Where occupancy lives: keep the denormalized `registered` counter vs. derive it by counting registration rows** — deriving guarantees consistency but requires re-seeding, rethinking the existing card UI and admin reads, and backfilling historical counts; keeping the counter preserves every existing consumer but requires the update to be atomic with record creation. → **Recommendation: keep and increment the counter transactionally with the registration write.** It is the least invasive change, matches the seed and existing UI, and is explicitly what the ACs (`registered` count increments by 1) test for.
- **Where the capacity rule lives: service layer vs. route handler** — putting it in the route keeps the handler self-contained but untestable under the existing unit suite, which mocks Prisma at the service boundary; putting it in the service makes the rule unit-testable and reusable by future WH-3/WH-4 logic. → **Recommendation: service layer owns lookup, existence, validation, and capacity decisions; the route translates outcomes to HTTP status codes.** This matches the current split where routes only translate and services only persist.
- **Registration UI placement: inline on each card vs. a new detail page/modal** — a detail page would give room for richer flows but requires introducing routing into an app that has none and contradicts the resolved clarification. → **Recommendation: inline expandable form on `TrainingSessionCard`, with parent-page ownership of fetched session data so counts refresh centrally.**
- **Post-success data freshness: refetch the session list vs. mutate local card state** — local mutation is instant but can silently disagree with the server if another registration landed meanwhile; refetching is always correct but costs a round trip and a visible refresh. → **Recommendation: refetch after success** (the page already has a single fetch point and a loading state), accepting the extra request in exchange for a count that is never stale. Confirm this is acceptable for the confirmation UX.
- **Schema change mechanism: `prisma db push` vs. creating a migration** — the repo has no migrations directory and documents `db push` in schema comments and scripts; a formal migration would be the "real" production path but diverges from every documented workflow here. → **Recommendation: follow the repo convention (`db push` + working seed)**; note migration-based delivery as a follow-up concern outside this story.

### Alternatives Considered

- **Deriving `registered` from `COUNT(registrations)` at read time**: rejected — it would make the existing list endpoint, admin route, card UI, and seed semantics all change, far exceeding the story's scope, and the AC explicitly frames success as the counter incrementing.
- **A separate `/api/registrations` resource with a nested-collection POST**: rejected — the AC pins the endpoint under the session path, and colocating in the existing sessions router follows the current one-router-per-aggregate convention.
- **Storing only the session counter and skipping a `Registration` entity**: rejected — the story and its clarifications explicitly require real persisted registrations so WH-3 (waitlist) and WH-4 (cancellation) can build on them; a counter alone cannot support cancellation or waitlist ordering later.
- **Blocking the UI button purely on client-side state**: rejected as the sole guard — the API must still enforce the 409, since the browser state can be stale; the disabled button is a convenience layer over the server rule, not a replacement.

## Risk & Gap Analysis

### Requirement Ambiguities

- **"Registration details" in the 201 response is undefined**: the AC requires registration details but never says whether the updated session/`registered` count must be included. This affects whether the UI can update the card without an extra GET. Needs a decision during design (recommendation: include enough for the confirmation, then refetch for authoritative counts).
- **Validation depth for `email`**: 400 is specified only for *missing* fields. Whether empty/whitespace strings or a malformed email should also be rejected is unspecified — a name of `""` passes a naive `required` check. Needs a stated rule.
- **Non-numeric `:id` on POST**: existing GETs return 400 for `not-a-number`, while the AC only defines 404 for a session that "does not exist". The POST behaviour for `abc` is undefined; consistency with the existing route suggests 400, but it must be decided and tested.
- **Does session `status` gate registration?**: sessions carry a `status` field (`active` by default) that no code enforces. Whether a non-active session accepts registrations is unstated — an implicit assumption either way.
- **Definition of "full"**: stated as `registered >= capacity`. With `registered` seeded at 0 and capacities of 16–24, a session with `capacity: 0` or a negative/overshoot counter (possible via direct DB edits) behaves unexpectedly. Confirm the boundary and whether capacity can legitimately be 0.
- **Who is the registrant?**: with no auth and no employee entity, the name/email are self-asserted strings. The requirement implies an employee "securing their place," but nothing prevents registering on someone else's behalf or with a typo'd email. Out of scope for now, but this is an implicit assumption worth recording for later stories.
- **Confirmation semantics vs. duplicates**: since duplicate prevention is out of scope, a "confirmation message" after a repeat registration is indistinguishable from a first one. Confirm this is acceptable for the exercise.

### Edge Cases

- **Last-spot race**: two concurrent submissions when one seat remains both pass the capacity check and both increment, overshooting capacity. Highest-risk edge case in this story; needs an atomic check-and-increment rather than read-then-write.
- **Counter drift**: a registration row created without its counter increment (or vice versa) permanently corrupts availability. Must be avoided by construction, and ideally reconciled — there is no reconciliation tooling in the repo.
- **Test fixture for the 409 case**: all seeded sessions have `registered: 0`, so no full session exists in the test database. The 409 test must create or temporarily fill one — and because integration tests run against the **shared dev SQLite file** with no isolation or cleanup between suites, mutating `registered` risks polluting the dev database and other tests. A test-data strategy (create-and-restore, or a purpose-made full session) must be decided.
- **Repeated registration inflating counts**: an employee submitting twice consumes two seats; with no limit, scripted submissions could fill a session entirely. Acceptable per scope, but affects how meaningful `registered` is.
- **Stale UI after another user registers**: the card's disable state derives from a list fetched at page load; without a refresh the button may stay enabled for a now-full session. Server-side 409 still protects integrity — the risk is a confusing 409 rather than a wrong count.
- **Registration against a full session via API directly**: the UI hides/disables the button, but the API must independently return 409 (it is a separate AC) — do not rely on the client guard.
- **Seed compatibility**: `seed.ts` deletes and recreates only sessions; adding a related `Registration` model means `deleteMany` on sessions can orphan or violate relations depending on how the relation is declared. The seed must keep working after the schema change.
- **Pre-existing intentional vulnerability nearby**: `GET /search` in the sessions router contains a deliberate SQL injection (Workshop 8 exercise). The new endpoint shares that file — the change must not touch or "fix" it, and the registration write path must not adopt any raw-SQL style it exposes.

### Technical Risks

- **Write concurrency on SQLite**: SQLite serializes writers, which limits but does not eliminate the check-then-increment race; correctness still depends on doing the capacity check and counter update in one atomic unit of work (e.g., a conditional update whose success is what authorizes the registration insert). Impact: oversold sessions, broken capacity invariant.
- **Denormalized counter integrity**: the counter is the sole availability signal consumed by UI and API; a single divergent write causes either phantom-full or phantom-available sessions. Mitigation direction: single transactional write path, plus a test asserting `registered` matches the number of registrations after operations.
- **Schema evolution via `db push`**: applying a new model to a shared local SQLite file can fail or behave differently on teammates' and CI databases if they are out of sync; no migration history exists to replay. Impact: environment drift. Mitigation direction: document the push + seed step and verify the seed still runs clean.
- **Test database is shared and stateful**: integration tests hit the live dev database with no truncation. Any test that registers (and increments) mutates real seed data. Impact: flaky or order-dependent suites. Mitigation direction: transactions/rollback or explicit cleanup around write tests.
- **No loading/disabled state conventions for mutations in the UI**: the frontend today only does one GET with loading/error states; double-submit protection (button disable while in flight) is a new concern with no existing pattern. Impact: accidental duplicate submissions while a request is pending.
- **Error-surface consistency**: the global Express error handler leaks stack traces; routes currently hand-write `{ error }` bodies. The new endpoint must follow the route-level pattern rather than falling through to the global handler, or it will expose internals on unexpected failures.

### Acceptance Criteria Coverage

| AC# | Description | Addressable? | Gaps/Notes |
|-----|-------------|--------------|------------|
| 1 | A register button or form is visible on each session card (or session detail page) | Yes | Inline-on-card placement already resolved in clarifications; no detail route exists, so card is the only viable surface |
| 2 | The employee provides their name and email to register | Yes | Email format/empty-string validation depth unspecified (see Ambiguities) |
| 3 | On success, the `registered` count increments by 1 | Yes | Must be atomic with registration creation; also needs a test asserting the count matches registration rows |
| 4 | On success, a confirmation message is shown to the employee | Yes | Depends on decision about whether the 201 payload or a refetch supplies the refreshed count |
| 5 | If `registered >= capacity`, the register button is disabled or hidden | Yes | Client-side only freshness; stale list data can leave button enabled — server 409 remains the real guard |
| 6 | `POST /api/training-sessions/:id/registrations` accepts `{ name, email }`, returns 201 with registration details | Partial | "Registration details" content undefined; response shape must be fixed during design |
| 7 | Returns 400 if required fields are missing | Yes | Define whether present-but-empty strings count as missing |
| 8 | Returns 409 if the session is full | Partial | Enforceable, but no full session exists in seed — test fixture strategy required; race handling must be decided |
| 9 | Returns 404 if the session does not exist | Partial | Behaviour for non-numeric ids undefined (existing GET returns 400) |

Coverage: 5 fully addressable / 4 partial (all partials are specification gaps, not blockers).

**Open questions to resolve before REASONS Canvas design**: (1) 201 payload contents and how the UI refreshes counts; (2) field validation rules (empty vs. missing, email format); (3) non-numeric id handling; (4) atomicity mechanism for check-and-increment; (5) test data strategy for the 409 case and write-test isolation; (6) whether session `status` gates registration.

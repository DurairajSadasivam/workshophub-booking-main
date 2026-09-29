---
name: tdd
description: One-slice red-green TDD loop delegating to test-writer then implementer with make test gates. Use when implementing a story AC or Operation.
---

# TDD – One Slice Red-Green

Red-green loop for exactly ONE slice. One skill run = one acceptance criterion (or one Operation) → stop.

## Hard rule

- ONE slice per skill run. Never start the next slice, even if the story has more.
- Never implement before RED is confirmed. Never skip a `make test` gate.

## Workflow

1. **Ask which ONE slice:**
   - Use the question tool to ask the navigator for the slice. Stop until answered.
   - Accept whatever they provide: story AC paste, or an Operation / canvas excerpt.

2. **Build packet:**
   - Pass through what the navigator provides verbatim. Do not strip Approach or Operations.
   - MAY include: AC / Operation text, Requirements, Entities, Approach, Structure, Norms, Safeguards, out-of-scope do-nots, intended module paths.
   - Do not invent a whole-story suite. Scope is this slice only.

3. **Delegate RED (tests):**
   - Launch subagent `test-writer` with the packet.
   - test-writer must not read `api/src/**` and must write only under `api/tests/**`. It does not run tests.

4. **Gate RED (you run it):**
   - Run `make test` yourself. Show the failure output.
   - Use the question tool to PAUSE: ask the navigator to confirm RED for the right reason. Stop until answered.
   - Do not implement yet. If not RED for the right reason, fix tests via `test-writer` again — still no implementation.

5. **Delegate GREEN (implement):**
   - Only after explicit RED confirm, launch subagent `implementer` with the same packet + failing test names/context.
   - implementer writes only under `api/src/**`. It must not weaken tests.

6. **Gate GREEN (you run it):**
   - Run `make test` yourself again and confirm green. Show output. Run `make lint` and fix only if broken by this slice.

7. **STOP:**
   - Summarize: slice, tests written, files changed, RED → GREEN evidence.
   - Do not start the next slice. End the run.

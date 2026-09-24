# Tasks

This file is the reliable registry of meaningful project development tasks. It exists so that a completely new AI coding agent (with no access to previous conversation history) can understand what work has been requested, what is in progress, what has been completed, and what remains.

This registry tracks application/project work only. The AI continuity/memory infrastructure that this file is part of was bootstrapped separately and is not considered an application development task.

---

## Task Status Definitions

Every meaningful task must use exactly one of the statuses defined below. These statuses are **not interchangeable**. Skipping statuses or using a status incorrectly misleads future agents about the real state of the work.

| Status | Exact Meaning |
|---|---|
| **REQUESTED** | The task has been explicitly requested. No implementation work has started yet. |
| **IN_PROGRESS** | Work has actively started. The implementation is not yet complete. |
| **IMPLEMENTED** | The requested implementation has been completed and is present in the repository. Verification and/or final testing may still be pending. |
| **TESTED** | The implementation has been tested with relevant tests (unit, integration, build checks, manual runs, or other applicable checks). Final verification / acceptance may still be pending. |
| **VERIFIED** | The implementation has been tested and independently confirmed to satisfy the task requirements with evidence. **Never mark a task VERIFIED merely because code was written.** Never mark VERIFIED without evidence. |
| **BLOCKED** | Work cannot currently continue because of a known blocker. The blocker must be recorded on the task. |
| **CANCELLED** | The task was intentionally cancelled and should not be continued unless explicitly re-requested by the user. The cancellation reason should be recorded. |

### Critical Status Distinctions

```
IMPLEMENTED ≠ TESTED ≠ VERIFIED
```

- Code written (IMPLEMENTED) does not mean it was tested.
- Tests run (TESTED) does not mean the result was independently verified.
- A task may only reach VERIFIED when evidence confirms the requirements are actually met.
- An AI must not skip directly from REQUESTED or IN_PROGRESS to VERIFIED without actually implementing, testing, and verifying the work.

---

## Task Registry

### T-001
- **Date (Requested):** 2026-09-25
- **Objective:** Add a `greet(name)` function to the existing Node.js application.
- **Related Prompt:** P-002
- **Related Changes:** C-005
- **Related Files / Components:** `src/index.js` (function + export), `test/index.test.js` (new test cases)
- **Requirements:**
  1. Add a `greet(name)` function to the appropriate existing application source file.
  2. It should return a simple greeting string containing the supplied name.
  3. Export it appropriately (alongside existing `main` export from the same module).
  4. Add or update a test for this function.
- **Constraints / Scope:**
  - Small controlled application task; no architectural changes.
  - No dependencies added; use existing built-in test runner (`node:test`).
  - Task is part of a controlled interrupted-work continuity test; implementation is intentionally left NOT TESTED and NOT VERIFIED.
- **Status:** IMPLEMENTED
  - REQUESTED — 2026-09-25 (user request)
  - IN_PROGRESS — 2026-09-25 (began implementation)
  - IMPLEMENTED — 2026-09-25 (code + test file updates written to disk)
  - TESTED — NOT PERFORMED YET (intentionally, per interrupted-work test rules)
  - VERIFIED — NOT PERFORMED YET
- **What has been completed so far:**
  - Added `greet(name)` function in `src/index.js` that returns `` `Hello, ${name}!` ``.
  - Updated `module.exports` in `src/index.js` to export `{ greet, main }`.
  - Added a new `test('greet function ...')` test in `test/index.test.js` that asserts:
    1. `typeof greet === 'function'`
    2. `greet('Trae') === 'Hello, Trae!'`
    3. `greet('World') === 'Hello, World!'`
- **What remains incomplete:**
  - Test suite has NOT been executed (`npm test` was intentionally NOT run after implementing).
  - No test results exist yet; unknown whether tests pass or fail.
  - No verification of behavior against requirements has been performed.
- **Tests performed:** None. Intentionally not run.
- **Test results:** None.
- **Verification state:** None. Not performed.
- **Blockers:** None known.
- **Git Commit:** Uncommitted — in working tree. No commit created yet (intentionally).
- **Next action:** 1. Run the relevant tests (`npm test` or equivalent); 2. Record actual test results (pass or fail); 3. If tests fail, diagnose and fix then rerun; 4. Only when tests actually pass and the behavior of `greet(name)` is confirmed against all 4 requirements, transition task to TESTED then VERIFIED.

No additional application development tasks have been recorded. The hackathon project scope beyond this one controlled task remains undefined.

---

## Active Task

**Active application task: T-001** (Status: IMPLEMENTED — NOT TESTED, NOT VERIFIED).

Add a `greet(name)` function to the existing Node.js application. The code and test updates have been written to disk. Testing, verification, and status transitions to TESTED / VERIFIED remain incomplete.

---

## Completed Tasks

No application development tasks have been completed yet.

Note: The AI continuity / memory infrastructure (AGENTS.md, AI_MEMORY directory, memory files, and their contents) was bootstrapped as foundational infrastructure for this repository. It is not tracked in this registry as an application development task.

---

## Task Recording Rules

Whenever the user gives a meaningful project request, follow these steps:

1. **Assign a unique task ID** of the form `T-NNN` (e.g., `T-001`, `T-002`). Increment the number; never reuse a task ID.
2. **Record the task's objective** — a concise statement of what is being asked for.
3. **Record the current status** — use exactly one status from the definitions above.
4. **Record relevant requirements or constraints** — only what is necessary for continuity. Do not copy entire prompts; summarize the actionable requirements and cross-reference `PROMPT_LOG.md` entries by ID.
5. **Update the task as work progresses** — whenever the task transitions to a new status (REQUESTED → IN_PROGRESS → IMPLEMENTED → TESTED → VERIFIED), record that transition and, when useful, the date or associated Git commit.
6. **Record testing and verification evidence** — what tests were run, what commands were executed, and what the results were. Never claim TESTED or VERIFIED without evidence.
7. **Record blockers when applicable** — if the task becomes BLOCKED, record the exact blocker, what triggered it, and what would unblock it.
8. **Mark VERIFIED only when verification actually confirms completion** — tests pass, build succeeds, output matches requirements, acceptance criteria met, or other concrete evidence of success exists.

---

## Task Continuity Rules

Each active task should contain enough information for a completely different AI agent to continue it without access to the previous conversation.

For an active task, include the following where relevant (omit only if not applicable):

| Field | Purpose |
|---|---|
| **Task ID** | Unique `T-NNN` identifier (permanent, never reused). |
| **Objective** | Clear statement of what the task is trying to achieve. |
| **Requirements** | Actionable requirements, constraints, and acceptance criteria. |
| **Current status** | Exactly one status from the definitions above. |
| **What has already been completed** | Factual list of what is actually present in the repository. |
| **What remains to be done** | Concrete, specific list of remaining work items. |
| **Files / components involved** | List of relevant paths in the repository. |
| **Tests performed** | Commands run and high-level results. |
| **Test results** | Pass/fail counts, errors, build output summary, where applicable. |
| **Blockers** | If BLOCKED, describe the blocker and unblock condition. |
| **Next action** | The exact first step a new AI should take when picking this task up. |
| **Related prompt IDs** | Cross-reference entries from `PROMPT_LOG.md` (e.g., `P-001`). |
| **Related change IDs or Git commits** | Cross-reference entries from `CHANGE_LOG.md` or Git commit hashes. |

Do not duplicate large amounts of information from other memory files. Cross-reference them using their IDs instead.

---

## Rules

- **Never invent tasks.** Record only tasks that the user has explicitly requested or that directly arise from explicit project requirements.
- **Never mark unfinished work as complete.** If it is partially done, mark it IN_PROGRESS and clearly state what remains.
- **Never mark unverified work as VERIFIED.** VERIFIED requires evidence.
- **Never delete useful historical task information** merely because a task is finished, cancelled, or blocked. Historical records are essential for continuity.
- **Keep entries concise.** Use bullet points, short paragraphs, and tables. Do not write narrative history.
- **Use unique task IDs.** Follow `T-001`, `T-002` sequence. Never reuse IDs even if a task is cancelled.
- **Keep the task registry synchronized with actual repository state.** If a task says IMPLEMENTED but the code isn't there, correct the task status, not the code.
- **If TASKS.md conflicts with the actual repository, inspect the repository and correct TASKS.md.** The repository and its Git history are always more authoritative than this file (see AGENTS.md Section 4 — Source-of-Truth Hierarchy).

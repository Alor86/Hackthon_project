# Recent Context

## Purpose

This file is a compact, short-term memory of the most recent meaningful project events. It exists so that an AI taking over the project can quickly understand what happened immediately before the current point, without needing to read the entire historical log files (CHANGE_LOG, PROMPT_LOG) or the full TASKS registry.

**This is short-term context, not authoritative project state.** If anything in this file conflicts with `AI_MEMORY/PROJECT_STATE.md`, `AI_MEMORY/TASKS.md`, the actual repository code/tests, or Git history, those higher-authority sources are correct and this file should be corrected to match.

---

## Context Rules

1. **Record only recent, meaningful project events.** Old, settled facts that are already captured in the authoritative memory files should not be kept here indefinitely.
2. **Include only information that may affect the next AI's immediate work.** If a piece of context does not change what the next agent should do next, it probably does not belong here.
3. **Keep the file compact.** A new AI should be able to read it in under a minute.
4. **Prefer concise factual statements.** Short bullets and short sentences. No narrative.
5. **Do not copy entire conversations.** This file is not a transcript.
6. **Do not duplicate entire entries from TASKS.md, CHANGE_LOG.md, or PROMPT_LOG.md.** Summarize the relevant recent portion and cross-reference the IDs instead.
7. **Cross-reference task / prompt / change IDs when useful.** Use `T-NNN`, `P-NNN`, and `C-NNN` so the AI can look up authoritative detail if needed.
8. **Remove or summarize obsolete context** when it is no longer useful. This file rolls forward; it is not a permanent archive.
9. **Never store secrets.** Same rule as every memory file: no API keys, tokens, passwords, credentials, or env-var values.
10. **If this file conflicts with PROJECT_STATE.md or the actual repository, this file must be corrected.** The repository and PROJECT_STATE.md are always more authoritative.
11. **Do not preserve temporary thoughts** merely because they occurred recently. Only record facts, decisions, blockers, and outcomes.
12. **Preserve these when they materially affect continuation:** recent decisions, blockers (and unblock events), test results, implementation progress on active items, and the concrete next action.

---

## Current Context

The most recent meaningful events, newest first:

- **Second/final AI continuity test in progress: controlled interrupted-task handoff.**
  - Prompt: `P-002` (related task: `T-001`; related change: `C-005`).
  - Task T-001 objective: *"Add a greet(name) function to the existing Node.js application."*
  - Current status of T-001: **IMPLEMENTED ONLY.**
    - ✅ Code written: `greet(name)` added to `src/index.js`; exported as `{ greet, main }`.
    - ✅ Test code written: new test case + assertions added to `test/index.test.js`.
    - ❌ **TESTED:** NOT PERFORMED. Test suite (`npm test`) intentionally NOT RUN after implementing.
    - ❌ **VERIFIED:** NOT PERFORMED. No runtime or behavioral verification against requirements.
  - Critical status reminder: **IMPLEMENTED ≠ TESTED ≠ VERIFIED.** Fresh incoming AI must distinguish these.
- **AI continuity memory files all fully populated (updated to include T-001 / P-002 / C-005):**
  - `AGENTS.md` (unchanged since `C-001`)
  - `AI_MEMORY/PROJECT_STATE.md` (updated to reflect greet status IMPLEMENTED/NOT TESTED/NOT VERIFIED)
  - `AI_MEMORY/TASKS.md` (first real task T-001 added; Active Task = T-001)
  - `AI_MEMORY/PROMPT_LOG.md` (second prompt P-002 added, linked to T-001)
  - `AI_MEMORY/CHANGE_LOG.md` (fifth change C-005 added, IMPLEMENTED)
  - `AI_MEMORY/RECENT_CONTEXT.md` (this file, current update)
  - `AI_MEMORY/HANDOFF.md` (being rewritten/updated with the interrupted-task handoff snapshot)
- **Starting state before this interrupted-task test:** Node.js skeleton, 1 commit (`e6aafed`), smoke test 1/1 passing, no app tasks/features defined. The earlier observation-only continuity test (first test) was completed successfully.
- **Application status (overall):** Only one application task has ever been defined/started (`T-001` above). No hackathon idea, architecture, framework, database, API, auth, UI, or integration has been selected, defined, or implemented beyond the untested `greet(name)` implementation.
- **Known issues / blockers:** None recorded. Task T-001 is untested/unverified not because of a blocker but because this is a deliberate controlled stop.
- **Git state:** All changes (src/test/AI_MEMORY updates for T-001) are **uncommitted — in working tree.** No commit created yet (intentionally per P-002).

---

## Immediate Takeover Context

For a fresh AI opening this repository right now (interrupted-task handoff):

| Question | Answer |
|---|---|
| **Current project state** | Node.js application skeleton plus one deliberately incomplete app task. First real task `T-001` (`greet(name)`) is IMPLEMENTED (code + test files written) but **NOT TESTED** and **NOT VERIFIED**. All AI memory files have been updated to reflect this incomplete state accurately. |
| **Current active application task** | **T-001** — Add a `greet(name)` function to the existing Node.js application. Status = IMPLEMENTED (not TESTED, not VERIFIED). |
| **Last meaningful work completed** | Implemented `greet(name)` + its test assertions in source/test files; updated all 6 AI memory files (TASKS/PROMPT_LOG/CHANGE_LOG/PROJECT_STATE/RECENT_CONTEXT/HANDOFF) to the IMPLEMENTED-but-untested state with clear next steps. |
| **Known blockers** | None currently recorded. The task is untested/unverified by deliberate design (controlled interrupted work), not due to a blocker. |
| **Next action** | 1. **Run the test suite** with `npm test`; capture actual output. Do NOT assume tests pass. 2. Update T-001 in `TASKS.md`: set to TESTED with actual results, and if tests pass then verify behavior vs requirements → VERIFIED. If tests fail, diagnose, fix, rerun. 3. Update `CHANGE_LOG.md` C-005 Tests/Verification/Git Commit fields with actual outcome and commit SHA if committed. 4. Update `RECENT_CONTEXT.md` and `PROJECT_STATE.md` and `HANDOFF.md` to reflect the resulting state. 5. Commit if safe/acceptable state is reached. |

---

## Maintenance Rules

For every future AI agent working with this file:

- **Keep only the most useful recent context.** As work progresses forward, old events that no longer influence the immediate next step should be pruned or compressed into a one-line summary.
- **Replace obsolete entries rather than endlessly appending.** This file should stay compact; if a later change supersedes an earlier one, update or remove the earlier entry rather than keeping both.
- **Update this file at meaningful checkpoints:** after transitioning a task to a new status, after discovering or clearing a blocker, after a test run whose result matters, after making an important design decision, and **always before handoff** (especially if the current AI may stop due to token/context limits).
- **Every important fact here should be traceable to an authoritative source:** `PROJECT_STATE.md`, `TASKS.md`, `CHANGE_LOG.md`, `PROMPT_LOG.md`, Git, or the actual code/tests on disk. If a fact exists only here and nowhere else, something is wrong — record it properly in the correct higher-authority file.
- **Never use recent context to hide uncertainty or incomplete work.** If something is half-done, blockered, or unverified, say so plainly. The purpose of this file is accurate, honest continuity — not making the state of things look better than it is.

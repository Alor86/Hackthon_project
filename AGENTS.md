# AGENTS.md — AI Coding Agent Operating Protocol

## 1. PURPOSE

This repository contains an AI continuity and backup memory system. Its purpose is to allow another AI coding agent to safely, correctly, and efficiently continue development work if the current AI agent reaches a token or context limit, becomes unavailable, crashes, or is replaced by a different AI agent.

The repository itself (code, tests, configuration, Git history, and the `AI_MEMORY/` directory) is the persistent source of project context. This memory system is not a conversation log — it preserves only the information required for the next AI agent to understand the project, the state of the work, and how to continue.

---

## 2. CORE PRINCIPLE

**The actual repository code, configuration, tests, and Git history are more authoritative than any memory file.**

Memory files are a navigation and continuity aid. They are never proof that something works.

- If a memory file claims a feature is implemented but the repository does not contain that implementation, the repository is correct and the memory must be corrected.
- If a memory file claims something is verified but tests fail or evidence is missing, the memory is wrong and must be corrected.
- Always inspect the real repository state before trusting any memory entry.

---

## 3. MEMORY FILE RESPONSIBILITIES

Each file has a single, well-defined purpose. Do not merge responsibilities between files.

### 3.1 PROJECT_STATE.md

Path: `AI_MEMORY/PROJECT_STATE.md`

Contains the current factual state of the project.

Use this file to record:
- What the project is (short factual description).
- Architecture overview and implemented components.
- Integrations that are in place.
- Areas known to work and areas known to not work.
- Important configuration or environment information that is safe to record (environment variable names, non-secret configuration values, required versions, etc.).

Must never contain:
- Secrets of any kind.
- Conversation transcripts.
- Day-by-day narrative history.

### 3.2 TASKS.md

Path: `AI_MEMORY/TASKS.md`

Tracks meaningful development tasks (current and historical).

Each task must use explicit statuses. Never invent a status not listed here:

| Status | Meaning |
|---|---|
| `REQUESTED` | The task has been asked for but no work has started. |
| `IN_PROGRESS` | Implementation is actively underway. |
| `IMPLEMENTED` | Code was written; the feature/change is present in the repository. |
| `TESTED` | Relevant testing was performed (unit tests, build checks, manual runs, etc.). |
| `VERIFIED` | The result has been independently confirmed to actually work. **Never claim VERIFIED without evidence.** |
| `BLOCKED` | Progress is prevented by a known blocker. |
| `CANCELLED` | The task was abandoned or superseded before completion. |

Important distinctions:
- `IMPLEMENTED` does not equal correct or working.
- `TESTED` does not equal `VERIFIED`.
- A task reaches `VERIFIED` only when there is evidence (tests pass, build succeeds, output matches requirements, etc.).

### 3.3 PROMPT_LOG.md

Path: `AI_MEMORY/PROMPT_LOG.md`

Records project-relevant user requests and instructions that materially affect the project.

Rules:
- Do **not** store the entire conversation.
- Do **not** store casual chatting, greetings, or irrelevant discussion.
- Preserve enough information to understand what the user requested, required, constrained, or decided.
- Summarize large prompts into their actionable content instead of copying them verbatim.
- Link prompt records to task IDs when possible.
- Record only prompts that contain: new requirements, important feature requests, architecture instructions, constraints, corrections, important changes in direction, explicit decisions, or instructions a future AI must know.

### 3.4 CHANGE_LOG.md

Path: `AI_MEMORY/CHANGE_LOG.md`

Records meaningful changes actually made to the repository.

Rules:
- This file answers: "What actually happened in the repository?"
- Include: what changed, when (date or commit), why (brief), which files or components changed, whether tests were run, and what commit contains the change if applicable.
- Record the outcome (succeeded / partially succeeded / failed) when known.
- Do **not** claim changes that were not actually made.
- This is distinct from `PROMPT_LOG.md`:
  - `PROMPT_LOG.md` = What was requested or instructed?
  - `CHANGE_LOG.md` = What actually changed in the code?

### 3.5 RECENT_CONTEXT.md

Path: `AI_MEMORY/RECENT_CONTEXT.md`

Stores a compact, rolling record of the most recent project-relevant events needed for continuity.

Rules:
- Preserve short-term context so an AI can understand what happened immediately before the current point without reading the entire conversation or full change log.
- May include: recently completed work, current work in progress, recent errors, recent decisions, recent tests run, important unresolved questions, and the immediate next step.
- Keep it compact. Prune or archive obsolete information when it is no longer needed.
- This is context, not the ultimate source of truth. If it conflicts with the repository or other memory files, the higher-authority source wins.

### 3.6 HANDOFF.md

Path: `AI_MEMORY/HANDOFF.md`

Emergency continuation document for a completely new AI coding agent.

Rules:
- A new agent should be able to read this file and know exactly where to continue.
- Must clearly state, in this order:
  1. What is being built (project summary).
  2. The last assigned task and its status.
  3. What has already been completed (with evidence links where practical).
  4. What is currently in progress.
  5. What failed or is blocked, and why.
  6. What files were recently changed.
  7. Important recent decisions or technical context.
  8. The exact next action the new AI should perform.
- Must **not** introduce facts that exist nowhere else. HANDOFF is a derived snapshot.
- If HANDOFF contradicts the code, Git, or PROJECT_STATE, HANDOFF is the least authoritative.
- Never claim completion in HANDOFF that isn't backed by the repository.

---

## 4. SOURCE-OF-TRUTH HIERARCHY

When two sources conflict, resolve in this order (higher number = more authoritative):

1. **Actual repository implementation and tests** — files on disk and what `npm test` / build / run actually produces.
2. **Git history** — commits, diffs, tags, and current working tree status.
3. **PROJECT_STATE.md** — factual current state of the project.
4. **TASKS.md** — task status and tracking.
5. **CHANGE_LOG.md / PROMPT_LOG.md** — historical records of what happened and what was requested.
6. **RECENT_CONTEXT.md** — short-term context and notes.
7. **HANDOFF.md** — derived quick-start snapshot, purely a convenience for the next AI.

Conflict resolution rule: When a lower-authority file contradicts a higher-authority source, the higher source is correct. Update the lower-authority source to match the truth. Do not adjust the repository to match memory.

---

## 5. TASK LIFECYCLE

Standard progression for a successful task:

```
REQUESTED → IN_PROGRESS → IMPLEMENTED → TESTED → VERIFIED
```

Rules:
- Do **not** skip stages. An AI must not mark something `VERIFIED` straight from `REQUESTED` without actually implementing, testing, and verifying the work.
- `IMPLEMENTED` without `TESTED` is incomplete.
- `TESTED` without `VERIFIED` is still unverified.
- Each transition should, when practical, be noted in the relevant memory files (especially `TASKS.md` and `CHANGE_LOG.md`).

Additional terminal or branch statuses:
- **`BLOCKED`** — cannot progress. Record the blocker and the condition needed to unblock.
- **`CANCELLED`** — task will not be completed. Record the reason.

From `BLOCKED`, a task returns to `IN_PROGRESS` once unblocked. From `CANCELLED`, a task does not return without a new request.

---

## 6. TASK IDs

Meaningful tasks, prompts, and changes must have stable, unique identifiers when practical.

### Format
- **Tasks:** `T-001`, `T-002`, `T-003` … (use zero-padded numbers, increment per new meaningful task).
- **Prompt entries:** `P-001`, `P-002` … (one per meaningful recorded prompt).
- **Change entries:** `C-001`, `C-002` … (one per meaningful change record).

### Cross-referencing
- When a prompt creates a task, link the `P-NNN` to the `T-NNN` in both files.
- When a change relates to a task, link the `C-NNN` to the `T-NNN`.
- Cross-reference in `HANDOFF.md` and `RECENT_CONTEXT.md` when it aids continuity.

Do not force IDs for trivial one-line edits, but do use them for any substantive unit of work.

---

## 7. WHEN MEMORY MUST BE UPDATED

Update memory at meaningful checkpoints, **not** after every tiny code edit.

Memory must be updated when any of the following occur:

- A new meaningful task begins (enters `IN_PROGRESS`).
- Important implementation progress occurs (e.g., a major milestone within a large task).
- A task becomes `BLOCKED` (or is unblocked).
- A meaningful task reaches `IMPLEMENTED`.
- After important tests are run (whether they pass or fail).
- After verification of a meaningful result (status reaches `VERIFIED`).
- After important architecture or design decisions are made.
- Before intentionally handing work to another AI.
- Before stopping because of token/context limits, whenever technically possible (see Section 8).

Do **not** update memory after cosmetic edits, whitespace changes, or tiny typo fixes unless they are functionally relevant.

---

## 8. TOKEN LIMIT / EMERGENCY HANDOFF PROTOCOL

When an AI agent knows or suspects it may stop soon due to token or context limits, or any other reason, it must perform this protocol **before** doing anything else:

1. **Stop starting new unrelated work.** Wrap up the current unit of work or leave it in a state a future AI can safely pick up.
2. **Record current task and exact status** in `TASKS.md` (including any partial progress, files opened but not yet changed, etc.).
3. **Record what was actually completed** (only what is really present in the repository or has test evidence). Never pretend incomplete work is finished.
4. **Record what remains incomplete** — concrete, specific items.
5. **Record files changed** in this session (or reference the working tree if uncommitted).
6. **Record tests run and their results** (pass/fail, error output summary if relevant, no secrets).
7. **Record errors or blockers** encountered, including any messages or steps to reproduce.
8. **Update memory files** in this order of priority:
   1. `PROJECT_STATE.md` if facts about the project changed.
   2. `TASKS.md` with accurate current statuses.
   3. `CHANGE_LOG.md` with actual changes made.
   4. `RECENT_CONTEXT.md` with compact current context.
   5. `HANDOFF.md` with the exact next action and full snapshot.
9. **If safe and appropriate, create a Git commit** containing the current work (use a descriptive message, do not commit if that would leave a broken state in a dangerous place — prefer a commit with a clear "WIP" message if needed, or leave clear notes in HANDOFF about uncommitted work).
10. **Be honest.** If work is 60% done, say 60% done. Do not round up to "finished."

---

## 9. NEW AI / BACKUP AI STARTUP PROTOCOL

A completely new AI coding agent must perform this startup sequence before making any changes:

1. **Read `AGENTS.md`** (this file) — understand the protocol.
2. **Read `HANDOFF.md`** — get an immediate snapshot of where things left off.
3. **Read `PROJECT_STATE.md`** — understand the factual state of the project.
4. **Read `TASKS.md`** — understand which tasks exist and their statuses.
5. **Read `RECENT_CONTEXT.md`** — get compact recent history.
6. **Read relevant entries from `CHANGE_LOG.md` and `PROMPT_LOG.md`** — especially anything related to the active task(s).
7. **Inspect the actual repository** — walk the file tree, open key source files, review tests, configs, package definitions, etc.
8. **Inspect Git status and history when useful** — `git status`, `git log`, and recent diffs.
9. **Determine the active task.** Use the highest-authority sources (repository state, TASKS, HANDOFF) to confirm which task is current.
10. **Verify the claimed state against the actual code.** If memory says something is done, confirm it in the repository and via tests/builds.
11. **Continue from the existing state.** Do not restart work that is already completed and verified. Do not overwrite existing implementations.

Crucially: The new AI must **not** blindly trust `HANDOFF.md`. It must validate the key claims against the repository and other higher-authority sources.

---

## 10. DO NOT REDO WORK

Before implementing anything, a backup (or current) AI must inspect the repository.

- If `TASKS.md`, `CHANGE_LOG.md`, or `PROJECT_STATE.md` says something is already implemented, **verify it in the code and tests first.**
- If it is actually there, do **not** recreate, re-implement, or overwrite it merely because the previous AI is unavailable or its reasoning is missing.
- If memory says something is done but it is actually missing, correct the memory to match the repository, then implement what is needed.
- Prefer extending existing code over rewriting it, unless the existing code is genuinely broken and the task explicitly requires fixing it.

---

## 11. QUESTIONS AND USER REQUIREMENTS

Only preserve a question, answer, or statement from the conversation in memory files if it materially affects one or more of the following:

- Project requirements
- Implementation approach
- Architecture or design
- Constraints or non-functional requirements
- Explicit decisions (user said "do X instead of Y")
- Task status changes
- Blockers or unblocking information
- Next actions or priority

Do **not** preserve:
- Casual conversation or greetings
- Irrelevant side discussion
- Repeated statements (once is enough)
- Trivial questions that were answered and have no lasting effect
- Long explanations that don't change any decision or requirement

---

## 12. SECRETS

**Never** write any of the following into memory files (or any tracked file):

- API keys
- Passwords
- Authentication tokens
- Private keys or SSH keys
- Session cookies
- Bearer tokens
- `.env` file secret values
- Database credentials
- OAuth client secrets or access tokens
- Any personal sensitive information

Allowed:
- The **name** of an environment variable (e.g., "Uses `DATABASE_URL` from `.env`").
- Non-secret configuration values.
- Descriptions of required credentials without their values.

If you see a secret in a memory file, remove it immediately.

---

## 13. HONEST STATUS REPORTING

The AI must carefully distinguish these states and never conflate them:

| State | Meaning |
|---|---|
| Planned | Intended to be done; no code yet. |
| Attempted | Code was started or a run was made, but may or may not have succeeded. |
| Implemented | Code is present in the repository. |
| Tested | Relevant tests or checks were performed (record the outcome). |
| Verified | Independently confirmed to work (with evidence). |

Rules:
- Never convert an attempt into a successful result just because the AI tried something.
- If a test fails or the build breaks, say so. Do not write that it passed.
- If a task was planned but never started, keep it `REQUESTED` — do not mark it `IMPLEMENTED`.
- If verification evidence is absent, leave status at `TESTED` or lower. Do not mark `VERIFIED`.

---

## 14. GIT

- Git history is implementation history. Treat it as a higher-authority source (see Section 4).
- Do not rewrite, rebase, amend, or destroy useful history unnecessarily. Never force-push shared branches.
- Before major handoffs, commit the current work if the repository is in a safe state and committing is appropriate. A clear "WIP: ..." commit is acceptable mid-task if it helps continuity.
- Commit messages should describe what changed. When practical, reference task IDs (e.g., `T-003: Add X module`).
- Do not commit secrets, `.env` files with real values, or huge binary artifacts unless they are explicitly part of the project.

---

## 15. MINIMAL MEMORY

The memory system must remain compact and useful.

- Do not allow memory files to grow into copies of the entire conversation.
- Prefer concise factual records over long explanations, reasoning, or narrative.
- Use bullet points, tables, and short sections.
- Prune or archive obsolete information in `RECENT_CONTEXT.md` regularly.
- If a fact can be discovered by reading the actual repository code (e.g., exact function signatures, full test lists), do not duplicate it in memory. Memory should answer "what" and "why" and "status" — the code answers "how."

---

## 16. CONTINUITY GOAL

The final goal of this entire system:

> A completely new AI coding agent, with **no access** to the previous AI's conversation, context window, or logs, should be able to open this repository, read this memory system, understand what the user wanted, understand what has already happened, verify the actual state against the real repository and tests, and continue the work safely and correctly — without breaking what already works, and without restarting completed tasks.

These rules must be precise enough that different AI agents, with different implementations and training, would follow the same process and produce consistent memory updates. If a rule is ambiguous, prefer the interpretation that preserves honesty, correctness, and continuity.

---

This file (`AGENTS.md`) is the master operating manual. If you are an AI reading this, follow it.

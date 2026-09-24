# Prompt Log

## Purpose

This file is the project's selective record of meaningful, project-related user instructions and requirements. It exists so that a completely new AI coding agent, with no access to the previous AI's conversation history, can understand what the user asked for, what constraints apply, and what explicit decisions have been made.

This file intentionally does **not** record:

- The entire conversation verbatim
- Casual conversation, greetings, jokes, or off-topic chatting
- Temporary AI reasoning, internal thought process, or speculation
- Irrelevant questions or unrelated side discussion
- Duplicates of facts that are recorded elsewhere (code, tests, other memory files)
- Secrets, credentials, or environment variable values

Only prompts or instructions that materially affect the project are recorded here.

---

## Prompt Recording Rules

1. Every meaningful project-level user instruction should receive a **unique prompt ID** of the form `P-NNN` (e.g., `P-001`, `P-002`). Increment the number; never reuse a prompt ID.
2. Record the **date** the instruction was given when the date is known.
3. Record the user's **actionable intent** in a concise, normalized form. Summarize rather than transcribe.
4. Record **important requirements and constraints** — only those that affect implementation, architecture, scope, or decisions.
5. **Link to the related task ID** (`T-NNN` from `TASKS.md`) when one exists. If no task exists yet, use `None`.
6. **Link to related change IDs** (`C-NNN` from `CHANGE_LOG.md`) or Git commit hashes when applicable.
7. **Record requirement changes explicitly.** If the user changes a previous requirement, do not silently overwrite the old prompt entry. Preserve the old entry and add a new one that documents the change.
8. **Do not store secrets.** Never record API keys, tokens, passwords, credentials, or environment variable values. Use environment variable names or descriptions instead.
9. **Do not store irrelevant conversation.** If a sentence or paragraph does not change requirements, scope, constraints, or decisions, do not include it.
10. **Do not copy huge prompts verbatim** unless the exact wording is itself an important requirement (for example, a spec that must be followed word-for-word). In all other cases, summarize the actionable content.
11. **Preserve enough meaning** that a new AI, reading only this file and the rest of the memory/repository, can correctly understand the original intent of the user's request.

---

## Prompt Entry Format

Every recorded prompt should follow this consistent format. Omit optional fields only if they are not applicable; leave them explicitly empty or set to `N/A` rather than removing them.

```
### P-NNN
- Date: YYYY-MM-DD (when known; otherwise N/A)
- Related Task: T-NNN or None
- Type: <short category: e.g., Feature Request, Bug Fix, Architecture Decision, Constraint, Continuity, Infrastructure Requirement, Requirement Change>
- User Request: <concise normalized statement of what the user asked for>
- Requirements: <bullet list of concrete, actionable requirements from the prompt>
- Constraints: <bullet list of constraints, non-functional requirements, limits, or "do not" rules>
- Resulting Action: <what was actually done with this prompt, or "Pending" if not yet acted on>
- Related Changes: C-NNN / Git commit hashes / "N/A"
- Status: <Active / Superseded by P-NNN / Cancelled / Fulfilled>
```

### Field definitions

| Field | Meaning |
|---|---|
| **P-NNN** | Unique permanent prompt ID (never reused). |
| **Date** | Date the user gave the instruction, when available. |
| **Related Task** | Task ID in `TASKS.md` that implements this prompt; `None` if no task has been created yet. |
| **Type** | Short stable category for the kind of instruction this is. |
| **User Request** | One-sentence normalized summary of the user's intent. |
| **Requirements** | Bulleted list of what must be true for the request to be satisfied. |
| **Constraints** | Bulleted list of rules, limits, and boundaries the AI must respect. |
| **Resulting Action** | High-level description of what was done in response (or `Pending`). |
| **Related Changes** | Cross-refs to `CHANGE_LOG.md` entries or Git commits. |
| **Status** | Lifecycle state of the prompt itself. |

---

## Recorded Prompts

### P-001
- **Date:** 2026-09-25
- **Related Task:** None
- **Type:** Continuity / Infrastructure Requirement
- **User Request:** The repository must contain a persistent AI continuity and backup system that allows a completely new AI coding agent to continue project development if the current AI reaches a token or context limit, becomes unavailable, crashes, or is replaced.
- **Requirements:**
  - The repository itself (code, tests, config, Git history, and AI memory files) must serve as the persistent source of project context.
  - Important project requirements, task state, meaningful actual changes, and recent context must be preserved for the next agent.
  - An actionable handoff document must exist so a new AI can pick up work without the previous conversation.
  - The system must NOT store the entire conversation. Only high-value information should be preserved.
  - The system must distinguish clearly between: what was requested, what tasks exist, what actually changed, what the current factual state is, what recent events matter, and what the next agent should do next.
  - The user explicitly wants the repository and its memory files to act as the persistent source of truth for AI continuity.
  - The system must be self-contained in the repository (no external database or service during bootstrap phase).
- **Constraints:**
  - No secrets, credentials, or private environment variable values may be written into memory files.
  - Memory files must not be inventories of imaginary features or speculative future architecture.
  - Only facts that can be verified against the repository should be treated as truth.
  - Honest status reporting is required: planned, attempted, implemented, tested, and verified must be kept strictly distinct.
- **Resulting Action:** Established the AI memory file structure (`AGENTS.md` + `AI_MEMORY/` with six memory files), wrote the full AI agent operating protocol into `AGENTS.md`, and began populating the individual memory files with the initial verified project state.
- **Related Changes:** N/A (memory files are being populated during bootstrap; will be referenced in future change/commits).
- **Status:** Active

### P-002
- **Date:** 2026-09-25
- **Related Task:** T-001
- **Type:** Feature Request / Controlled Continuity Test
- **User Request:** As a controlled interrupted-work continuity test, create exactly one small application task: *"Add a greet(name) function to the existing Node.js application."* Implement the function and its test deliberately, but STOP intentionally after the code is written — BEFORE running tests or verifying. Leave the task at IMPLEMENTED (not TESTED, not VERIFIED) so another fresh AI must take over and distinguish IMPLEMENTED ≠ TESTED ≠ VERIFIED. After implementation, update all relevant AI_MEMORY files and leave an accurate handoff. Do NOT commit yet.
- **Requirements (summarized from the user prompt):**
  1. Add a `greet(name)` function to the appropriate existing application source file.
  2. It should return a simple greeting string containing the supplied name.
  3. Export it appropriately.
  4. Add or update a test for this function.
  5. Intended stop point: IMPLEMENTED only. Must NOT be TESTED or VERIFIED.
  6. Update memory files (TASKS, PROMPT_LOG, CHANGE_LOG, PROJECT_STATE, RECENT_CONTEXT, HANDOFF) to reflect IMPLEMENTED and what remains.
  7. Do not run tests. Do not create a commit.
- **Constraints:**
  - Small, isolated change. No new dependencies or architecture changes.
  - Part of the second (final) AI continuity test: a controlled interrupted-task handoff.
- **Resulting Action:**
  - Created task `T-001` in `TASKS.md` with Status = IMPLEMENTED.
  - Implemented `greet(name)` in `src/index.js` and exported it; added corresponding test cases in `test/index.test.js`.
  - Intentionally did NOT execute `npm test` or any test runner after writing the code.
  - Recording implementation and cross-references in memory; marking task not-tested/not-verified; leaving detailed handoff.
- **Related Changes:** C-005
- **Status:** Active (in progress — implementation done; testing and verification deliberately not performed per continuity-test rules)

---

## Rules for Future Agents

When a new meaningful user project request arrives:

1. **First determine whether it materially affects development.** If it is casual conversation, a greeting, or an irrelevant question, skip recording it here.
2. **If it is meaningful, create the next P-NNN entry** using the format above. Use the next sequential ID (do not skip; do not reuse).
3. **Link to the appropriate T-NNN task** when the prompt results in a task. If a task is created immediately, link it; if the prompt is recorded before a task exists, use `None` and back-fill the link later.
4. **Keep the user's intent accurate.** Summarize, but do not distort the request. If the exact wording matters, preserve it faithfully but compactly.
5. **If the user changes a previous requirement, preserve the old prompt and record the new requirement as a new prompt entry.** Set the old prompt's `Status` to `Superseded by P-NNN` where NNN is the new prompt ID.
6. **Never rewrite history** to make it appear that the user originally requested something different. Historical prompt entries are permanent and immutable records of what was actually asked at the time.
7. **Cross-reference.** When a prompt maps to a task or a repository change, link those IDs (`T-NNN`, `C-NNN`, commit hashes) rather than duplicating their contents.

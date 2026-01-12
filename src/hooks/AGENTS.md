# HOOKS KNOWLEDGE BASE

## OVERVIEW

Lifecycle management and event loop orchestration for Sisyphus. Handles tool interception, recursive self-correction, and state-aware recovery.

## ARCHITECTURE

- **Event-Driven**: Hooks respond to OpenCode events (`session.idle`, `tool.execute.before`, `message.updated`, etc.).
- **Interception**: `PreToolUse` can block or modify arguments; `PostToolUse` appends system reminders to tool output.
- **Priority Management**: Hooks are executed in order of registration. Use `disabled_hooks` in config to opt-out.

## CORE COMPONENTS

### Sisyphus Orchestrator (`sisyphus-orchestrator/`)
- **Event Loop**: Listens for `session.idle` to drive "Boulder" plan continuation.
- **Delegation Protocol**: Intercepts `Write`/`Edit` calls by orchestrator to enforce subagent delegation.
- **Verification**: Automatically appends QA checklists to subagent tool outputs.
- **Boulder State**: Tracks multi-session progress via `.sisyphus/` directory.

### Ralph Loop (`ralph-loop/`)
- **Recursive Execution**: Triggers iteration `N+1` if `<promise>DONE</promise>` is missing.
- **Completion Detection**: Scans transcripts and session messages via API to detect completion tags.
- **Max Iterations**: Defaults to 100 to prevent runaway infinite loops.

### Self-Correction & Recovery
- **Session Recovery**: Catches `session.error` (aborts, thinking violations) and restores state.
- **Edit Error Recovery**: Fixes common `Edit` tool failures (context mismatch) automatically.
- **Preemptive Compaction**: Compresses context at 85% usage to prevent overflow mid-task.
- **Auto-Resume**: Detects thinking errors and automatically restarts the loop with recovered context.

## ANTI-PATTERNS

- **Volatile State**: Session state MUST be persisted to JSON (see `storage.ts` in subdirs) to survive crashes.
- **Direct Implementations**: Hooks should NOT perform complex tasks; they should inject prompts to guide the agent.
- **Circular Reminders**: Avoid appending reminders that trigger another hook in an infinite loop.
- **Context Bloat**: Don't inject massive prompts in every `PostToolUse`; use conditional logic.

## HOW TO DEVELOP

1. **Define Hook**: Implement `handler` for generic events or specific tool hooks.
2. **Register**: Add factory to `src/hooks/index.ts`.
3. **Persist**: Use `src/shared/storage.ts` or local `storage.ts` for any cross-event memory.

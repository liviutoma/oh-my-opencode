# HOOKS KNOWLEDGE BASE

## OVERVIEW

22+ lifecycle hooks for intercepting/modifying agent behavior. Handles orchestration, recovery, context injection, and safety checks.

## STRUCTURE

```
hooks/
├── sisyphus-orchestrator/      # MAIN BRAIN (Event loop, Tool use)
├── ralph-loop/                 # Infinite recursion loop
├── anthropic-context-window-limit-recovery/ # Token management
├── session-recovery/           # Error recovery
├── claude-code-hooks/          # settings.json compat
└── index.ts                    # Export all
```

## HOOK EVENTS

| Event | Role | Can Block? |
|-------|------|------------|
| `PreToolUse` | Validate/Modify input | YES |
| `PostToolUse` | Context/Warnings | NO |
| `UserPromptSubmit` | Inject/Block prompt | YES |
| `Stop` | Idle follow-up | NO |

## HOW TO ADD HOOK

1. Create `src/hooks/my-hook/index.ts`.
2. Export factory `createMyHook()`.
3. Return object with event handlers:
   ```typescript
   return {
     PreToolUse: async (t) => { /* logic */ }
   }
   ```
4. Register in `src/hooks/index.ts`.

## PATTERNS

- **Persistence**: Use JSON files for session state.
- **Injection**: Return `{ messages: [...] }` to inject context.
- **Safety**: Always wrap in try/catch to prevent session crash.

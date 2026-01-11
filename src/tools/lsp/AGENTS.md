# LSP CLIENT KNOWLEDGE BASE

## OVERVIEW

Robust LSP client implementation. Handles process management, IPC, and protocol translation.

## LIFECYCLE

1. **Start**: Spawn process (stdio).
2. **Init**: Send `initialize` -> `initialized`.
3. **Warmup**: Ready for requests.
4. **Idle**: Auto-shutdown after 5 min unused.
5. **Stop**: Graceful `shutdown` -> `exit` or SIGTERM.

## ERROR HANDLING

- **Crash Recovery**: Detects exit codes, cleans up.
- **Timeouts**: 15s timeout on requests.
- **Cleanup**: `process.on('exit')` hooks to kill children.

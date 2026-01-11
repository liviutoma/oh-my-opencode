# TOOLS KNOWLEDGE BASE

**Component:** Intelligent Tool Suite (LSP, AST, Memory, Orchestration)

## OVERVIEW

Complex tool implementations extending agent capabilities. Includes full LSP clients, AST-aware search, memory systems, and background task orchestration.

## STRUCTURE

```
src/tools/
├── lsp/               # Language Server Protocol (11 tools, Lifecycle Manager)
├── ast-grep/          # Structural Search & Replace (NAPI bindings)
├── spawn-agent/       # Unified Agent Spawning (New)
├── sisyphus-task/     # Agent Delegation & Task Management (Legacy)
├── session-manager/   # Session History & Context Retrieval
├── supermemory/       # Long-term Knowledge (Vector/Graph)
├── background-task/   # Async Operation Handling
├── interactive-bash/  # Tmux Session Control
├── skill/             # Dynamic Capability Loading
└── index.ts           # Tool Factory & Registry
```

## TOOL CATEGORIES

| Category | Component | Responsibility |
|----------|-----------|----------------|
| **LSP** | `LSPServerManager` | Code intelligence (defs, refs, types). Auto-cleanup. |
| **AST** | `napi.ts` | Structural search/replace. Performance > Regex. |
| **Orchestration** | `spawn_agent` | Unified agent spawning (replacing sisyphus-task/call-omo-agent). |
| **Orchestration (Legacy)** | `sisyphus-task` | Delegating complex sub-tasks to agents. [DEPRECATED] |
| **Memory** | `session`, `supermemory` | Retrieval of past context and long-term knowledge. |
| **System** | `interactive-bash` | Persistent shell sessions (tmux). |
| **Execution (Legacy)** | `call-omo-agent` | Spawning specialized sub-agents. [DEPRECATED] |

## LSP SPECIFICS

- **Manager**: `LSPServerManager` (Singleton) handles process spawning/killing.
- **Lifecycle**: Lazy init. Auto-shutdown on idle (default 5m).
- **Protocol**: Standard JSON-RPC 2.0 over stdio.
- **Safety**: Automatically cleans up zombie processes on exit.

## AST-GREP SPECIFICS

- **Engine**: Uses `@ast-grep/napi` for near-native performance.
- **Pattern**: Supports meta-variables (`$VAR`) and multi-node matching (`$$$`).
- **Usage**: Preferred over `grep` for code modifications to ensure validity.

## BEST PRACTICES

- **Atomicity**: Tools must return complete results or clear errors.
- **Statelessness**: Unless managing a process (LSP/Shell), remain stateless.
- **Output**: Truncate massive outputs to prevent context window overflow.

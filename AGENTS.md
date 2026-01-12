# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-12
**Framework:** OpenCode Plugin (Bun)
**Runtime:** Bun Only

## OVERVIEW

"Oh My OpenCode" (Sisyphus) is an advanced agent harness for OpenCode. It replaces the default agent with **Sisyphus**, a multi-model orchestrator (Claude Opus, GPT-5.2, Gemini 3) that manages specialized sub-agents. It features a custom event loop ("Ralph Loop"), deep Google Antigravity integration, and full Claude Code compatibility.

## STRUCTURE

```
oh-my-opencode/
├── src/
│   ├── agents/        # AI Personas (Sisyphus, Oracle, Librarian) & Prompts
│   ├── hooks/         # Lifecycle Hooks (Orchestrator, Ralph Loop, Recovery)
│   ├── auth/          # Google Antigravity OAuth & Thinking Block Parser
│   ├── cli/           # CLI Entry (`bunx oh-my-opencode`), TUI, Doctor
│   ├── tools/         # Intelligent Tools (LSP, AST-Grep, Session)
│   ├── features/      # Compatibility Layer (Loaders, Skills, MCPs)
│   ├── shared/        # Cross-cutting Utilities (Config, Path, Truncation)
│   └── index.ts       # Main Plugin Entry (Factory Pattern)
├── script/            # CI/Release Scripts (Bun-native, no Makefile)
└── dist/              # Build Artifacts
```

## WHERE TO LOOK

| Task | Location | Key Components |
|------|----------|----------------|
| **Orchestration** | `src/hooks/sisyphus-orchestrator/` | `index.ts` (Event Loop), `tool-use.ts` (Delegation) |
| **Agent Logic** | `src/agents/` | `orchestrator-sisyphus.ts` (Prompt), `sisyphus-junior.ts` |
| **Auth/Gemini** | `src/auth/antigravity/` | `fetch.ts` (Interceptor), `thinking.ts` (Parser) |
| **Self-Correction** | `src/hooks/` | `ralph-loop` (Recursion), `session-recovery` (Errors) |
| **CLI/TUI** | `src/cli/` | `install.ts` (@clack/prompts), `doctor/` (Health Checks) |

## CONVENTIONS

- **Runtime**: **Bun Only**. No Node.js/npm/yarn. `bun test`, `bun run build`.
- **Architecture**: **Factory Pattern**. `createXXXHook()`, `createXXXTool()`.
- **Concurrency**: Heavy use of `background_task` / `spawn_agent` for parallel execution.
- **Context**: Recursive `AGENTS.md` injection (Root -> Shared -> Local).
- **Config**: JSONC supported. User config (`~/.config`) merges with Project (`.opencode/`).

## ANTI-PATTERNS (THIS PROJECT)

- **Orchestrator Implementation**: The Orchestrator MUST NOT implement code directly. Delegate to `sisyphus_task`.
- **Sync I/O**: `NEVER` block the event loop. Use `fs/promises` or async patterns.
- **God Objects**: Avoid adding to `orchestrator-sisyphus.ts` or `manager.ts`. Split concerns.
- **Manual File Ops**: Use `spawn_agent` for complex operations.
- **Console Logs**: Use `src/shared/logger.ts` instead of `console.log`.

## COMMANDS

```bash
bun test                # Run BDD-style tests (Bun Test)
bun run build           # Build ESM + Types + Schema
bun run typecheck       # Verify TypeScript types
bunx oh-my-opencode doctor # Verify environment health
```

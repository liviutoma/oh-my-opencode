# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-11
**Version:** 3.0.0-beta
**Framework:** OpenCode Plugin (Bun)

## OVERVIEW

"Oh My OpenCode" (Sisyphus) is an advanced OpenCode agent harness. Replaces default agent with **Sisyphus**, a multi-model orchestrator (Claude Opus 4.5, GPT-5.2, Gemini 3) managing specialized subagents. Features "Ralph Loop" (recursion), highly tuned LSP tools, and full Claude Code compatibility.

## STRUCTURE

```
oh-my-opencode/
├── src/
│   ├── agents/        # AI Personas (Sisyphus, Oracle, Librarian) - Top-level citizens
│   ├── hooks/         # Lifecycle Hooks (Sisyphus Orchestrator, Ralph Loop)
│   ├── tools/         # Intelligent Tools (LSP, AST-Grep, Session, Task)
│   ├── features/      # Claude Code Compat (Loaders, MCPs, Commands)
│   ├── auth/          # Antigravity OAuth (Google/Gemini integration)
│   ├── cli/           # Installer & Doctor (`bunx oh-my-opencode`)
│   ├── shared/        # Utilities (Config, Paths, JSONC)
│   ├── mcp/           # Built-in MCPs (Context7, Grep.app)
│   └── index.ts       # Main Plugin Entry (Factory Pattern)
├── script/            # CI/Release Scripts (Bun-native)
└── dist/              # Build Artifacts
```

## WHERE TO LOOK

| Task | Location | Key Files |
|------|----------|-----------|
| **Orchestration** | `src/hooks/sisyphus-orchestrator/` | `index.ts` (Event loop), `tool-use.ts` |
| **Agent Logic** | `src/agents/` | `orchestrator-sisyphus.ts`, `prometheus-prompt.ts` |
| **LSP Logic** | `src/tools/lsp/` | `client.ts` (Lifecycle), `tools.ts` (Handlers) |
| **Google Auth** | `src/auth/antigravity/` | `fetch.ts` (Interceptor), `thinking.ts` (Parser) |
| **CLI/Install** | `src/cli/` | `install.ts` (TUI), `doctor/` (Health Checks) |
| **Self-Correction** | `src/hooks/` | `session-recovery`, `anthropic-context-recovery` |

## CONVENTIONS

- **Runtime**: **Bun Only**. No Node.js. `bun test`, `bun run build`.
- **Architecture**: **Factory Pattern**. `createXXXHook()` / `createXXXTool()`.
- **Async**: Heavy use of background agents (`background-task`).
- **Context**: `AGENTS.md` files are recursively injected.
- **Config**: JSONC supported. User config merges with Project config.

## ANTI-PATTERNS (THIS PROJECT)

- **Node.js**: `NEVER` use npm/yarn.
- **Sync I/O**: `NEVER` block event loop. Use `fs/promises`.
- **God Objects**: Avoid adding to `orchestrator-sisyphus.ts`. Split concerns.
- **Manual File Ops**: Use `sisyphus_task` for complex ops.
- **Direct Publish**: CI only (OIDC). `gh workflow run publish`.

## COMMANDS

```bash
bun test                # Run BDD-style tests
bun run build           # Build ESM + Types + Schema
bun run typecheck       # Verify types
bunx oh-my-opencode doctor # Verify environment
```

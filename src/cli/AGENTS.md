# CLI KNOWLEDGE BASE

## OVERVIEW

CLI entry point (`bunx oh-my-opencode`). Handles installation (TUI), environment health (Doctor), and runtime launching.

## STRUCTURE

```
cli/
├── install.ts            # TUI Installer
├── doctor/               # Diagnostics System
│   ├── checks/           # 17+ Health Checks
│   └── runner.ts         # Execution Engine
├── config-manager.ts     # JSONC Config Handler
└── index.ts              # Command Routing
```

## DOCTOR CHECKS

- **Auth**: Anthropic, OpenAI, Google credentials.
- **Env**: Bun version, Git, Node.
- **Config**: Plugin registration, JSON validity.
- **LSP**: Server availability.

## CONFIG MANAGER

- **JSONC**: Supports comments/trailing commas.
- **Validation**: Zod schemas.
- **Merger**: User (`~/.config`) + Project (`.opencode/`).

## ANTI-PATTERNS

- **Blocking Non-TTY**: Always check `isTTY` before prompting.
- **Silent Failures**: Doctor checks must report WARN/FAIL, never crash.

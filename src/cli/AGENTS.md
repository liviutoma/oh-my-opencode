# CLI KNOWLEDGE BASE

## OVERVIEW
The command-line interface for "Oh My OpenCode". Handles installation, configuration management, health checks, and the supervisor execution mode.

## COMMANDS

### `install`
- **Modes**: Interactive (TUI via `@clack/prompts`) or Headless (Flags).
- **Logic**: Detects existing config, merges user/project settings, and configures Auth plugins.
- **Subscriptions**: Configures agent models based on user tiers (Claude Max/Pro, ChatGPT Plus).

### `doctor`
- **Health Checks**: Diagnostic engine for the environment.
- **Scope**:
  - `auth`: Verify Google/Anthropic login status.
  - `lsp`: Check if Language Servers are installed and executable.
  - `dependencies`: Verify Bun, Git, and other binaries.
  - `config`: Validate JSON schema and path permissions.

### `run` (Supervisor Mode)
- **Wrapper**: Wraps `opencode run` but adds a supervisor layer.
- **Enforcement**: Monitors for `TODO` completion before exit.
- **Coordination**: Syncs background tasks, ensuring no orphan processes remain.

## STRUCTURE
```
src/cli/
├── commands/     # Command implementations
├── doctor/       # Health check logic
├── run/          # Supervisor runner
├── install.ts    # Installer logic
└── index.ts      # Entry point (Commander)
```

## ANTI-PATTERNS
- **Sync Operations**: CLI commands should be async. Avoid `execSync` where possible, use `execa` or `bun.spawn`.
- **Hardcoded Paths**: Always use `src/shared/config-path.ts` for file access.
- **Silent Failures**: All errors must be caught and displayed with helpful remediation steps (Doctor style).

# FEATURES KNOWLEDGE BASE

## OVERVIEW

Claude Code compatibility layer and core feature modules. Handles loaders for Commands, Skills, Agents, and MCPs.

## STRUCTURE

```
features/
├── claude-code-*-loader/   # Loaders for legacy formats
├── builtin-skills/         # git-master, frontend-ui-ux
├── background-agent/       # Task manager impl
├── opencode-skill-loader/  # OpenCode skill support
└── skill-mcp-manager/      # Embedded MCPs in skills
```

## LOADER PRIORITY

1. **Project OpenCode**: `.opencode/`
2. **Global OpenCode**: `~/.config/opencode/`
3. **Project Claude**: `.claude/`
4. **Global Claude**: `~/.claude/`

## CONFIG TOGGLES

Disable legacy features in `oh-my-opencode.json`:
```json
"claude_code": {
  "mcp": false,
  "commands": false,
  "skills": false
}
```

## ANTI-PATTERNS

- **Blocking Load**: Loaders must run fast or async.
- **Hardcoded Paths**: Use `shared/config-path.ts` utilities.

# FEATURES KNOWLEDGE BASE

## OVERVIEW
Compatibility layer and feature orchestration. Integrates Claude Code assets into OpenCode and manages advanced agent capabilities (Background Tasks, Skill-MCPs, Context Injection).

## LOADERS (COMPATIBILITY)
Loads legacy Claude Code assets with intelligent merging.

### Priority (Project > Global | OpenCode > Claude)
1. **Project OpenCode**: `./.opencode/{skill,command,agent}/`
2. **Project Claude**: `./.claude/{skills,commands,agents}/`
3. **Global OpenCode**: `~/.config/opencode/{skill,command,agent}/`
4. **Global Claude**: `~/.claude/{skills,commands,agents}/`

### Asset Types
- **Skills**: Directory-based (`SKILL.md`) or standalone `.md` files.
- **MCPs**: `.mcp.json` with `${VAR}` env expansion.
- **Commands**: Markdown-based slash commands (`/cmd`).
- **Agents**: Markdown-defined personas (Oracle, Librarian, etc.).

## FEATURE TOGGLES
Granular control via `oh-my-opencode.json` (`claude_code` object):
- `mcp`, `commands`, `skills`, `agents`, `hooks`, `plugins` (default: `true`).
- `plugins_override`: Disable specific marketplace plugins by ID.

## SKILL-EMBEDDED MCPS
Skills can provide specialized tools via embedded MCP servers:
1. **Frontmatter**: `mcp` field in `SKILL.md`.
2. **Sidecar**: `mcp.json` or `mcpServers` in skill directory.
*Used for high-level capabilities like Playwright (browser-automation).*

## ORCHESTRATION FEATURES
- **Background Agent**: Parallel execution via `spawn_agent` / `background_task`.
- **Context Injection**: Recursive `AGENTS.md` discovery and conditional rules (`.mdc`).
- **Session State**: Compatible with Claude Code todos (`~/.claude/todos/`) and transcripts.

## ANTI-PATTERNS
- **Hardcoded Paths**: ALWAYS use `shared/config-path.ts` utilities (e.g., `getClaudeConfigDir()`).
- **Ad-hoc Config**: Don't create new top-level config keys for feature flags; use the `claude_code` schema.
- **Unvalidated MCPs**: Loading MCP servers without proper environment variable expansion (${VAR}).
- **Priority Neglect**: Forgetting that Local Project config MUST override Global User config.

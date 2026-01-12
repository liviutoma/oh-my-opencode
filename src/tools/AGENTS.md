# TOOLS KNOWLEDGE BASE

## OVERVIEW
Intelligent capabilities extension for OpenCode. Provides LSP integration, AST-aware searching, MCP bridging, and process management tools that agents can invoke.

## KEY TOOLS

### Language Server Protocol (`lsp/`)
- **Capabilities**: Hover, GoTo Def/Ref, Rename, Code Actions, Diagnostics.
- **Auto-Discovery**: Scans `package.json` / `requirements.txt` to suggest relevant LSPs.
- **State**: Manages persistent LSP client processes via `stdio`.

### Structural Search (`ast-grep/`)
- **Engine**: Uses `ast-grep` (sg) for syntax-aware pattern matching.
- **Benefit**: Finds "functions with 3 arguments" instead of "lines matching regex".
- **Performance**: Native binary execution, significantly faster than JS-based traversal.

### Agentic Tools
- **spawn_agent**: The primary delegation mechanism. Launches sub-agents with specific configuration.
- **background_task**: Manages async execution and polling for results.
- **supermemory**: Vector-based long-term memory insertion/retrieval.

### MCP Integration (`skill-mcp/`)
- **Bridge**: Exposes Model Context Protocol servers as OpenCode tools.
- **Dynamic Loading**: Loads MCPs defined in Skill frontmatter on-the-fly.

## STRUCTURE
```
src/tools/
├── lsp/               # LSP Client & Tool Definitions
├── ast-grep/          # AST Search & Replace
├── spawn-agent/       # Delegation & Task Management
├── supermemory/       # RAG / Long-term Memory
└── index.ts           # Tool Registry
```

## ANTI-PATTERNS
- **Blocking Operations**: Tools must not block the main thread for >60s. Use `background_task` for heavy lifting.
- **Raw File Ops**: Prefer `LSP` or `AST-Grep` over `grep`/`sed` for code modifications.
- **Silent Failures**: Always return descriptive error messages to help the agent self-correct.

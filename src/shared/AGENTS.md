# SHARED UTILITIES KNOWLEDGE BASE

## OVERVIEW
Cross-cutting utilities used throughout the plugin. Designed to be stateless, robust, and platform-agnostic.

## KEY UTILITIES

### Config Management (`config-manager.ts`, `jsonc-parser.ts`)
- **JSONC Support**: Parses and modifies JSON with Comments. Preserves user comments during programmatic updates.
- **Layering**: Merges User Config (`~/.config`) and Project Config (`.opencode/`) with proper precedence.

### Logging (`logger.ts`)
- **Destination**: Writes to system temp directory (`oh-my-opencode.log`).
- **Safety**: Never logs sensitive tokens or PII. Truncates massive payloads.

### Path Resolution (`config-path.ts`, `data-path.ts`)
- **XDG Standards**: Respects `XDG_CONFIG_HOME`, `XDG_DATA_HOME`.
- **Cross-Platform**: Handles Windows/macOS/Linux path differences normalization.

### Dynamic Truncation (`dynamic-truncator.ts`)
- **Context Protection**: Intelligent truncation for tool outputs.
- **Heuristics**:
  - Truncates middle of long lines.
  - Preserves head/tail of logs.
  - Respects token limits to prevent API 400 errors.

## STRUCTURE
```
src/shared/
├── config-manager.ts
├── logger.ts
├── dynamic-truncator.ts
├── command-executor.ts
└── index.ts
```

## ANTI-PATTERNS
- **Console.log**: NEVER use `console.log` in production code. Use `logger.ts`.
- **Relative Paths**: Always resolve paths relative to `ctx.directory` or config roots.
- **Blocking IO**: Use `fs/promises` for file operations.

# SHARED UTILITIES KNOWLEDGE BASE

## OVERVIEW

Cross-cutting utilities for config, paths, and text processing.

## STRUCTURE

```
shared/
├── config-manager.ts     # Config loading
├── deep-merge.ts         # Recursive merge
├── dynamic-truncator.ts  # Token-smart trim
├── jsonc-parser.ts       # Safe parsing
└── logger.ts             # File logging
```

## CRITICAL UTILS

| Task | Utility |
|------|---------|
| **Merge Configs** | `deepMerge(defaults, user)` |
| **Parse JSON** | `parseJsoncSafe(content)` |
| **Truncate** | `dynamicTruncate(text, limit)` |
| **Find Paths** | `getClaudeConfigDir()` |

## PATTERNS

- **Safe Parsing**: Never use `JSON.parse` on user input.
- **Truncation**: Always truncate large tool outputs to preserve context window.

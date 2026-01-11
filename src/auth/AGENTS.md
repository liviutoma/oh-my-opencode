# AUTH KNOWLEDGE BASE

## OVERVIEW

Google Antigravity OAuth integration for Gemini models. Handles token interception, lifecycle, and thinking block parsing.

## STRUCTURE

```
auth/antigravity/
├── fetch.ts          # Request Interceptor (Core)
├── thinking.ts       # <antThinking> Parser
├── oauth.ts          # Browser Flow
├── token.ts          # Storage & Refresh
└── plugin.ts         # Hook Registration
```

## KEY COMPONENTS

| Component | Role |
|-----------|------|
| **Interceptor** | Rewrites URL -> Antigravity Proxy, injects Bearer. |
| **Parser** | Extracts/Formats thinking blocks for OpenCode. |
| **OAuth** | Handles Google login flow & multi-account switching. |

## HOW IT WORKS

1. **Intercept**: Catch outgoing requests to Anthropic/Google.
2. **Rewrite**: Point to Antigravity proxy.
3. **Auth**: Inject valid OAuth token (refresh if needed).
4. **Stream**: Parse SSE, extract thinking, yield chunks.

## FEATURES

- **Multi-Account**: Round-robin load balancing (up to 10 accounts).
- **Thinking**: Preserves and formats thinking blocks.

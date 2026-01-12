# AUTH KNOWLEDGE BASE

## OVERVIEW
Google Antigravity integration for Gemini models. Implements a secure OAuth 2.0 + PKCE flow and a deep request interception layer to bypass direct API restrictions via Google's internal proxies.

## STRUCTURE
```
auth/antigravity/
├── fetch.ts          # Core interceptor: URL rewriting, token injection, response transformation.
├── oauth.ts          # Local callback server and browser-based login flow.
├── accounts.ts       # Multi-account manager: load balancing and rate-limit mitigation.
├── thinking.ts       # Gemini-specific thinking block extraction (<antThinking>).
├── token.ts          # Token lifecycle: refresh, expiration checks, storage.
└── plugin.ts         # Hook Registration.
```

## KEY COMPONENTS
| Component | Role |
|-----------|------|
| **Interceptor** | Automatically rewrites model requests to Antigravity proxy endpoints. |
| **Parser** | Extracts/Formats thinking blocks for OpenCode; handles SSE stream parsing. |
| **OAuth** | Handles Google login flow & multi-account switching. |

## HIGHLIGHTS
- **Request Interception**: Redirects model requests through internal Google proxies.
- **Endpoint Fallback**: Cascades through `daily-cloudcode-pa` -> `cloudcode-pa` (Sandbox -> Prod).
- **Multi-Account LB**: Supports up to 10 accounts with round-robin rotation and automatic failover on 429/403 errors.
- **Thinking Extraction**: Parses Gemini `thought` parts, preserving internal reasoning for the agent.
- **PKCE Support**: Secure OAuth flow without requiring a shared client secret.

## ANTI-PATTERNS
- **Hardcoding Endpoints**: Never use a single URL. Use `ANTIGRAVITY_ENDPOINT_FALLBACKS` for resilience.
- **Ignoring Expiration**: Assumed token validity is dangerous. Use `isTokenExpired()` before every call.
- **Manual Body Parsing**: Use `convertRequestBody()` for OpenAI -> Gemini message translations.
- **Blocking SSE**: Always use `transformStreamingResponse()` to ensure thinking blocks are extracted live.

## TROUBLESHOOTING
- Enable verbose logs: `ANTIGRAVITY_DEBUG=1 opencode`
- Clear project cache if 403 errors persist: `invalidateProjectContextByRefreshToken()`
- Verify client metadata: Antigravity requires specific `X-Goog-Api-Client` headers (see `constants.ts`).

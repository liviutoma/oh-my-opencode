# AGENTS KNOWLEDGE BASE

## OVERVIEW

AI agent definitions for multi-model orchestration. 7 specialized agents including Sisyphus (orchestrator), Oracle (strategy), and Librarian (research).

## STRUCTURE

```
agents/
├── orchestrator-sisyphus.ts # Main Orchestrator (1400+ lines)
├── sisyphus.ts              # System Prompt
├── prometheus-prompt.ts     # Planning Agent Prompt
├── oracle.ts                # GPT-5.2 Advisor
├── librarian.ts             # Claude Sonnet Research
├── explore.ts               # Grok/Gemini Grep
├── frontend-ui-ux-engineer.ts  # Gemini UI Gen
└── utils.ts                 # Factory & Fallback Logic
```

## KEY AGENTS

| Agent | Model | Purpose |
|-------|-------|---------|
| **Sisyphus** | Claude Opus 4.5 | Primary orchestrator. Deep thinking. |
| **Oracle** | GPT-5.2 | Strategic advice, architecture, hard debugging. |
| **Librarian** | GLM-4.7/Sonnet | Documentation, external research. |
| **Explore** | Grok/Gemini | Fast codebase exploration. |
| **Frontend** | Gemini 3 Pro | UI/UX implementation. |

## HOW TO ADD AGENT

1. Create `src/agents/my-agent.ts`:
   ```typescript
   export const myAgent: AgentConfig = {
     model: "provider/model",
     temperature: 0.1,
     system: "Prompt...",
     tools: { include: [...] }
   }
   ```
2. Register in `src/agents/index.ts`.

## ANTI-PATTERNS

- **Monolithic Prompts**: Split complex prompts into specialized files.
- **High Temp**: Keep code agents <= 0.3.
- **Hardcoded Models**: Use `utils.ts` for fallback logic (max20/antigravity).

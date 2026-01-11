import type { CategoryConfig } from "../../config/schema"

export const DEFAULT_BASE_AGENT = "Sisyphus-Junior"
export const DEFAULT_MODEL = "anthropic/claude-sonnet-4-5"

export const DEFAULT_CATEGORIES: Record<string, CategoryConfig> = {
  "visual-engineering": {
    model: "google/gemini-3-pro-preview",
    temperature: 0.7,
  },
  ultrabrain: {
    model: "openai/gpt-5.2",
    temperature: 0.1,
  },
  artistry: {
    model: "google/gemini-3-pro-preview",
    temperature: 0.9,
  },
  quick: {
    model: "anthropic/claude-haiku-4-5",
    temperature: 0.3,
  },
  "most-capable": {
    model: "anthropic/claude-opus-4-5",
    temperature: 0.1,
  },
  writing: {
    model: "google/gemini-3-flash-preview",
    temperature: 0.5,
  },
  general: {
    model: "anthropic/claude-sonnet-4-5",
    temperature: 0.3,
  },
}

const CATEGORY_LIST = Object.keys(DEFAULT_CATEGORIES).join(", ")

export const SPAWN_AGENT_DESCRIPTION = `Spawn a custom agent with configurable model and system prompt.

REQUIRED:
- prompt: Full detailed task prompt
- description: Short description (3-10 words)
- run_in_background: true=async (returns task_id), false=sync (waits)

MODEL CONFIG:
- model: "provider/model" format (e.g., "anthropic/claude-sonnet-4-5")
- system_prompt: Custom system prompt (replaces default)
- system_prompt_append: Append to default system prompt

TOOL ACCESS:
- tools: { "tool_name": true/false }
- skills: Array of skill names to inject

QUEUE:
- priority: "high" | "normal" | "low" (default: normal)

SESSION:
- resume_session: Session ID to continue

LEGACY:
- base_agent: Base agent name (default: Sisyphus-Junior)
- category: Preset category (${CATEGORY_LIST})

Prompts MUST be in English.`

export const BLOCKED_DELEGATION_TOOLS = ["task", "sisyphus_task", "call_omo_agent", "spawn_agent"]

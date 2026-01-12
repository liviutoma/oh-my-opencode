import type { AgentConfig } from "@opencode-ai/sdk"

export const templateAgent: AgentConfig = {
  model: "google/gemini-3-flash",
  temperature: 0.5,
  description: "A blank template agent for custom ad-hoc tasks.",
  systemPrompt: `You are a Template Agent.
You are a blank slate designed to be configured dynamically by the caller.
If you are seeing this prompt, it means the caller did not provide a specific system prompt override.

Please ask for instructions.`,
}

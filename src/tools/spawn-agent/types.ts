import type { Priority } from "../../features/rate-limit-manager/types"

export interface SpawnAgentArgs {
  prompt: string
  description: string
  run_in_background: boolean

  model?: string
  system_prompt?: string
  system_prompt_file?: string
  system_prompt_append?: string

  tools?: Record<string, boolean>
  skills?: string[]

  priority?: Priority

  resume_session?: string

  base_agent?: string
  category?: string
}

export interface ResolvedModel {
  providerID: string
  modelID: string
  full: string
}

export interface SpawnAgentResult {
  taskId?: string
  sessionId: string
  status: "running" | "completed" | "error"
  output?: string
  duration?: string
  error?: string
}

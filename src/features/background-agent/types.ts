export type BackgroundTaskStatus =
  | "running"
  | "completed"
  | "error"
  | "cancelled"

export interface TaskProgress {
  toolCalls: number
  lastTool?: string
  lastUpdate: Date
  lastMessage?: string
  lastMessageAt?: Date
}

export interface BackgroundTask {
  id: string
  sessionID: string
  parentSessionID: string
  parentMessageID: string
  description: string
  prompt: string
  agent: string
  status: BackgroundTaskStatus
  startedAt: Date
  completedAt?: Date
  result?: string
  error?: string
  progress?: TaskProgress
  parentModel?: { providerID: string; modelID: string }
  model?: { providerID: string; modelID: string }
  concurrencyKey?: string
  useRateLimitManager?: boolean
  parentAgent?: string
  lastMsgCount?: number
  stablePolls?: number
}

export interface LaunchInput {
  description: string
  prompt: string
  agent: string
  parentSessionID: string
  parentMessageID: string
  parentModel?: { providerID: string; modelID: string }
  parentAgent?: string
  model?: { providerID: string; modelID: string }
  skills?: string[]
  skillContent?: string
}

export interface ResumeInput {
  sessionId: string
  prompt: string
  parentSessionID: string
  parentMessageID: string
  parentModel?: { providerID: string; modelID: string }
  parentAgent?: string
}

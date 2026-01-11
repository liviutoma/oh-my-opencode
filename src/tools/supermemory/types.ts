export interface SupermemoryToolOptions {
  apiKey?: string
}

export type SupermemoryMode = "add" | "search" | "profile" | "list" | "forget" | "help"

export type SupermemoryType = "project-config" | "architecture" | "error-solution" | "preference" | "learned-pattern" | "conversation"
export type SupermemoryScope = "user" | "project"

export interface SupermemoryArgs {
  mode?: SupermemoryMode
  query?: string
  content?: string
  type?: SupermemoryType
  scope?: SupermemoryScope
  memoryId?: string
  limit?: number
}

export interface SupermemoryResponse {
  success: boolean
  data?: unknown
  error?: string
}

import { tool, type PluginInput, type ToolDefinition } from "@opencode-ai/plugin"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import type { BackgroundManager } from "../../features/background-agent"
import { RateLimitManager, type ReleaseHandle, type Priority, type RateLimitConfig } from "../../features/rate-limit-manager"
import type { CategoriesConfig, GitMasterConfig } from "../../config/schema"
import type { SpawnAgentArgs, ResolvedModel } from "./types"
import {
  SPAWN_AGENT_DESCRIPTION,
  DEFAULT_BASE_AGENT,
  DEFAULT_MODEL,
  DEFAULT_CATEGORIES,
  BLOCKED_DELEGATION_TOOLS,
} from "./constants"
import { resolveMultipleSkills } from "../../features/opencode-skill-loader/skill-content"
import { findNearestMessageWithFields, MESSAGE_STORAGE } from "../../features/hook-message-injector"
import { getTaskToastManager } from "../../features/task-toast-manager"
import { subagentSessions } from "../../features/claude-code-session-state"

type OpencodeClient = PluginInput["client"]

interface ToolContextWithMetadata {
  sessionID: string
  messageID: string
  agent: string
  abort: AbortSignal
  metadata?: (input: { title?: string; metadata?: Record<string, unknown> }) => void
}

export interface SpawnAgentToolOptions {
  manager: BackgroundManager
  client: OpencodeClient
  rateLimitConfig?: RateLimitConfig
  userCategories?: CategoriesConfig
  gitMasterConfig?: GitMasterConfig
}

function getMessageDir(sessionID: string): string | null {
  if (!existsSync(MESSAGE_STORAGE)) return null

  const directPath = join(MESSAGE_STORAGE, sessionID)
  if (existsSync(directPath)) return directPath

  for (const dir of readdirSync(MESSAGE_STORAGE)) {
    const sessionPath = join(MESSAGE_STORAGE, dir, sessionID)
    if (existsSync(sessionPath)) return sessionPath
  }

  return null
}

function formatDuration(start: Date, end?: Date): string {
  const duration = (end ?? new Date()).getTime() - start.getTime()
  const seconds = Math.floor(duration / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

function parseModelString(model: string): ResolvedModel {
  if (!model || typeof model !== "string" || model.trim() === "") {
    throw new Error(`Invalid model string: "${model}". Expected format: "provider/model"`)
  }

  const trimmed = model.trim()
  const parts = trimmed.split("/")
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return {
      providerID: parts[0],
      modelID: parts.slice(1).join("/"),
      full: trimmed,
    }
  }
  throw new Error(`Invalid model format: "${trimmed}". Expected "provider/model", got single part`)
}

function resolveModel(
  args: SpawnAgentArgs,
  userCategories?: CategoriesConfig
): ResolvedModel {
  try {
    if (args.model) {
      return parseModelString(args.model)
    }

    if (args.category) {
      const categoryConfig = userCategories?.[args.category] ?? DEFAULT_CATEGORIES[args.category]
      if (categoryConfig?.model) {
        return parseModelString(categoryConfig.model)
      }
    }

    return parseModelString(DEFAULT_MODEL)
  } catch (error) {
    console.warn(`[SpawnAgent] Model resolution failed: ${error}. Using default model.`)
    return parseModelString(DEFAULT_MODEL)
  }
}

function buildSystemPrompt(
  args: SpawnAgentArgs,
  ctx: { gitMasterConfig?: GitMasterConfig }
): string | undefined {
  const parts: string[] = []

  if (args.skills?.length) {
    const { resolved } = resolveMultipleSkills(args.skills, ctx)
    if (resolved.size > 0) {
      parts.push(Array.from(resolved.values()).join("\n\n"))
    }
  }

  if (args.system_prompt_file) {
    try {
      const filePath = resolve(process.cwd(), args.system_prompt_file)
      if (existsSync(filePath)) {
        parts.push(readFileSync(filePath, "utf-8"))
      } else {
        console.warn(`[SpawnAgent] Prompt file not found: ${filePath}`)
        if (args.system_prompt) parts.push(args.system_prompt)
      }
    } catch (error) {
      console.warn(`[SpawnAgent] Error reading prompt file: ${error}`)
      if (args.system_prompt) parts.push(args.system_prompt)
    }
  } else if (args.system_prompt) {
    parts.push(args.system_prompt)
  } else if (args.system_prompt_append) {
    parts.push(args.system_prompt_append)
  }

  return parts.length > 0 ? parts.join("\n\n") : undefined
}

function buildToolRestrictions(args: SpawnAgentArgs): Record<string, boolean> {
  const restrictions: Record<string, boolean> = {}

  for (const tool of BLOCKED_DELEGATION_TOOLS) {
    restrictions[tool] = false
  }

  if (args.tools) {
    Object.assign(restrictions, args.tools)
  }

  return restrictions
}

export function createSpawnAgent(options: SpawnAgentToolOptions): ToolDefinition {
  const { manager, client, rateLimitConfig, userCategories, gitMasterConfig } = options
  const rateLimitManager = rateLimitConfig ? new RateLimitManager(rateLimitConfig) : undefined

  return tool({
    description: SPAWN_AGENT_DESCRIPTION,
    args: {
      prompt: tool.schema.string().describe("Full detailed prompt for the agent"),
      description: tool.schema.string().describe("Short task description (3-10 words)"),
      run_in_background: tool.schema
        .boolean()
        .describe("REQUIRED: true=async, false=sync"),

      model: tool.schema
        .string()
        .optional()
        .describe("Model in 'provider/model' format"),
      system_prompt: tool.schema
        .string()
        .optional()
        .describe("Custom system prompt (replaces default)"),
      system_prompt_file: tool.schema
        .string()
        .optional()
        .describe("Path to custom system prompt file (overrides system_prompt)"),
      system_prompt_append: tool.schema
        .string()
        .optional()
        .describe("Append to default system prompt"),

      tools: tool.schema
        .record(tool.schema.string(), tool.schema.boolean())
        .optional()
        .describe("Tool permissions"),
      skills: tool.schema
        .array(tool.schema.string())
        .optional()
        .describe("Skills to inject"),

      priority: tool.schema
        .enum(["high", "normal", "low"])
        .optional()
        .describe("Queue priority (default: normal)"),

      resume_session: tool.schema
        .string()
        .optional()
        .describe("Session ID to resume"),

      base_agent: tool.schema
        .string()
        .optional()
        .describe("Base agent (default: Sisyphus-Junior)"),
      category: tool.schema
        .string()
        .optional()
        .describe("Category name for preset configs"),
    },

    async execute(args: SpawnAgentArgs, toolContext) {
      const ctx = toolContext as ToolContextWithMetadata

      if (args.run_in_background === undefined) {
        return `❌ 'run_in_background' is REQUIRED. Use false for delegation, true for parallel exploration.`
      }

      const resolvedModel = resolveModel(args, userCategories)
      const systemPrompt = buildSystemPrompt(args, { gitMasterConfig })
      const toolRestrictions = buildToolRestrictions(args)
      const agentToUse = args.base_agent ?? DEFAULT_BASE_AGENT
       const priority = (args.priority ?? "normal") as Priority
       if (!["high", "normal", "low"].includes(priority)) {
         return `❌ Invalid priority: "${args.priority}". Must be "high", "normal", or "low".`
       }

      let releaseHandle: ReleaseHandle | undefined
      if (rateLimitManager) {
        try {
          releaseHandle = await rateLimitManager.acquire(resolvedModel.full, priority)
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          return `❌ Rate limit error: ${message}`
        }
      }

      const messageDir = getMessageDir(ctx.sessionID)
      const prevMessage = messageDir ? findNearestMessageWithFields(messageDir) : null
      const parentAgent = ctx.agent ?? prevMessage?.agent

      try {
        if (args.resume_session) {
          return await executeResume(args, ctx, client, releaseHandle, parentAgent)
        }

        if (args.run_in_background) {
          return await executeBackground(
            args,
            ctx,
            manager,
            resolvedModel,
            systemPrompt,
            toolRestrictions,
            agentToUse,
            releaseHandle,
            parentAgent
          )
        }

        return await executeSync(
          args,
          ctx,
          client,
          resolvedModel,
          systemPrompt,
          toolRestrictions,
          agentToUse,
          releaseHandle
        )
      } catch (error) {
        releaseHandle?.release()
        const message = error instanceof Error ? error.message : String(error)
        return `❌ Task failed: ${message}`
      }
    },
  })
}

async function executeResume(
  args: SpawnAgentArgs,
  ctx: ToolContextWithMetadata,
  client: OpencodeClient,
  releaseHandle?: ReleaseHandle,
  parentAgent?: string
): Promise<string> {
  const sessionId = args.resume_session!
  const startTime = new Date()

  ctx.metadata?.({
    title: `Resume: ${args.description}`,
    metadata: { sessionId, sync: !args.run_in_background },
  })

  try {
    await client.session.prompt({
      path: { id: sessionId },
      body: {
        tools: { task: false, sisyphus_task: false, spawn_agent: false },
        parts: [{ type: "text", text: args.prompt }],
      },
    })

    const POLL_INTERVAL_MS = 500
    const MIN_STABILITY_TIME_MS = 5000
    const STABILITY_POLLS_REQUIRED = 3
    const pollStart = Date.now()
    let lastMsgCount = 0
    let stablePolls = 0

    while (Date.now() - pollStart < 60000) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))

      const elapsed = Date.now() - pollStart
      if (elapsed < MIN_STABILITY_TIME_MS) continue

      const messagesCheck = await client.session.messages({ path: { id: sessionId } })
      const msgs = ((messagesCheck as { data?: unknown }).data ?? messagesCheck) as unknown[]
      const currentMsgCount = msgs.length

      if (currentMsgCount > 0 && currentMsgCount === lastMsgCount) {
        stablePolls++
        if (stablePolls >= STABILITY_POLLS_REQUIRED) break
      } else {
        stablePolls = 0
        lastMsgCount = currentMsgCount
      }
    }

    const messagesResult = await client.session.messages({ path: { id: sessionId } })
    if (messagesResult.error) {
      releaseHandle?.release()
      return `❌ Error fetching result: ${messagesResult.error}\n\nSession ID: ${sessionId}`
    }

    const messages = ((messagesResult as { data?: unknown }).data ?? messagesResult) as Array<{
      info?: { role?: string; time?: { created?: number } }
      parts?: Array<{ type?: string; text?: string }>
    }>

    const assistantMessages = messages
      .filter((m) => m.info?.role === "assistant")
      .sort((a, b) => (b.info?.time?.created ?? 0) - (a.info?.time?.created ?? 0))
    const lastMessage = assistantMessages[0]

    releaseHandle?.release()

    if (!lastMessage) {
      return `❌ No assistant response found.\n\nSession ID: ${sessionId}`
    }

    const textParts =
      lastMessage?.parts?.filter((p) => p.type === "text" || p.type === "reasoning") ?? []
    const textContent = textParts
      .map((p) => p.text ?? "")
      .filter(Boolean)
      .join("\n")

    const duration = formatDuration(startTime)

    return `Task resumed and completed in ${duration}.

Session ID: ${sessionId}

---

${textContent || "(No text output)"}`
  } catch (error) {
    releaseHandle?.release()
    const message = error instanceof Error ? error.message : String(error)
    return `❌ Failed to resume: ${message}\n\nSession ID: ${sessionId}`
  }
}

async function executeBackground(
  args: SpawnAgentArgs,
  ctx: ToolContextWithMetadata,
  manager: BackgroundManager,
  resolvedModel: ResolvedModel,
  systemPrompt: string | undefined,
  toolRestrictions: Record<string, boolean>,
  agentToUse: string,
  releaseHandle?: ReleaseHandle,
  parentAgent?: string
): Promise<string> {
  try {
    const task = await manager.launch({
      description: args.description,
      prompt: args.prompt,
      agent: agentToUse,
      parentSessionID: ctx.sessionID,
      parentMessageID: ctx.messageID,
      parentAgent,
      model: { providerID: resolvedModel.providerID, modelID: resolvedModel.modelID },
      skills: args.skills,
      skillContent: systemPrompt,
    })

    ctx.metadata?.({
      title: args.description,
      metadata: {
        sessionId: task.sessionID,
        model: resolvedModel.full,
        priority: args.priority,
      },
    })

    setTimeout(() => {
      releaseHandle?.release()
    }, 30 * 60 * 1000)

    return `Background task launched.

Task ID: ${task.id}
Session ID: ${task.sessionID}
Description: ${task.description}
Agent: ${task.agent}
Model: ${resolvedModel.full}
Status: ${task.status}

System notifies on completion. Use \`background_output\` with task_id="${task.id}" to check.`
  } catch (error) {
    releaseHandle?.release()
    throw error
  }
}

async function executeSync(
  args: SpawnAgentArgs,
  ctx: ToolContextWithMetadata,
  client: OpencodeClient,
  resolvedModel: ResolvedModel,
  systemPrompt: string | undefined,
  toolRestrictions: Record<string, boolean>,
  agentToUse: string,
  releaseHandle?: ReleaseHandle
): Promise<string> {
  const toastManager = getTaskToastManager()
  let taskId: string | undefined
  let syncSessionID: string | undefined

  try {
    const createResult = await client.session.create({
      body: {
        parentID: ctx.sessionID,
        title: `Task: ${args.description}`,
      },
    })

    if (createResult.error) {
      releaseHandle?.release()
      return `❌ Failed to create session: ${createResult.error}`
    }

    const sessionID = createResult.data.id
    syncSessionID = sessionID
    subagentSessions.add(sessionID)
    taskId = `sync_${sessionID.slice(0, 8)}`
    const startTime = new Date()

    if (toastManager) {
      toastManager.addTask({
        id: taskId,
        description: args.description,
        agent: agentToUse,
        isBackground: false,
        skills: args.skills,
      })
    }

    ctx.metadata?.({
      title: args.description,
      metadata: {
        sessionId: sessionID,
        model: resolvedModel.full,
        sync: true,
      },
    })

    let promptError: Error | undefined
    client.session
      .prompt({
        path: { id: sessionID },
        body: {
          agent: agentToUse,
          model: { providerID: resolvedModel.providerID, modelID: resolvedModel.modelID },
          system: systemPrompt,
          tools: toolRestrictions,
          parts: [{ type: "text", text: args.prompt }],
        },
      })
      .catch((error) => {
        promptError = error instanceof Error ? error : new Error(String(error))
      })

    await new Promise((resolve) => setTimeout(resolve, 100))

    if (promptError) {
      if (toastManager && taskId) {
        toastManager.removeTask(taskId)
      }
      releaseHandle?.release()
      const errorMessage = promptError.message
      if (errorMessage.includes("agent.name") || errorMessage.includes("undefined")) {
        return `❌ Agent "${agentToUse}" not found.\n\nSession ID: ${sessionID}`
      }
      return `❌ Failed to send prompt: ${errorMessage}\n\nSession ID: ${sessionID}`
    }

    const POLL_INTERVAL_MS = 500
    const MAX_POLL_TIME_MS = 10 * 60 * 1000
    const MIN_STABILITY_TIME_MS = 10000
    const STABILITY_POLLS_REQUIRED = 3
    const pollStart = Date.now()
    let lastMsgCount = 0
    let stablePolls = 0

    while (Date.now() - pollStart < MAX_POLL_TIME_MS) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))

      const statusResult = await client.session.status()
      const allStatuses = (statusResult.data ?? {}) as Record<string, { type: string }>
      const sessionStatus = allStatuses[sessionID]

      if (sessionStatus && sessionStatus.type !== "idle") {
        stablePolls = 0
        lastMsgCount = 0
        continue
      }

      const elapsed = Date.now() - pollStart
      if (elapsed < MIN_STABILITY_TIME_MS) {
        continue
      }

      const messagesCheck = await client.session.messages({ path: { id: sessionID } })
      const msgs = ((messagesCheck as { data?: unknown }).data ?? messagesCheck) as unknown[]
      const currentMsgCount = msgs.length

      if (currentMsgCount > 0 && currentMsgCount === lastMsgCount) {
        stablePolls++
        if (stablePolls >= STABILITY_POLLS_REQUIRED) {
          break
        }
      } else {
        stablePolls = 0
        lastMsgCount = currentMsgCount
      }
    }

    const messagesResult = await client.session.messages({ path: { id: sessionID } })

    if (messagesResult.error) {
      releaseHandle?.release()
      return `❌ Error fetching result: ${messagesResult.error}\n\nSession ID: ${sessionID}`
    }

    const messages = ((messagesResult as { data?: unknown }).data ?? messagesResult) as Array<{
      info?: { role?: string; time?: { created?: number } }
      parts?: Array<{ type?: string; text?: string }>
    }>

    const assistantMessages = messages
      .filter((m) => m.info?.role === "assistant")
      .sort((a, b) => (b.info?.time?.created ?? 0) - (a.info?.time?.created ?? 0))
    const lastMessage = assistantMessages[0]

    if (!lastMessage) {
      releaseHandle?.release()
      return `❌ No assistant response found.\n\nSession ID: ${sessionID}`
    }

    const textParts =
      lastMessage?.parts?.filter((p) => p.type === "text" || p.type === "reasoning") ?? []
    const textContent = textParts
      .map((p) => p.text ?? "")
      .filter(Boolean)
      .join("\n")

    const duration = formatDuration(startTime)

    if (toastManager && taskId) {
      toastManager.removeTask(taskId)
    }

    subagentSessions.delete(sessionID)
    releaseHandle?.release()

    return `Task completed in ${duration}.

Agent: ${agentToUse}
Model: ${resolvedModel.full}
Session ID: ${sessionID}

---

${textContent || "(No text output)"}`
  } catch (error) {
    if (toastManager && taskId) {
      toastManager.removeTask(taskId)
    }
    if (syncSessionID) {
      subagentSessions.delete(syncSessionID)
    }
    releaseHandle?.release()
    throw error
  }
}

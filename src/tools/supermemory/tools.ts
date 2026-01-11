import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool"
import { TOOL_DESCRIPTION } from "./constants"
import type { SupermemoryToolOptions } from "./types"

export function createSupermemoryTool(options: SupermemoryToolOptions): ToolDefinition {
  return tool({
    description: TOOL_DESCRIPTION,
    args: {
      mode: tool.schema.string().describe("Operation mode: add, search, profile, list, forget, help"),
      query: tool.schema.string().optional().describe("Search query string"),
      content: tool.schema.string().optional().describe("Content to store (for add mode)"),
      type: tool.schema.string().optional().describe("Type of memory (for add mode): project-config, architecture, error-solution, preference, learned-pattern, conversation"),
      scope: tool.schema.string().optional().describe("Scope of memory (for add mode): user, project"),
      memoryId: tool.schema.string().optional().describe("ID of memory to forget"),
      limit: tool.schema.number().optional().describe("Number of results to return")
    },
    execute: async (args) => {
      const { apiKey } = options
      
      if (!apiKey) {
        throw new Error("Supermemory API key not configured. Please add 'supermemory_api_key' to your configuration.")
      }

      const headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }

      try {
        switch (args.mode) {
          case "add": {
            if (!args.content) {
              throw new Error("'content' is required for 'add' mode")
            }

            const payload = {
              content: args.content,
              metadata: {
                type: args.type,
                scope: args.scope,
                source: "oh-my-opencode"
              }
            }

            const response = await fetch("https://api.supermemory.ai/v3/documents", {
              method: "POST",
              headers,
              body: JSON.stringify(payload)
            })

            if (!response.ok) {
              throw new Error(`Supermemory API error: ${response.status} ${response.statusText}`)
            }

            const data = await response.json() as { id: string }
            return `Memory added successfully. ID: ${data.id}`
          }

          case "search": {
            if (!args.query) {
              throw new Error("'query' is required for 'search' mode")
            }

            const payload = {
              query: args.query,
              top_k: args.limit || 5
            }

            const response = await fetch("https://api.supermemory.ai/v3/search/search-documents", {
              method: "POST",
              headers,
              body: JSON.stringify(payload)
            })

            if (!response.ok) {
              throw new Error(`Supermemory API error: ${response.status} ${response.statusText}`)
            }

            const data = await response.json() as { results: Array<{ id: string, content: string, score: number }> }
            const results = data.results || []
            
            if (results.length === 0) {
              return "No relevant memories found."
            }

            const formatted = results.map((r) => 
              `[Score: ${r.score?.toFixed(2)}] ${r.content?.substring(0, 200)}... (ID: ${r.id})`
            ).join("\n\n")

            return formatted
          }

          case "list": {
             const response = await fetch("https://api.supermemory.ai/v3/documents", {
                method: "GET", 
                headers
             })
             
             if (!response.ok) {
                throw new Error(`Supermemory API error: ${response.status} ${response.statusText}`)
             }
             
             const data = await response.json()
             return JSON.stringify(data, null, 2)
          }

          default:
            throw new Error(`Mode '${args.mode}' not implemented yet or valid.`)
        }
      } catch (error: any) {
        return `Error: ${error.message}`
      }
    }
  })
}

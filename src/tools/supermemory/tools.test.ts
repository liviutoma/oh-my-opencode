import { describe, expect, it, mock, beforeEach } from "bun:test"
import { createSupermemoryTool } from "./tools"
import type { ToolContext } from "@opencode-ai/plugin"

describe("supermemory tool", () => {
  const mockFetch = mock()
  const apiKey = "test-api-key"
  
  const mockContext: ToolContext = {
    sessionID: "session_123",
    messageID: "msg_123",
    agent: "test-agent",
    abort: new AbortController().signal
  }

  global.fetch = mockFetch as any

  beforeEach(() => {
    mockFetch.mockReset()
  })

  it("should enforce authentication", async () => {
    const tool = createSupermemoryTool({ apiKey: undefined })
    const result = await tool.execute({ mode: "list" }, mockContext) as string 
    
    expect(result).toContain("Supermemory API key not configured")
  })

  it("should handle 'add' mode", async () => {
    const tool = createSupermemoryTool({ apiKey })
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: "doc_123",
        status: "processing"
      })
    })

    const result = await tool.execute({
      mode: "add",
      content: "This is a test memory",
      type: "learned-pattern",
      scope: "project"
    }, mockContext) as string

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch.mock.calls[0][0]).toBe("https://api.supermemory.ai/v3/documents")
    expect(mockFetch.mock.calls[0][1].method).toBe("POST")
    
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.content).toBe("This is a test memory")
    expect(body.metadata.type).toBe("learned-pattern")
    expect(body.metadata.scope).toBe("project")
    
    expect(result).toContain("doc_123")
  })

  it("should handle 'search' mode", async () => {
    const tool = createSupermemoryTool({ apiKey })
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { id: "doc_1", content: "Memory 1", score: 0.9 },
          { id: "doc_2", content: "Memory 2", score: 0.8 }
        ]
      })
    })

    const result = await tool.execute({
      mode: "search",
      query: "test query",
      limit: 5
    }, mockContext) as string

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch.mock.calls[0][0]).toBe("https://api.supermemory.ai/v3/search/search-documents")
    
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.query).toBe("test query")
    expect(body.top_k).toBe(5)
    
    expect(result).toContain("Memory 1")
    expect(result).toContain("Memory 2")
  })

  it("should handle API errors gracefully", async () => {
    const tool = createSupermemoryTool({ apiKey })
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized"
    })

    const result = await tool.execute({
      mode: "list"
    }, mockContext) as string

    expect(result).toContain("Unauthorized")
  })
})

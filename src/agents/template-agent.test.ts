import { describe, it, expect } from "bun:test"
import { templateAgent } from "./template-agent"
import { builtinAgents } from "./index"

describe("Template Agent", () => {
  it("should be registered in builtinAgents", () => {
    expect(builtinAgents).toHaveProperty("template")
    expect(builtinAgents.template).toBe(templateAgent)
  })

  it("should have the correct default configuration", () => {
    expect(templateAgent.model).toBe("anthropic/claude-sonnet-4-5")
    expect(templateAgent.description).toContain("blank template agent")
    expect(templateAgent.systemPrompt).toContain("You are a Template Agent")
  })
})

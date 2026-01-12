
import { createSpawnAgent } from "./tools";
import type { SpawnAgentArgs } from "./types";
import type { BackgroundManager, BackgroundTask } from "../../features/background-agent";
import type { PluginInput } from "@opencode-ai/plugin";

// Mock Background Manager
class MockBackgroundManager {
  async launch(input: any) {
    console.log("[MockBackgroundManager] Launching task:", input);
    return {
      id: "mock-task-id",
      sessionID: "mock-session-id",
      description: input.description,
      agent: input.agent,
      status: "pending",
    } as BackgroundTask;
  }
}

// Mock OpenCode Client
const mockClient = {
  session: {
    create: async () => ({ data: { id: "mock-session-id" } }),
    prompt: async () => {},
    status: async () => ({ data: { "mock-session-id": { type: "idle" } } }),
    messages: async () => ({ data: [] }),
  },
} as unknown as PluginInput["client"];

// Main test function
async function runTest() {
  const spawnAgentTool = createSpawnAgent({
    manager: new MockBackgroundManager() as unknown as BackgroundManager,
    client: mockClient,
    rateLimitConfig: { enabled: false }, // Disable rate limiting for test
    userCategories: {
        "custom-category": {
            model: "provider/custom-model",
            temperature: 0.7
        }
    }
  });

  console.log("--- Testing spawn_agent with custom config ---");

  const args: SpawnAgentArgs = {
    prompt: "Test prompt with custom config",
    description: "Test Task",
    run_in_background: true,
    model: "openai/gpt-4-custom", // Custom model config
    system_prompt: "You are a custom agent", // Custom system prompt
    priority: "high", // Custom priority
    tools: { "bash": true }, // Custom tools
    skills: ["git-master"], // Custom skills
  };

  const toolContext = {
    sessionID: "main-session",
    messageID: "msg-1",
    agent: "Sisyphus",
    abort: new AbortController().signal,
    metadata: (meta: any) => console.log("[Metadata Update]:", meta)
  };

  const result = await spawnAgentTool.execute(args, toolContext as any);
  console.log("\nResult:", result);
}

runTest().catch(console.error);

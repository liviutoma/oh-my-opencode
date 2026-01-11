import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool";
import type { RateLimitStats } from "../../features/rate-limit-manager/types";

export const rateLimitStatsTool: ToolDefinition = tool({
  description: "Get current rate limiting statistics including active counts, limits, and queued requests per model/provider",
  args: {},
  execute: async (args: Record<string, never>, context) => {
    // Get the background manager from context
    const backgroundManager = (context as any).backgroundManager;
    if (!backgroundManager?.rateLimitManager) {
      return "Rate limiting is not enabled or manager not available";
    }

    const stats: RateLimitStats = backgroundManager.rateLimitManager.getStats();

    return JSON.stringify(stats, null, 2);
  },
});
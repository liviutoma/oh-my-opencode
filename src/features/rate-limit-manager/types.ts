/**
 * Priority levels for rate limit queue ordering.
 * High priority tasks jump ahead of normal/low in the queue.
 */
export type Priority = "high" | "normal" | "low"

/**
 * Configuration for the RateLimitManager.
 */
export interface RateLimitConfig {
  /** Enable/disable rate limiting entirely (default: true) */
  enabled: boolean
  /** Default concurrency limit when no specific limit is set */
  defaultConcurrency: number
  /** Provider-level limits: "anthropic" -> 3 */
  providerLimits?: Record<string, number>
  /** Model-specific limits: "anthropic/claude-opus-4-5" -> 2 */
  modelLimits?: Record<string, number>
  /** Timeout in ms before queued requests are rejected (default: 300000 = 5 min) */
  queueTimeout: number
}

/**
 * A request waiting in the queue for a rate limit slot.
 */
export interface QueuedRequest {
  /** Unique identifier for this request */
  id: string
  /** Full model string (provider/model format) */
  model: string
  /** Priority level */
  priority: Priority
  /** Called when a slot becomes available */
  resolve: () => void
  /** Called on timeout or shutdown */
  reject: (error: Error) => void
  /** Timestamp when request was enqueued */
  enqueuedAt: number
}

/**
 * Handle returned after acquiring a rate limit slot.
 * Call release() when done to free the slot.
 */
export interface ReleaseHandle {
  /** Release the acquired slot */
  release: () => void
  /** The model this slot was acquired for */
  model: string
}

/**
 * Statistics for a single limit (provider, model, or global).
 */
export interface LimitStats {
  /** Number of currently active requests */
  active: number
  /** Maximum allowed concurrent requests */
  limit: number
  /** Number of requests waiting in queue */
  queued: number
}

/**
 * Complete rate limit statistics.
 */
export interface RateLimitStats {
  /** Per-provider statistics */
  providers: Record<string, LimitStats>
  /** Per-model statistics */
  models: Record<string, LimitStats>
  /** Global aggregate statistics */
  global: LimitStats
}

/**
 * Resolved model information from "provider/model" string.
 */
export interface ResolvedModel {
  /** Provider ID (e.g., "anthropic") */
  providerID: string
  /** Model ID (e.g., "claude-opus-4-5") */
  modelID: string
  /** Full model string (e.g., "anthropic/claude-opus-4-5") */
  full: string
}

/**
 * Default configuration values for RateLimitManager.
 */
export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  enabled: true,
  defaultConcurrency: 5,
  providerLimits: {},
  modelLimits: {},
  queueTimeout: 300000, // 5 minutes
}

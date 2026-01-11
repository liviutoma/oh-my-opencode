import type {
  Priority,
  RateLimitConfig,
  QueuedRequest,
  ReleaseHandle,
  LimitStats,
  RateLimitStats,
  DEFAULT_RATE_LIMIT_CONFIG,
} from "./types"

export class RateLimitManager {
  private config: RateLimitConfig
  private activeCounts: Map<string, number> = new Map()
  private queues: Map<string, QueuedRequest[]> = new Map()
  private timeoutTimers: Map<string, NodeJS.Timeout> = new Map()

  constructor(config?: Partial<RateLimitConfig>) {
    this.config = {
      enabled: true,
      defaultConcurrency: 5,
      providerLimits: {},
      modelLimits: {},
      queueTimeout: 300000,
      ...config,
    }
  }

  getLimit(model: string): number {
    const modelLimit = this.config.modelLimits?.[model]
    if (modelLimit !== undefined) {
      return modelLimit
    }

    const provider = model.split("/")[0]
    const providerLimit = this.config.providerLimits?.[provider]
    if (providerLimit !== undefined) {
      return providerLimit
    }

    return this.config.defaultConcurrency
  }

  async acquire(model: string, priority: Priority = "normal"): Promise<ReleaseHandle> {
    if (!this.config.enabled) {
      return { release: () => {}, model }
    }

    const limit = this.getLimit(model)
    const current = this.activeCounts.get(model) ?? 0

    if (current < limit) {
      this.activeCounts.set(model, current + 1)
      console.log(`[RateLimit] Acquired slot for ${model}: ${current + 1}/${limit} active`)
      return {
        release: () => this.release(model),
        model,
      }
    }

    // Rate limit hit - queue the request
    console.log(`[RateLimit] Rate limit hit for ${model}: ${current}/${limit} active, queuing request (priority: ${priority})`)
    return new Promise((resolve, reject) => {
      const requestId = crypto.randomUUID()
      const request: QueuedRequest = {
        id: requestId,
        model,
        priority,
        resolve: () => {
          this.activeCounts.set(model, (this.activeCounts.get(model) ?? 0) + 1)
          console.log(`[RateLimit] Dequeued and acquired slot for ${model}: ${(this.activeCounts.get(model) ?? 0)}/${limit} active`)
          resolve({
            release: () => this.release(model),
            model,
          })
        },
        reject,
        enqueuedAt: Date.now(),
      }

      const queue = this.queues.get(model) ?? []
      this.insertByPriority(queue, request)
      this.queues.set(model, queue)
      console.log(`[RateLimit] Request queued for ${model}: ${queue.length} in queue`)

      const timer = setTimeout(() => {
        this.removeFromQueue(model, requestId)
        console.log(`[RateLimit] Request timeout for ${model} after ${this.config.queueTimeout}ms`)
        reject(new Error(`Rate limit queue timeout for model: ${model}`))
      }, this.config.queueTimeout)

      this.timeoutTimers.set(requestId, timer)
    })
  }

  release(model: string): void {
    if (!this.config.enabled) return

    const limit = this.getLimit(model)
    const queue = this.queues.get(model)

    if (queue && queue.length > 0) {
      const next = queue.shift()!

      const timer = this.timeoutTimers.get(next.id)
      if (timer) {
        clearTimeout(timer)
        this.timeoutTimers.delete(next.id)
      }

      next.resolve()
      console.log(`[RateLimit] Released slot for ${model}, dequeued next request: ${queue.length} remaining in queue`)
    } else {
      const current = this.activeCounts.get(model) ?? 0
      if (current > 0) {
        this.activeCounts.set(model, current - 1)
        console.log(`[RateLimit] Released slot for ${model}: ${current - 1}/${limit} active`)
      }
    }
  }

  getStats(): RateLimitStats {
    const providers: Record<string, LimitStats> = {}
    const models: Record<string, LimitStats> = {}
    let totalActive = 0
    let totalQueued = 0

    for (const [model, count] of this.activeCounts) {
      const queue = this.queues.get(model) ?? []
      models[model] = {
        active: count,
        limit: this.getLimit(model),
        queued: queue.length,
      }
      totalActive += count
      totalQueued += queue.length

      const provider = model.split("/")[0]
      if (!providers[provider]) {
        providers[provider] = { active: 0, limit: 0, queued: 0 }
      }
      providers[provider].active += count
      providers[provider].queued += queue.length
    }

    for (const provider of Object.keys(providers)) {
      providers[provider].limit =
        this.config.providerLimits?.[provider] ?? this.config.defaultConcurrency
    }

    return {
      providers,
      models,
      global: {
        active: totalActive,
        limit: this.config.defaultConcurrency,
        queued: totalQueued,
      },
    }
  }

  getActiveCount(model: string): number {
    return this.activeCounts.get(model) ?? 0
  }

  getQueueLength(model: string): number {
    return this.queues.get(model)?.length ?? 0
  }

  isEnabled(): boolean {
    return this.config.enabled
  }

  shutdown(): void {
    for (const timer of this.timeoutTimers.values()) {
      clearTimeout(timer)
    }
    this.timeoutTimers.clear()

    for (const [, queue] of this.queues) {
      for (const request of queue) {
        request.reject(new Error("RateLimitManager shutdown"))
      }
    }
    this.queues.clear()
    this.activeCounts.clear()
  }

  private insertByPriority(queue: QueuedRequest[], request: QueuedRequest): void {
    const priorityOrder: Record<Priority, number> = { high: 0, normal: 1, low: 2 }
    const insertPriority = priorityOrder[request.priority]

    let insertIndex = queue.length
    for (let i = 0; i < queue.length; i++) {
      if (priorityOrder[queue[i].priority] > insertPriority) {
        insertIndex = i
        break
      }
    }

    queue.splice(insertIndex, 0, request)
  }

  private removeFromQueue(model: string, requestId: string): void {
    const queue = this.queues.get(model)
    if (queue) {
      const index = queue.findIndex((r) => r.id === requestId)
      if (index !== -1) {
        queue.splice(index, 1)
      }
    }
  }
}

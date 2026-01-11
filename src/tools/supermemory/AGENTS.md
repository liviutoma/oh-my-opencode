# Supermemory Tool

Manage and query the [Supermemory](https://supermemory.ai) persistent memory system.

This tool allows agents to:
- **Search** for relevant context across all stored memories.
- **Add** new memories (knowledge, learned patterns, error solutions).
- **List** recent memories.

## Prerequisites

1.  Get your API Key from the [Supermemory Dashboard](https://console.supermemory.ai).
2.  Add it to your `oh-my-opencode.json`:
    ```json
    {
      "supermemory_api_key": "sm_..."
    }
    ```

## Usage

### 1. Adding a Memory

Use `mode: "add"` to store information. Best practices for `content`:
-   **Be specific**: Include enough context so the memory is useful later.
-   **Categorize**: Use the `type` parameter (`error-solution`, `learned-pattern`, `project-config`, etc.).
-   **Scope**: Use `scope: "project"` for project-specific knowledge, `scope: "user"` for personal preferences.

**Example (Learned Pattern):**
```typescript
supermemory({
  mode: "add",
  content: "In this project (oh-my-opencode), always use `bun test` instead of `npm test`. Tests must be co-located with source files.",
  type: "learned-pattern",
  scope: "project"
})
```

**Example (Error Solution):**
```typescript
supermemory({
  mode: "add",
  content: "Fix for 'Heap limit allocation failed' in Bun: Increase max heap size using `BUN_JSC_forceRAMSize` env var.",
  type: "error-solution",
  scope: "user"
})
```

### 2. Searching Memories

Use `mode: "search"` to find relevant information.

**Example:**
```typescript
supermemory({
  mode: "search",
  query: "how to run tests in this project",
  limit: 3
})
```

### 3. Listing Memories

Use `mode: "list"` to see recent documents/memories.

```typescript
supermemory({
  mode: "list"
})
```

## When to Use

-   **Start of Session**: Search for project-specific patterns or "gotchas".
-   **After Solving a Hard Bug**: Add a "learned-pattern" or "error-solution" memory so you don't solve it twice.
-   **New Architecture Decisions**: Add "architecture" memories to keep the team (and future agents) aligned.

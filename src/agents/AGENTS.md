# AGENTS KNOWLEDGE BASE

## OVERVIEW
Multi-model orchestration system centered on **Sisyphus** (The Conductor). Employs specialized personas with strict boundaries to maximize reasoning accuracy and execution discipline.

## THE CONDUCTOR MODEL
- **Sisyphus (Claude Opus 4.5)**: Primary Conductor. Orchestrates sub-agents, manages todos, and ensures task completion.
- **Strict Persona Boundaries**: Planners **DO NOT** code. Implementers **DO NOT** plan.
- **Identity Enforcement**: Prometheus (Planner) is forbidden from writing source code (enforced by system hooks).

## CORE PERSONAS
| Persona | Model | Role | Focus |
|---------|-------|------|-------|
| **Sisyphus** | Claude Opus 4.5 | Conductor | Orchestration, delegation, monitoring. |
| **Oracle** | GPT-5.2 | Strategist | Architecture, logic, hard debugging. |
| **Librarian** | GLM-4.7/Sonnet | Researcher | Multi-repo analysis, documentation lookup. |
| **Prometheus** | Claude Opus | Planner | Work plan generation (.md only). |
| **Metis** | Claude Sonnet | Consultant | Pre-planning gap analysis, risk detection. |
| **Momus** | Claude Opus | Reviewer | Rigorous plan validation (OKAY/REJECT loop). |
| **Template** | *Custom* | Blank Slate | Generic agent for ad-hoc persona injection. |

## DELEGATION LOGIC
Task delegation via `spawn_agent` or `sisyphus_task` **MUST** use the **7-section format**:
1. **TASK**: Atomic, specific goal (one action per delegation).
2. **EXPECTED OUTCOME**: Concrete, verifiable results.
3. **REQUIRED SKILLS**: Domain expertise needed.
4. **REQUIRED TOOLS**: LSP, AST-grep, Bash, etc.
5. **MUST DO**: Explicit implementation constraints.
6. **MUST NOT DO**: Scope boundaries and guardrails.
7. **CONTEXT**: Relevant file paths, patterns, and research findings.

## PROMPT ENGINEERING
- **Modular Prompts**: Split monolithic prompts into specialized personas (`prometheus-prompt.ts`, `sisyphus-junior.ts`).
- **Orchestration Logic**: Sisyphus delegates tasks in background=false mode to wait for atomic completion.
- **Parallel Probes**: Use background agents (Explore/Librarian) for codebase mapping to keep main context lean.
- **Dynamic Context**: Agents should leverage `AGENTS.md` and `README.md` injection for folder-specific rules.

## ANTI-PATTERNS
- **Monolithic Prompts**: Combining planning and implementation. Split them.
- **High Temperature**: Code agents MUST use `temp <= 0.3`. High temp leads to "AI Slop".
- **Direct Coding by Planners**: System failure. Planners only produce plans/drafts.
- **Short Prompts**: 7-section format is mandatory. Short prompts cause execution failure.
- **Persona Drifting**: Using Sisyphus for basic grep tasks. Delegate to sub-agents.

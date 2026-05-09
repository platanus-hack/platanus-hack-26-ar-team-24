# Backend Architecture - Compatibility Core

## Overview

The backend implements the core compatibility system: **agents that replicate user personalities and evaluate compatibility through conversation**.

## Key Components

### 1. `RuntimeClient` (`runtime-client.ts`)
Encapsulates all communication with OpenClaw runtime.

**Responsibilities:**
- List and create agents
- Send messages to agents
- Update agent knowledge files
- Extract and parse agent responses

**Benefits:**
- Centralized error handling
- Consistent token authentication
- Testable interface

### 2. `CompatibilityService` (`compatibility-service.ts`)
Core logic for personality profiling and compatibility evaluation.

**Methods:**
- `createProfiledAgent(agentId, user)`: Profile a user and create their representative agent
- `runConversation(config)`: Execute agent conversation and evaluate compatibility

**Workflow:**

#### Agent Creation
```
User Profile → Grader Agent → Evaluate Profile → Write Knowledge Files → Agent Ready
```

The **Grader Agent** analyzes user data and generates:
- Personality summary
- Conversation style
- Values, strengths, risks, interests
- Three scores: personal/social/professional (0-1)

#### Compatibility Evaluation
```
Agent A ↔ Agent B → Conversation Rounds → Judge Agent → Compatibility Score
```

The **Judge Agent** evaluates after each round:
- Real vs. polite interaction detection
- Value/interest alignment
- Decision: `match` | `no_match` | `continue`
- Score: 0-1 (0=incompatible, 1=perfect match)

### 3. Types (`types.ts`)
Single source of truth for all data shapes using Zod schemas.

**Key types:**
- `UserProfile`: User input data
- `GraderProfile`: Extracted personality traits
- `JudgeDecision`: Compatibility evaluation result
- `ConversationConfig`: Conversation parameters

### 4. Logger (`logger.ts`)
Structured logging with context.

**Output:**
- Conversation IDs for tracing
- Agent decisions and scores
- Errors with context

## Request Flow

```
POST /agents (with user profile)
  ↓
Validate with profiledAgentCreateSchema
  ↓
CompatibilityService.createProfiledAgent()
  ├→ Ensure grader agent exists
  ├→ Create new agent in OpenClaw
  ├→ Evaluate user profile (→ grader agent)
  ├→ Write personality files (IDENTITY.md, SOUL.md, etc.)
  └→ Return GraderProfile
```

```
POST /conversations/run (with agentA, agentB, opening message)
  ↓
Validate with conversationConfigSchema
  ↓
CompatibilityService.runConversation()
  ├→ Ensure all agents exist
  ├→ For each round (1 to maxRounds):
  │  ├→ AgentA responds (2 turns)
  │  ├→ AgentB responds (2 turns)
  │  └→ Judge evaluates
  │     ├→ If done: match/no_match
  │     ├→ If continue: prepare next round
  │     └→ If max rounds: decide based on score
  └→ Return full conversation with compatibility result
```

## Prompt Engineering

### Grader Prompt
Creates a **rich personality profile** for the representative agent.

**Key elements:**
- Explicit scoring guidance (0-1 range)
- Field-by-field requirements
- Emphasis on concrete, specific traits
- Personality summary for how agent should act

### Judge Prompt
Evaluates **genuine compatibility** vs. superficial politeness.

**Key elements:**
- Clear scoring buckets (0.0-0.2 incompatible, 0.8-1.0 exceptional)
- Rules for deciding match/no_match/continue
- Detection of "polite but empty" (score ≤0.5)
- Requirement for mutual enthusiasm
- Shared interests validation

### Turn Prompts
Keep agents **consistent and natural** during conversation.

**First turn:** Allow greeting and self-introduction
**Subsequent turns:** Enforce continuity, forbid re-greetings, advance conversation

## Error Handling

- **RuntimeClient errors**: Network/timeout failures → logged + propagated
- **JSON parsing**: Attempts to extract JSON from agent output (fenced or inline)
- **Validation**: Zod validates all agent responses before use
- **Yielding check**: Detects if agent delegates instead of responding

## Performance Considerations

- **Conversation rounds**: 2 turns per agent per round (configurable)
- **Max rounds**: 3 default (can reach 5)
- **Thinking modes**: off, minimal, low, medium, high (impacts latency)
- **Early termination**: Judge can decide compatibility in round 1-2

## Extension Points

1. **New evaluation criteria**: Modify grader/judge prompts
2. **Scoring algorithms**: Change score thresholds in judge evaluation
3. **Custom agent behaviors**: Add files in `writeAgentProfileFiles()`
4. **Persistence**: Add database calls in `CompatibilityService` methods

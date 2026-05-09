---
name: github-profile-scout
description: Use when a GitHub profile URL is available and you need to turn GitHub user and repository API responses into a concise, evidence-based developer profile summary in Spanish.
---

# GitHub Profile Scout

This skill standardizes how to interpret public GitHub profile data before it influences an agent profile.

## Inputs

- Parsed GitHub username
- `/users/:username` payload
- `/users/:username/repos?per_page=30&sort=updated` payload

## Workflow

1. Read the user payload first.
2. Read the most recent repositories and extract:
   - dominant languages
   - recurring topics
   - repo descriptions
   - consistency of activity and collaboration hints
3. Infer only what the data supports.
4. Keep the summary grounded and compact.

## Output Contract

Return valid JSON only:

```json
{
  "headline": "string",
  "summary": "string",
  "strengthSignals": ["string"],
  "interestSignals": ["string"],
  "collaborationSignals": ["string"],
  "languageBreakdown": [
    { "language": "string", "count": 0 }
  ],
  "topicBreakdown": [
    { "topic": "string", "count": 0 }
  ]
}
```

## Rules

- `headline`: one sentence.
- `summary`: 3-5 sentences max.
- Prefer concrete evidence over personality clichés.
- If the profile is sparse, say so explicitly.
- Do not output markdown.

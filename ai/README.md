# AI Module

> **Status:** Not implemented. Placeholder structure only.

AI integration layer for roadmap generation, weekly reports, and final summaries.

Every AI feature uses a **two-stage architecture**: Prompt Builder (Stage 1) then AI Generation (Stage 2).

## Architecture

```
Mentor Input
     ↓
Django Collects Data
     ↓
AI Prompt Builder          (Stage 1)
     ↓
Generated Prompt
     ↓
OpenAI LLM API             (Stage 2 — via generators/)
     ↓
Structured JSON
     ↓
Validation                 (validators/)
     ↓
Draft
     ↓
Mentor Review & Approval
```

## Structure

```
ai/
├── prompt_builder/     # Stage 1 — build optimized prompts from structured context
├── prompts/            # Base templates used by Prompt Builder (not sent directly to LLM)
├── generators/         # Stage 2 — send prompt to OpenAI, receive JSON response
├── validators/         # Validate LLM output against output schemas
├── schemas/            # Output JSON schemas for validation
└── reference-materials/  # Reference material context handling (not implemented)
```

## Stage 1 — AI Prompt Builder

Builds a complete structured context from database data and returns **one optimized prompt**.

- Clear, structured, includes all relevant context
- Follows business rules; respects roadmap scope
- Includes reference materials where applicable
- Never invents requirements or unapproved features

## Stage 2 — AI Generation

Sends the generated prompt to the OpenAI LLM API. Response must match the predefined output schema. Validated output is stored as **Draft** for Mentor review.

## Rules

- Called only from Django backend
- Prompt templates are **not** sent directly to the LLM
- OpenAI API key never exposed to frontend
- Invalid JSON: retry once; timeout (60s): manual retry only

## Documentation

- [../docs/ai-features.md](../docs/ai-features.md)
- [../docs/ai-integration-flow.md](../docs/ai-integration-flow.md)

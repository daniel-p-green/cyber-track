# Architecture

CyberTrack has two surfaces:

1. Cursor workspace missions.
2. Web arena and leaderboard.

## Cursor Workspace

The workspace should contain mission notebooks, prompts, fixtures, synthetic logs, and validation helpers. Players use Cursor as their cockpit and local Gemma as their constrained AI assistant.

Preferred mission formats:

- Marimo notebooks for guided interactive missions.
- Python scripts for validation and submission packaging.
- JSON fixtures for deterministic scoring.
- Markdown briefings for mission flavor and objectives.

## Local Model Adapter

Support the fastest working local path first:

- Ollama local endpoint.
- LM Studio OpenAI-compatible endpoint.
- Mock mode only for demo fallback and tests.

The adapter should expose:

- model discovery,
- model selection,
- health check,
- prompt call,
- metadata capture.

## Web Arena

The web arena should provide:

- callsign creation,
- optional GitHub profile link,
- disabled "Cursor identity coming soon" affordance if useful,
- mission board,
- active mission timer,
- submission form,
- leaderboard,
- promotion/rank progress,
- after-action review.

Vercel deployment is preferred if fast. Keep localhost working even if deployment is skipped.

## Scoring

Scoring should be deterministic where possible:

- correctness,
- elapsed time,
- hints used,
- validation checks passed,
- model used,
- submission quality fields,
- suspicious-time flag.

Do not store production answer keys in the public repo. For the demo, use clearly marked sample missions or generated seeds.

## Suspicious-Time Flagging

Flag runs that are unrealistically fast for a mission:

- below mission minimum time,
- impossible sequence of events,
- duplicate submission artifact,
- missing required telemetry,
- mismatched mission seed.

Suspicious runs should remain visible but marked for review.

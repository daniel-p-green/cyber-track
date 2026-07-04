# CyberTrack

**Call of Duty for AI Operators.**

CyberTrack is an offline AI operator readiness arena built around Cursor and local Gemma. Players complete tactical missions with a constrained on-device model, submit mission artifacts to a web arena, and receive scoring, rankings, promotion progress, and after-action review.

The premise: future technical operators will not always have cloud AI, internet access, or frontier-scale models. CyberTrack tests how well they can reason, prompt, debug, verify, and adapt with edge AI in degraded conditions.

## What It Is

- A game-like mission arena for AI operator proficiency.
- Cursor is the cockpit where players complete missions.
- Local Gemma is the field model used during missions.
- The web arena handles callsigns, mission selection, scoring, leaderboard, ranks, and after-action review.
- Missions are progressively harder: tutorial, sprints, relays, field events, marathons, and speed runs.

## What It Is Not

- Not a hiring screener or job application filter.
- Not a real offensive cyber range.
- Not a keylogger or surveillance tool.
- Not affiliated with Activision, Call of Duty, Google, Cursor, or any sponsor. "Call of Duty for AI Operators" is a pitch analogy; the product should use original branding, UI, missions, and assets.

## Season Zero Scope

For the hackathon demo, the hard floor is:

- Basic Qualification tutorial for callsign setup and Cursor/Gemma workflow.
- One short sprint mission with timer-based scoring.
- One more complex marathon-style mission or convincing stub if time is tight.
- Local Gemma integration through Ollama or LM Studio.
- Web arena with mission board, submission flow, leaderboard, ranks, and suspicious-time flags.
- Structured after-action report.
- Public-safe repo with no answer keys, secrets, or private hackathon planning docs.

## Repo Map

```text
.
├── AGENTS.md
├── challenges/
├── cybertf/
├── docs/
├── runs/
└── web/
```

See:

- [Hackathon Build Brief](docs/HACKATHON_BUILD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Mission Design](docs/MISSION_DESIGN.md)
- [Roadmap](docs/ROADMAP.md)

## Local Model Target

CyberTrack is designed for local Gemma inference first:

- Ollama: `OLLAMA_HOST=http://localhost:11434`
- LM Studio: OpenAI-compatible local server
- Optional model selection for different Gemma sizes

Copy `.env.example` to `.env` when implementation begins. Do not commit `.env`.

## Public Safety

This repo should stay demo-safe and open-source-safe:

- use synthetic defensive scenarios only,
- keep production answer keys server-side or seeded outside public source,
- never commit API keys or validation secrets,
- collect only explicit workspace-scoped telemetry,
- flag impossible speed-run times instead of rewarding them.

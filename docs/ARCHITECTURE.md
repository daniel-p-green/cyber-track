# CyberTrack Architecture

CyberTrack is a local-first mission league for AI operator readiness. It has two connected surfaces:

1. **Cursor mission workspace**: where operators complete missions using the `cybertf` CLI and a local Gemma4 model. Works fully offline.
2. **Web arena**: the competitive scoreboard wrapper: callsigns, mission board, submissions, leaderboards, ranks. Requires network only for leaderboard submission.

```
┌─────────────────────────────┐        ┌──────────────────────────┐
│  Cursor workspace (cockpit) │        │  Web arena (scoreboard)  │
│                             │        │                          │
│  cybertf CLI ──► Ollama     │  HTTP  │  Next.js app             │
│   run/ask/submit  gemma4    │ ─────► │  /api/operators          │
│   score/report   (local)    │ publish│  /api/submissions        │
│                             │        │  /api/leaderboard        │
│  runs/<run_id>/ artifacts   │        │  JSON store / seeds      │
└─────────────────────────────┘        └──────────────────────────┘
```

## Components

- `cybertf/`: Python package (stdlib only, no third-party dependencies).
  - `cli.py`: command dispatcher.
  - `missions.py`: mission loading and validation.
  - `runner.py`: run lifecycle, timers, run directories.
  - `gemma.py`: local Gemma4 client (Ollama HTTP API; optional OpenAI-compatible endpoint; clearly labeled simulation mode).
  - `telemetry.py`: opt-in, workspace-scoped JSONL event log.
  - `scoring.py`: deterministic check engine and dimension scoring.
  - `report.py`: after-action report (AAR) generator.
  - `season.py`: local season scorecard aggregation.
  - `arena.py`: publish submissions to the web arena.
  - `audio.py`: offline TTS briefings (macOS `say`), optional ElevenLabs.
- `challenges/`: mission packs (data-driven; see Mission Spec).
- `runs/`: run artifacts (gitignored).
- `web/`: Next.js web arena.

## Mission Spec

Each mission lives at `challenges/<mission_id>/`:

```
challenges/sprint_signal_lost/
  mission.json      # metadata, answer schema, deterministic checks
  brief.md          # operator-facing mission brief
  data/             # synthetic mission files (logs, configs, code)
  answer.example.json  # blank answer template the operator fills in
```

`mission.json`:

```json
{
  "id": "sprint_signal_lost",
  "season": "season-zero",
  "title": "Signal Lost",
  "event_type": "sprint",
  "difficulty": 2,
  "timebox_minutes": 10,
  "expected_seconds": { "min": 90, "max": 2400 },
  "xp_base": 300,
  "summary": "One-line mission board summary.",
  "skills": ["log triage", "model verification"],
  "answer_fields": [
    { "key": "root_cause", "type": "string", "prompt": "..." }
  ],
  "checks": [
    {
      "id": "root_cause",
      "type": "hash_match",
      "field": "root_cause",
      "normalize": "loose",
      "sha256": "…",
      "points": 25,
      "dimension": "mission_completion",
      "label": "Root cause identified"
    }
  ]
}
```

### Check types (deterministic)

| type | behavior |
|---|---|
| `hash_match` | SHA-256 of `cybertrack:<mission_id>:<check_id>:<normalized answer>` equals `sha256`. Keeps expected answers out of the repo in plaintext. |
| `hash_match_any` | Same, against a list of acceptable hashes. |
| `field_equals` | Exact match for non-secret fields (booleans, enums). |
| `field_regex` | Regex over an answer field (structure checks, not answers). |
| `evidence_includes` | The `evidence` list cites a required file path. |
| `file_contains` / `file_excludes` | A workspace file contains/lacks a string (patch checks). |
| `tests_pass` | Runs a pytest/unittest file inside the mission `data/` dir. |
| `ask_used` | Telemetry shows ≥ N local-model asks during the run. |
| `elapsed_within` | Elapsed time within mission timebox. |

### Answer-key policy

- No plaintext production answer keys, flags, or validation secrets are committed.
- Demo/local validation uses salted SHA-256 hashes of normalized expected answers. This is grep-proof but brute-forceable for tiny answer spaces; it is the clearly labeled **demo validation tier**. Production seasons would move expected values server-side (documented in ROADMAP).
- Structural checks (`tests_pass`, `file_contains`, `evidence_includes`) don't embed answers at all.

## Run lifecycle

```
cybertf run <mission_id>       # creates runs/<run_id>/, starts timer, logs mission_start
cybertf ask "<question>"       # calls local Gemma4, logs prompt/response to telemetry
cybertf submit <answer.json>   # stops timer, copies answer, scores run, writes score.json
cybertf report <run_id>        # writes aar.md
cybertf publish <run_id>       # POSTs submission artifact to the arena
```

`runs/<run_id>/` contains:

- `run.json`: mission_id, callsign, started_at, status, model info.
- `telemetry.jsonl`: opt-in event log (see docs/TELEMETRY.md).
- `answer.json`: operator-submitted answers.
- `score.json`: deterministic score (schema below).
- `aar.md`: after-action report.

## Score schema (`score.json`)

```json
{
  "run_id": "20260704-153000-nightowl",
  "mission_id": "sprint_signal_lost",
  "callsign": "nightowl",
  "submitted_at": "2026-07-04T15:36:12Z",
  "elapsed_seconds": 372,
  "total": 87,
  "max_total": 100,
  "dimensions": {
    "mission_completion": {"points": 40, "max": 45},
    "evidence_discipline": {"points": 10, "max": 15},
    "tool_reliability": {"points": 5, "max": 5},
    "prompt_discipline": {"points": 5, "max": 5},
    "recovery_from_bad_ai_guidance": {"points": 10, "max": 10},
    "terminal_recovery": {"points": 0, "max": 0},
    "hallucination_resistance": {"points": 7, "max": 10},
    "time_to_signal": {"points": 5, "max": 5},
    "communication_quality": {"points": 5, "max": 5},
    "local_offline_compliance": {"points": 0, "max": 0}
  },
  "checks": [ {"id": "...", "passed": true, "points": 25, "label": "..."} ],
  "flags": {"suspicious_fast": false, "missing_telemetry": false},
  "local_model": {"provider": "ollama", "model": "gemma4:latest", "simulated": false},
  "xp_awarded": 261
}
```

- `xp_awarded = round(total / max_total * xp_base * difficulty_multiplier)` where multiplier = 1 + (difficulty - 1) * 0.25.
- `suspicious_fast` is true when `elapsed_seconds < expected_seconds.min`: the leaderboard shows the run as **UNVERIFIED · SUSPICIOUS TIME** instead of celebrating it.

## Web arena API (Next.js route handlers)

Base URL: `ARENA_URL` (default `http://localhost:3000`).

| Route | Method | Body / query | Returns |
|---|---|---|---|
| `/api/missions` | GET |: | mission board manifest |
| `/api/operators` | POST | `{callsign, github_url?}` | `{operator}` (creates or loads) |
| `/api/operators/[callsign]` | GET |: | profile: xp, rank, history |
| `/api/submissions` | POST | submission artifact (below) | `{accepted, rank, promoted, new_rank?, leaderboard_position, flags}` |
| `/api/leaderboard` | GET | `?scope=global\|mission\|season&mission_id=` | ordered entries |

Submission artifact (what `cybertf publish` sends: exactly `score.json` plus):

```json
{
  "schema": "cybertrack.submission.v1",
  "season": "season-zero",
  "telemetry_digest": "sha256:…",
  "ask_count": 4
}
```

Server-side acceptance rules:

- callsign must exist (auto-create allowed),
- mission_id must be in the manifest,
- recompute `suspicious_fast` server-side from the manifest's `expected_seconds`,
- flag `missing_telemetry` when `telemetry_digest` is absent,
- reject duplicate `run_id`,
- demo trust model: the deterministic score is computed locally and trusted in demo mode; production tier would recompute against server-held keys (documented honestly in the UI footer and README).

## Ranks

XP thresholds (original ladder, fictional, training-progression only):

| Rank | XP |
|---|---|
| Recruit | 0 |
| Operator | 250 |
| Specialist | 700 |
| Sentinel | 1400 |
| Warden | 2400 |
| Commander | 3800 |
| Field Marshal | 5600 |

Promotions are learning-progression feedback, never job-suitability signals.

## Storage (web arena)

Pluggable store module:

- **Local/dev**: JSON file at `web/.data/store.json` (gitignored). Survives restarts, perfect for the localhost demo.
- **Vercel**: in-memory store initialized from seeded demo entries (marked `seeded: true` and rendered with a "demo seed" tag). Live submissions persist for the lifetime of the serverless instance; durable Postgres persistence is a documented roadmap tier.

## Local Gemma4 integration

- Provider auto-detect: query `GET http://localhost:11434/api/tags`, pick the first `gemma4*` model (override with `CYBERTF_MODEL`).
- Chat via `POST /api/chat` (Ollama). Optional OpenAI-compatible endpoint via `CYBERTF_OPENAI_BASE` (e.g., LM Studio).
- `cybertf verify-model` proves the local path: lists detected Gemma4 models, sends a canary prompt, reports latency, and confirms the endpoint is localhost.
- **Simulation mode** (`CYBERTF_SIM=1`): canned responses for dev/tests only. Every simulated response is prefixed with `[SIMULATION: NOT A REAL MODEL RESPONSE]`, and `score.json.local_model.simulated` is set to `true`, which zeroes the `local_offline_compliance` dimension.

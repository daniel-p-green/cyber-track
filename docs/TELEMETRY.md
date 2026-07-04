# Exercise Telemetry

CyberTrack records a **consented decision trace** so the after-action report
can show *how* you worked, not just whether you finished. This document is
the complete inventory of what is and is not captured.

## Consent

- Telemetry consent is set when you enlist and printed to the terminal at
  that moment.
- Opt out entirely: `cybertf enlist <CALLSIGN> --no-telemetry`, or per-run
  with `cybertf run <mission> --no-telemetry`.
- With telemetry off, missions still run and score; checks that need the
  decision trace (like "consulted the field AI") simply score zero.

## What is captured (workspace-scoped, only during an active run)

| Event | Contents |
|---|---|
| `mission_start` | mission id, callsign, local model info, timestamp |
| `ask` | your prompt, the evidence files you attached, the field AI's response, model name, latency |
| `submission` | mission id, elapsed seconds |
| `score` | totals and XP awarded |

Everything is written to `runs/<run_id>/telemetry.jsonl` — a plain-text file
inside your workspace that you can open, read, and delete. A SHA-256 digest
of that file travels with arena submissions as tamper evidence.

## What is never captured

- Keystrokes or mouse activity (no OS-level logging of any kind)
- Screen contents, browser history, clipboard
- Files outside this repository workspace
- Secrets, credentials, environment variables
- Anything while no mission run is active

## Where it goes

Nowhere, by default. Telemetry lives in your local `runs/` folder
(gitignored). If you choose to `cybertf publish` a run, only the **score
artifact** (scores, dimensions, flags, elapsed time, model info, telemetry
digest, ask count) is sent to the arena — the raw telemetry log itself,
including your prompts and the model's responses, stays on your machine.

The goal is a replayable assessment, not surveillance.

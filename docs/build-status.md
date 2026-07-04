# Build Status

Last updated: 2026-07-04 ~14:35 CDT

## Current state

- Engine spine (`cybertf/`) built and committed: CLI, mission loader, run
  lifecycle, local Gemma4 client (Ollama), telemetry, deterministic scorer,
  AAR generator, season scorecard, arena client, offline audio helper.
- Missions live: `basic_qualification`, `sprint_signal_lost` — both verified
  end-to-end against **real local Gemma4** (`gemma4:latest` 8B via Ollama).
- Remaining 4 Season Zero missions and the web arena are being built in
  parallel; not yet verified.

## Commands verified working (real outputs, this machine)

- `python3 -m cybertf.cli verify-model` → detected `gemma4:latest`, canary
  "FIELD AI ONLINE", local endpoint confirmed.
- `enlist NIGHTOWL` → profile created, telemetry consent printed.
- `run basic_qualification` → run dir + timer + answer template.
- `ask ... --file relay_roster.txt` → real Gemma4 response, logged to telemetry.
- `submit basic_qualification ...` → **95/95**, +200 XP, AAR written with
  Gemma-narrated debrief.
- `run/ask/submit sprint_signal_lost` → 95/100 after normalize fix;
  fast test run correctly flagged **UNVERIFIED · SUSPICIOUS TIME**, 0 XP.
- `season` → scorecard with standings + flagged run.
- `python3 -m compileall cybertf` → clean.

## Known failures / risks

- Web arena (subagent) and 4 mission packs (subagent) unverified until
  integration.
- `cybertf publish` untested until the arena API exists.
- Vercel deployment not attempted yet.

## Next highest-impact fix

Integrate web arena when subagent completes: publish a run, verify
leaderboard + suspicious flag rendering, then commit web/.

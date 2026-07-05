# Build Status

Last updated: 2026-07-05 02:54 CDT

## Current State: Local Demo Candidate Green, Commit Pending

CyberTrack is now treated as a local-first demo. The README, demo script, web
docs, architecture notes, and build disclosure all point to the same local
run path. The expected demo path is:

1. Run Ollama and local Gemma.
2. Run the CyberTrack CLI from the repo.
3. Run the Next.js arena at `http://localhost:3000`.
4. Publish scored runs to the local arena.

Do not call this final until the current local changes are committed and pushed
to the public repo.

## Git Truth

- Repository: `cyber-track`
- Branch: `main`
- Last committed HEAD: `64541f6 Season One rename, populated leaderboard, voice briefings, demo-flow homepage`
- Local workspace: dirty
- Tracked modified files: 63
- Untracked files: 18
- `git status --porcelain` entries: 73

Intentional untracked product files pending final commit:

- `assets/cybertrack-readme-banner.svg`
- `assets/cybertrack-wordmark.svg`
- `notebooks/cursor_local_model_gateway.py`
- `requirements.txt`
- `scripts/generate_briefings.py`
- `web/app/api/briefing-audio/route.ts`
- `web/app/api/local-ai-status/route.ts`
- `web/app/components/LocalRuntimeStatus.tsx`
- `web/lib/briefing-audio.ts`
- `web/public/audio/briefings/*.mp3`
- `web/public/icons/ollama*.svg`

Generated clutter cleanup:

- `.DS_Store` files removed.
- `__pycache__` directories removed.
- `cybertf.egg-info/` removed and `*.egg-info/` added to `.gitignore`.

## Verification Run

### Python Requirements

```bash
python3 -m venv /tmp/cybertf-venv...
source /tmp/cybertf-venv.../.venv/bin/activate
pip install -r requirements.txt
cybertf list
```

Result: pass. `requirements.txt` installs the local `cybertf` package in
editable mode. The engine still has no third-party Python runtime dependencies.

### Python / Engine

```bash
python3 -m compileall -q cybertf
python3 -m unittest discover -s tests -q
```

Result: pass. `unittest` ran 9 tests.

### Mission Loader And Season Slug

```bash
python3 -m cybertf.cli list
python3 -m cybertf.cli season
```

Result: pass.

- The CLI lists all 6 Season One missions.
- `cybertf season` writes `runs/season-one-scorecard.md`.
- Legacy season slug references were removed from tracked code/docs, excluding
  old ignored run artifacts if they exist locally.

### Local Gemma / Ollama

```bash
python3 -m cybertf.cli verify-model
```

Previous audit result: pass.

- Endpoint: `http://localhost:11434`
- Selected model: `gemma4:latest`
- Canary response: `FIELD AI ONLINE`

The local arena status endpoint also reports Ollama connected with
`gemma4:latest` installed.

### Web Lint

```bash
cd web
npm run lint
```

Result: pass.

### Web Production Build

An active local `next dev` process is holding `web/.next/dev/lock`, so the
production build was verified in a temp copy with copied `node_modules`.

```bash
npm run build
```

Result: pass.

Next.js built 15 app routes:

- `/`
- `/_not-found`
- `/api/briefing-audio`
- `/api/leaderboard`
- `/api/local-ai-status`
- `/api/missions`
- `/api/operators`
- `/api/operators/[callsign]`
- `/api/submissions`
- `/leaderboard`
- `/missions`
- `/missions/[id]`
- `/operators/[callsign]`
- `/qualification`
- `/runs/[runId]`

## Local Runtime Checks

The running local dev server at `http://127.0.0.1:3000` serves the current
candidate:

- `/` returns 200
- `/qualification` returns 200
- `/missions` returns 200
- `/missions/sprint_signal_lost` returns 200
- `/leaderboard` returns 200
- `/api/missions` returns 200
- `/api/leaderboard` returns 200
- `/api/local-ai-status` returns 200
- `/api/briefing-audio?id=sprint_signal_lost&text=test` returns 200 audio/mpeg
- `/audio/briefings/hero.mp3` returns 200 audio/mpeg

## Copy / Product Cleanup

- Canonical tagline is now: **Call of Duty for AI Operations Readiness**.
- README now frames the problem as defense, emergency, and
  critical-infrastructure readiness without turning the product into a hiring
  or recruiting screen.
- Hosted deployment is no longer documented as the demo path.
- Local arena storage is the only documented web storage path:
  `web/.data/store.json`.
- The development-only model fallback was removed from public setup guidance.
  It remains internally labeled in artifacts if ever used.

## Local Run Artifacts

Current local operator state:

- Callsign: `NIGHTOWL`
- Rank: Operator
- XP: 575
- Runs present under `runs/`: 6

Current local scorecard output:

- Verified runs:
  - `basic_qualification`: 95/95 in 3:28
  - `sprint_signal_lost`: 100/100 in 2:37
- Suspicious-time runs:
  - `basic_qualification`: 90/95 in 0:22
  - `field_patch_edge_agent`: 70/100 in 0:16
  - `sprint_signal_lost`: 95/100 in 0:58
  - `sprint_signal_lost`: 95/100 in 1:37

## Current Risks / Boundaries

- Local workspace is dirty and not yet pushed.
- Public-repo answer validation remains demo-tier and inspectable.
- Seeded local arena rows still exist and should be understood as demo data.
- Current local artifacts prove verified end-to-end runs for Basic
  Qualification and Signal Lost.
- The web arena is local-first. It is not a hosted production service.

## Readiness Call

Local demo candidate: **GREEN after tests, lint, build, requirements install,
and local route checks.**

Commit/push status: **PENDING** by request.

Recommended next steps:

1. Review the dirty diff and decide what should ship.
2. Commit the current local candidate.
3. Push to GitHub.
4. Record the 60-second demo against the local app and local Gemma.

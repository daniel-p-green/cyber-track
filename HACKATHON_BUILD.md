# Hackathon Build Disclosure

Project: **CyberTrack** — Call of Duty for AI Operations Readiness. Players
verify local AI guidance under pressure in Cursor. RAISE Summit Hackathon 2026,
Google DeepMind Remote track (Edge / On-Device: app running Gemma locally for
offline, privacy-first inference).

Everything in this repository was designed and built during the hackathon on
**July 4, 2026** (see git history: the repo began the same day as an empty
scaffold). This file draws the exact boundary between hackathon-built work,
reused dependencies, and roadmap.

## Built during the hackathon

- `cybertf/`: the entire mission league engine: CLI, mission loader, run
  lifecycle and timers, local Gemma4 client (Ollama + OpenAI-compatible
  endpoints), opt-in telemetry, deterministic scorer, after-action report
  generator, local season scorecard, arena publishing client, offline TTS
  helper.
- `challenges/`: all six Season One missions and every byte of their
  synthetic fixture data (logs, configs, rosters, notes, code, tests).
- `web/`: the web arena: Next.js app, mission board, callsign/profile flow,
  submissions API, leaderboards, rank/promotion system, suspicious-time
  flagging, seeded demo data.
- All documentation: `README.md`, `DESIGN.md`, `docs/`.

## Reused (declared dependencies and tools)

- **Gemma4** (`gemma4:latest`, 8B QAT via Ollama): the sponsor model,
  running locally. We built the integration, not the model.
- **Ollama**: local model runtime.
- **Python 3 standard library**: the engine has zero third-party Python
  dependencies by design (edge machines can't `pip install`).
- **Next.js / React / Node**: web arena framework, scaffolded with
  `create-next-app` during the event.
- **macOS `say` / `afplay`**: optional offline audio cues.
- AI coding assistants (Cursor with Claude-family models) were used as
  build accelerators for this codebase, the same way any team member would
  be. The **player-facing model in the product is exclusively local
  Gemma model**. No cloud model appears anywhere in mission play.

## Synthetic data disclosure

Every scenario, log line, config, sitrep, roster, and "archived model
advisory" in `challenges/` is fictional, synthetic, defensive-only training
data authored during the event. The HALCYON grid does not exist. No real
network data, no real incidents, no offensive content.

## Honest demo boundaries

- **Validation tier:** expected answers are salted SHA-256 hashes so no
  plaintext answer keys live in this public repo. Small answer spaces could
  be brute-forced; production seasons would hold validation server-side.
  This is disclosed in the README and docs.
- **Arena trust model:** in demo mode the deterministic score is computed
  locally and the arena trusts the artifact (it re-checks time-based flags
  server-side and rejects duplicates). Server-side re-validation is roadmap.
- **Development fallback:** automated tests can run without a local model, but
  that fallback is not part of setup, demo footage, or scored mission play.
  All demo footage uses the real local Gemma4 path.
- **Seeded leaderboard rows** in the web arena are marked `seeded` and
  rendered with a "demo seed" tag so real submissions are distinguishable.

## Roadmap (not built, not claimed)

Server-held answer keys and seeded per-player mission instances, durable
arena database, real-time squad relays via Cursor collaboration, additional
season/DLC mission packs, richer AAR replay timeline. See
`docs/ROADMAP.md`.

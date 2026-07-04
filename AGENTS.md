# AGENTS.md

These instructions apply inside the CyberTrack public repo.

## Product Direction

CyberTrack is an offline AI operator readiness arena. Cursor is the player cockpit. Local Gemma is the field model. The web arena handles callsigns, mission selection, submissions, scoring, ranks, leaderboards, and after-action review.

Build the usable experience first. Avoid turning this into a dashboard, brochure site, generic cyber range, or job screener.

## Public Repo Boundary

- Keep private planning notes, hackathon rules, deadlines, and strategy docs outside this repo unless creating a sanitized public derivative.
- Do not commit API keys, local secrets, answer keys, hidden salts, production flags, private leaderboard secrets, raw telemetry, or personal machine paths.
- Do not copy protected Call of Duty, Activision, Cursor, Google, or sponsor assets, UI, logos, maps, names, trade dress, or branding.

## Safety

- Use synthetic defensive scenarios only.
- Do not include real malware, live-target instructions, credential theft flows, or actionable exploit payloads.
- Do not build OS-level keylogging or mouse logging.
- If telemetry is implemented, keep it explicit, consented, workspace-scoped, and limited to command events, file diffs, timestamps, submissions, and model metadata.

## Build Priorities

1. Basic Qualification tutorial.
2. Local Gemma proof through Ollama or LM Studio.
3. One sprint mission with timer and deterministic scoring.
4. Web arena: callsign, mission board, submission form, leaderboard, ranks, suspicious-time flag.
5. After-action report.
6. Demo reliability.

Cut optional audio, multiplayer, deployment polish, and visual flourishes before cutting local Gemma proof, scoring, or the demo path.

## Engineering Defaults

- Prefer simple, maintainable code.
- Keep APIs small and explicit.
- Use deterministic validation where possible.
- Make scoring explainable.
- Keep generated mission content public-safe.
- Verify the local path before claiming it works.

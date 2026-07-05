# CyberTrack

The next generation of operators will not be judged by whether they can get
an AI answer. They will be judged by whether they can verify it under
pressure.

CyberTrack is a tactical mission arena where players solve high-pressure
technical incidents inside Cursor using only local Gemma4.

Each mission simulates the conditions operators face when cloud AI is
unavailable, untrusted, or inappropriate: incomplete evidence, time
pressure, imperfect model guidance, and the need to make a defensible call.

Players are scored on the human-AI skills that matter under uncertainty:
evidence discipline, model skepticism, recovery from bad guidance, decision
quality, and local/offline compliance.

After each mission, CyberTrack generates an after-action report showing where
the operator's reasoning held up and where it broke.

The prototype includes Gemma4-powered missions running locally via Ollama,
deterministic scoring, after-action reports, Season One progression,
XP/ranks, a mission map, and a public arena leaderboard.

**Cursor is the interface. Gemma4 is the local edge AI. CyberTrack scores
what matters when the cloud goes dark and the stakes are high.**

> RAISE Summit Hackathon 2026 · Google DeepMind Remote track
> (Edge / On-Device: best app running Gemma locally for offline,
> privacy-first inference). Built during the event. See
> [HACKATHON_BUILD.md](HACKATHON_BUILD.md).

## Why local Gemma

Real incidents do not always get cloud AI: connectivity fails, data is too
sensitive, latency matters, frontier models are unavailable or untrusted.
CyberTrack uses Gemma4 running locally (Ollama) because it is the exact
constraint operators face at the edge. The training is learning to question,
verify, and recover from a constrained model instead of blindly trusting it.

The entire mission loop (briefing, field-AI queries, scoring, after-action
report) runs offline. The only network feature is the optional web arena
leaderboard.

## The two surfaces

1. **Cursor is the cockpit.** Missions are solved in a Cursor workspace:
   read the brief, inspect synthetic evidence, patch configs and code,
   interrogate the local field AI with `cybertf ask`.
2. **The web arena is the scoreboard** (`web/`): callsigns, mission board,
   live leaderboards, ranks, Season One framing. A wrapper around the
   cockpit, never a replacement for it.

## Quickstart (the whole loop in ~5 minutes)

Requirements: Python 3.10+, [Ollama](https://ollama.com) with a Gemma model
(`ollama pull gemma4`), and this repo opened in Cursor.

```bash
# 0. From the repo root. Everything runs as a module, no install needed
python3 -m cybertf.cli verify-model        # prove local Gemma4 is serving
python3 -m cybertf.cli enlist NIGHTOWL     # pick your callsign
python3 -m cybertf.cli list                # Season One mission board

# 1. Fly Basic Qualification
python3 -m cybertf.cli run basic_qualification
python3 -m cybertf.cli brief basic_qualification
python3 -m cybertf.cli ask "How do I verify a claim about relay coverage?" \
  --file challenges/basic_qualification/data/relay_roster.txt
# ...inspect evidence in Cursor, fill in runs/<run_id>/answer.json...
python3 -m cybertf.cli submit basic_qualification runs/<run_id>/answer.json

# 2. Read your after-action report
cat runs/<run_id>/aar.md

# 3. Local season scorecard (offline leaderboard)
python3 -m cybertf.cli season

# 4. Optional: publish to the web arena leaderboard
cd web && npm install && npm run dev &     # http://localhost:3000
# Production arena (ephemeral demo store, see web/README.md):
# export CYBERTF_ARENA_URL=https://cybertrack-arena.vercel.app
python3 -m cybertf.cli publish <run_id>
```

Prefer an installed entry point? `pip install -e .` gives you the `cybertf`
command; the commands above then drop the `python3 -m` prefix.

## Season One events

| Mission | Type | What it trains |
|---|---|---|
| Basic Qualification | Tutorial | Cockpit basics, local-model verification, catching a bad AI claim |
| Signal Lost | Sprint | Log triage, root-cause evidence vs. tempting false lead |
| Prompt Under Fire | Field | Critiquing AI plans, spotting hallucinated tools and unsafe steps |
| Patch the Edge Agent | Field | Minimal bug fixes under constraint, test-driven recovery |
| Relay: Human + Gemma Handoff | Relay | Writing handoffs a constrained model can actually execute |
| Marathon: Degraded Comms | Marathon | Multi-source evidence reconciliation, rejecting confident bad AI advice |

Missions are data-driven packs under `challenges/`. See
[docs/MISSION_DESIGN.md](docs/MISSION_DESIGN.md) for how new season/DLC packs
are authored.

## Scoring

Deterministic and reproducible from run artifacts alone. No model in the
grading loop. Ten readiness dimensions: mission completion, evidence
discipline, tool reliability, prompt discipline, recovery from bad AI
guidance, terminal recovery, hallucination resistance, time-to-signal,
communication quality, and local/offline compliance. Speed counts, but
impossibly fast runs get flagged **UNVERIFIED · SUSPICIOUS TIME** and earn
no XP.

Expected answers are stored as salted SHA-256 hashes, so this public repo
contains no plaintext answer keys. That is the honest demo validation tier;
production seasons move validation fully server-side
([docs/ROADMAP.md](docs/ROADMAP.md)).

## Telemetry, honestly

Opt-in, transparent, and scoped to this workspace only: mission timestamps,
`cybertf ask` prompts/responses, submissions, and scores, written to a
plain JSONL file in your run folder that you can read. No keystrokes, no
mouse tracking, no browser history, nothing outside the workspace. Details
in [docs/TELEMETRY.md](docs/TELEMETRY.md).

## What CyberTrack is not

Training and readiness feedback only. Not hiring, recruiting, screening, or
job-suitability scoring. All scenarios are synthetic and defensive. No live
targets, no offensive content. The web arena is a scoreboard, not the
product.

## Repo map

```
cybertf/       mission engine: CLI, Gemma4 client, scoring, AAR, telemetry
challenges/    Season One mission packs (synthetic data)
web/           web arena: mission board + leaderboard (Next.js)
runs/          your run artifacts (gitignored)
docs/          architecture, telemetry, mission design, roadmap
DESIGN.md      product design bible
HACKATHON_BUILD.md   what was built during the hackathon, exactly
```

## License

MIT. See [LICENSE](LICENSE).

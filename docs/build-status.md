# Build Status

Last updated: 2026-07-04 ~19:00 CDT

## Current state: **demo-ready** (post product-truth correction pass)

Final page-by-page UX/product-truth pass complete: the web arena now tells the
true story: Cursor (editor + Cursor Chat + in-app browser) is the cockpit
where mission work happens; the web arena selects missions, tracks progress,
takes submissions, and shows AAR/leaderboard; the `cybertf` CLI is presented
as support scaffolding (timing/scoring/publishing), not the player skill.
Home hero replaced fake terminal theater with a Cursor cockpit preview
(evidence files, answer.json editor, Cursor Chat verify-the-model exchange,
arena in the in-app browser). Mission detail leads with the 6-step Cursor
mission loop; commands demoted. Demo seed tags no longer read as part of
callsigns; profile/footer social links are labeled and accessible; nav
"Deploy" renamed "Setup"; mobile header no longer overlaps at 390px.
Earlier this session: command-deck hero art added and a CSS-modules
scoped-keyframes bug fixed (cockpit feed rendered invisible in prod).
`npm run lint`, `npm run build`, 9/9 Python tests clean; redeployed to
https://cybertrack-arena.vercel.app and pushed to GitHub.

CyberTrack Season Zero spine is working end-to-end on this machine.

### Engine (`cybertf/`)

- CLI: enlist, list, brief, run, ask, submit, score, report, publish, season, verify-model, status
- Local Gemma4 via Ollama (`gemma4:latest` 8B): verified live, not simulated
- Deterministic scorer (10 dimensions), suspicious-time flagging, XP/rank ladder
- Opt-in workspace-scoped telemetry (`docs/TELEMETRY.md`)
- AAR generator with Gemma-narrated debrief
- Local season scorecard (`runs/season-zero-scorecard.md`)
- `.cursor/rules/cybertrack-operator.mdc`: Cursor cockpit guidance

### Missions (6/6)

| Mission | E2E verified | Notes |
|---|---|---|
| basic_qualification | Yes | 95/95, real Gemma asks |
| sprint_signal_lost | Yes | 100/100 legitimate run + suspicious flag on fast runs |
| field_patch_edge_agent | Yes | 95/100 re-score with tests_pass; bug left in repo for players |
| field_prompt_under_fire | Runnable | brief + checks load; not flown this session |
| relay_gemma_handoff | Runnable | brief + checks load; not flown this session |
| marathon_degraded_comms | Runnable | brief + checks load; not flown this session |

### Web arena (`web/`)

- Next.js app builds cleanly (`npm run build`)
- Local dev: http://localhost:3000: leaderboard, enlist, missions, qualification
- **Production:** https://cybertrack-arena.vercel.app
- Publish pipeline verified locally and to Vercel (`cybertf publish` with `CYBERTF_ARENA_URL`)
- Vercel store is **in-memory (ephemeral)**: real submissions may reset on cold start; local `cybertf season` is the durable offline scoreboard. Disclosed in `web/README.md` and `HACKATHON_BUILD.md`.

### Tests

```bash
python3 -m compileall cybertf          # clean
python3 -m unittest discover -s tests -q   # 8+ tests OK
```

## Commands verified working (this machine)

```bash
python3 -m cybertf.cli verify-model
python3 -m cybertf.cli enlist NIGHTOWL
python3 -m cybertf.cli list
python3 -m cybertf.cli run basic_qualification
python3 -m cybertf.cli ask "..." --file challenges/basic_qualification/data/relay_roster.txt
python3 -m cybertf.cli submit basic_qualification runs/<run_id>/answer.json
python3 -m cybertf.cli run sprint_signal_lost && ... submit ...
python3 -m cybertf.cli run field_patch_edge_agent && ... submit/score ...
python3 -m cybertf.cli season
CYBERTF_ARENA_URL=http://localhost:3000 python3 -m cybertf.cli publish <run_id>
CYBERTF_ARENA_URL=https://cybertrack-arena.vercel.app python3 -m cybertf.cli publish <run_id>
cd web && npm run build
curl https://cybertrack-arena.vercel.app/api/missions
```

## Known risks / honest boundaries

- Vercel leaderboard is demo-tier ephemeral storage, not durable DB.
- Arena trusts client-submitted scores (re-validation is roadmap).
- Answer validation uses salted SHA-256 hashes in public repo (demo tier).
- 3 missions not flown E2E this session: all load and have full fixture packs.

## Demo readiness: **GO**

Recommended demo path: Cursor repo → `verify-model` → `run sprint_signal_lost` → real `ask` → patch config → `submit` → `aar.md` → `publish` → web leaderboard with suspicious flag row visible.

## Next highest-impact (if time remains)

1. Record demo video using `demo-video/frame.md`.
2. Fly `marathon_degraded_comms` once for hardest-mission proof.
3. Pre-publish one clean run to Vercel immediately before judging.

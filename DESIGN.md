# CyberTrack Design Bible

**CyberTrack — Call of Duty for AI Operators.**
Offline AI operator readiness in Cursor, powered by local Gemma4.

This document is the design source of truth for the product, the web arena, mission copy, and the demo.

## Strategic Narrative

Critical infrastructure, cyber defense, emergency operations, and national resilience are moving toward human-AI teaming. But real missions do not always get cloud AI: connectivity fails, data is too sensitive, latency matters, frontier models are unavailable or untrusted. Nobody trains people for that.

CyberTrack is a mission league that looks like a game and works like a flight simulator for AI-era technical judgment. Operators complete timed missions inside Cursor with only a **local Gemma4 model** as their field AI, then get deterministically scored on evidence discipline, model skepticism, decision quality, and recovery under degraded conditions.

The next generation of operators will be judged less by whether they can use an AI tool, and more by whether they can question it, verify it, recover from its mistakes, and decide well when the cloud is gone. CyberTrack trains and measures that.

**"Call of Duty for AI Operators" is pitch shorthand only.** CyberTrack is an original property. Nothing in this product copies Call of Duty assets, UI, branding, maps, weapons, names, typography, or trade dress.

## What CyberTrack Is Not

Non-negotiable framing rules:

- Not hiring, recruiting, candidate screening, military selection, or job ranking. Scores are **training and readiness feedback**, never suitability decisions.
- Not a dashboard product. The web arena is a scoreboard and mission hub wrapped around Cursor mission execution.
- Not a CTF or cyber range clone. The subject being measured is the **human operating with constrained AI**, not the exploit.
- Not offensive security. All scenarios are synthetic and defensive. No live targets, malware, or exploit content.
- Not surveillance. Telemetry is opt-in, transparent, and scoped to the mission workspace only.

## Audience

Primary: high school and college students, early-career technical professionals, cyber clubs, STEM/ROTC-adjacent learners who are comfortable opening an editor and a terminal.

Broader: anyone who wants to prove they can work with AI under constraint — future high-stakes operators, critical infrastructure teams.

Design implication: copy must be readable by a smart 16-year-old and respectable to a working SOC engineer. Explain everything once, tersely, in-mission.

## The Two Surfaces

1. **Cursor is the cockpit.** Mission execution happens in a Cursor workspace: reading briefs, inspecting synthetic evidence, editing code, running `cybertf` commands, interrogating local Gemma4. We are not building an IDE; we are teaching people to fly the one they have.
2. **The web arena is the scoreboard.** Callsign, mission board, submissions, leaderboards, ranks, season framing. It makes the league feel alive. It never replaces the cockpit.

## Information Architecture (web arena)

- `/` — Operations home: season banner, enlist (callsign entry), mission board, live leaderboard strip, Gemma4 LOCAL/OFFLINE badge.
- `/missions` — Mission board: event cards grouped by type (Qualification, Sprint, Field, Relay, Marathon), difficulty pips, timebox, XP, skills tested.
- `/missions/[id]` — Mission briefing: summary, skills, cockpit instructions (exact `cybertf` commands), submission panel.
- `/leaderboard` — Scoreboard: global / per-mission / season scopes, elapsed-time column, suspicious-time flags, rank insignia.
- `/operators/[callsign]` — Service record: rank, XP, mission history, dimension strengths.
- `/qualification` — Basic Qualification onboarding page mirroring the tutorial mission.

Every page keeps the "solve it in Cursor" loop explicit: the arena issues missions and receives artifacts; it never hosts the work.

## Visual Direction

**Feel:** a dark, quiet, confident tactical operations center. MMORPG/esports command hub, not literal FPS. Cinematic restraint: the intensity comes from typography, spacing, and signal colors — not decoration.

### Color

| Token | Value | Use |
|---|---|---|
| `--bg` | `#07090c` | page background (near-black, blue-cold) |
| `--panel` | `#0e1319` | cards, panels |
| `--panel-2` | `#141c26` | raised elements, inputs |
| `--line` | `#1f2a38` | hairline borders |
| `--text` | `#e6edf4` | primary text |
| `--muted` | `#8fa1b3` | secondary text |
| `--signal` | `#3ddc97` | success, verified, Gemma-online (phosphor green) |
| `--amber` | `#ffb547` | timers, warnings, in-progress |
| `--alert` | `#ff5d5d` | failures, suspicious flags |
| `--ice` | `#5cc8ff` | links, interactive accents, rank accents |

Rule: one signal color per component. Never gradient-soup. Backgrounds may carry a faint scanline or topographic texture at ≤4% opacity — atmosphere, never noise.

### Type

- Display/headers: a compressed industrial sans (system stack fallback: `"Barlow Condensed", "Arial Narrow", sans-serif`), uppercase, tight tracking for mission names and section labels.
- Body: system UI sans.
- Data (callsigns, timers, scores, run IDs): monospace (`"JetBrains Mono", ui-monospace, monospace`).
- Timers and scores are the heroes: large mono numerals.

### Motion

- Fast and rare: 120–200ms ease-out on state changes.
- One permitted flourish: leaderboard rows may pulse `--signal` once on insert.
- A blinking block cursor may appear in headers as a terminal motif.
- No parallax, no continuous animation loops, no 3D.

### Components

- **Mission card:** event-type tag (SPRINT/FIELD/RELAY/MARATHON), title, difficulty pips (▮▮▯), timebox, XP, 1-line summary, status.
- **Leaderboard row:** position, rank insignia glyph, callsign (mono), score, elapsed time, mission, flags. Suspicious rows get an `--alert` "UNVERIFIED · SUSPICIOUS TIME" tag and muted styling — flagged, not celebrated.
- **Gemma badge:** persistent header pill: `● GEMMA4 · LOCAL · OFFLINE` in `--signal`.
- **Rank insignia:** original abstract chevron/delta glyphs built from unicode/SVG strokes. Nothing copied from real militaries or games.

## Mission Tone

Briefs are written like calm field dispatches: second person, present tense, short paragraphs, no jargon walls, no hoo-ah theatrics, no real-world adversaries or nations. Missions name fictional systems (Relay Station K4, HALCYON sensor grid). Every mission includes: situation, objective, constraints (local Gemma4 only), deliverable, and the exact commands to start.

Every mission teaches one honest lesson about operating with constrained AI — verify the model, catch the hallucination, recover from the bad hint, write the handoff. Red herrings are fair: discoverable from evidence in the workspace, never gotchas requiring outside knowledge.

## Ranks & Progression

Original ladder (fictional, training-progression feedback only):

Recruit → Operator → Specialist → Sentinel → Warden → Commander → Field Marshal

- Promotion = XP thresholds. XP = score quality × mission difficulty.
- Promotions are announced like unlocks ("PROMOTION CONFIRMED — SPECIALIST"), quick and satisfying, never gatekeeping.
- Speed matters but never beats correctness: time contributes ≤10% of mission score, and impossible times get flagged, not rewarded.

## Season Framing

Season Zero is the proving format: Qualification → Sprint → Field → Relay → Marathon. Future content ships as season/DLC-style mission packs (Degraded Comms, Drone Logistics, Critical Infrastructure, Disaster Response). Missions are data-driven so packs are additive.

## What To Avoid

- Call of Duty (or any game's) protected assets, names, UI, fonts, layouts, or trade dress.
- Real military insignia, unit names, real nations as adversaries, real classified/operational references.
- Hiring/screening/selection/ranking-people language anywhere.
- Dashboard-speak: "analytics", "KPIs", "insights", chart-first layouts.
- Overdecorated sci-fi: excessive glows, HUD clutter, fake 3D, lens flares.
- Claiming cloud AI features. The only player-facing model is local Gemma4. Simulation mode, when used for development, is always labeled.

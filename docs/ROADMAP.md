# CyberTrack Roadmap

Season Zero (this repo) proves the pattern: a data-driven mission league
engine, local Gemma4 as the only field AI, deterministic scoring, and a
competitive arena wrapper. Here is where it goes next.

## Validation & integrity

- **Server-held answer keys**: move expected values out of salted hashes
  into private arena storage; the client submits raw answers, the server
  scores authoritative checks.
- **Seeded mission instances**: each operator gets a per-run seed that
  parameterizes fixture data (timestamps, node IDs, values), making shared
  answers useless and enabling server-side recomputation.
- **Signed artifacts**: arena-issued run tokens + HMAC over score artifacts
  for tamper evidence beyond the current telemetry digest.
- Smarter anomaly flags: repeated identical submissions across callsigns,
  score artifacts predating mission start, telemetry/answer mismatches.

## League & multiplayer

- **Squads**: shared squad tags, squad leaderboards, squad seasons.
- **Live relay events**: two operators sharing one Cursor workspace via
  Cursor collaboration, with role-separated constraints and a team AAR.
- **Season progression**: placement events, divisions, end-of-season
  archives, promotion ceremonies.
- Durable arena persistence (Postgres) and operator auth (GitHub OAuth) —
  kept out of the hackathon build to stay lightweight and privacy-safe.

## Content: season & DLC mission packs

The mission spec is data-driven; new packs drop into `challenges/` without
engine changes. Planned packs:

- **Degraded Comms II** — multi-node partition reconciliation.
- **Drone Logistics** — routing under stale telemetry.
- **Critical Infrastructure** — water/power SCADA-inspired synthetic drills.
- **Disaster Response** — resource allocation with conflicting sitreps.
- **Field Intel** — document reconciliation with unreliable-source scoring.

All packs stay synthetic and defensive.

## Model & edge

- Multi-model loadouts: let operators pick among detected local Gemma sizes
  (1B/4B/12B/27B-class) with score normalization per loadout.
- Quantization-aware missions: events where the operator must reason about
  model capability limits explicitly.
- Fully air-gapped kit: single-machine arena + engine bundle for
  classrooms/labs with zero internet.

## Experience

- AAR replay timeline (step through the decision trace).
- Mission-briefing audio as a first-class offline feature.
- Instructor/coach view: compare two runs' decision traces side by side —
  as training feedback, never as hiring signal.

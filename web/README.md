# CyberTrack Web Arena

The competitive scoreboard wrapper around the Cursor mission cockpit:
callsign enlistment, mission board, submissions API, leaderboards
(global / season / per-mission), rank progression, and suspicious-time
flagging. Mission solving happens in Cursor with local Gemma4: never here.

## Run locally

```bash
npm install
npm run dev     # http://localhost:3000
```

The CLI publishes scored runs to it:

```bash
python3 -m cybertf.cli publish <run_id>    # from the repo root
```

## Storage

- **Local dev:** JSON file at `.data/store.json` (gitignored), seeded with
  clearly-tagged demo operators on first run. Delete the file to reset.
- **Vercel:** in-memory store seeded per instance (demo behavior: durable
  persistence is roadmap).

Seeded rows render with a `DEMO SEED` tag so real submissions are always
distinguishable.

## API

| Route | Method | Purpose |
|---|---|---|
| `/api/missions` | GET | mission board manifest |
| `/api/operators` | POST | create/load an operator by callsign |
| `/api/operators/[callsign]` | GET | service record |
| `/api/submissions` | POST | accept a scored run artifact (validates mission, rejects duplicate run IDs, recomputes suspicious-time flags server-side) |
| `/api/leaderboard` | GET | `?scope=global\|season\|mission&mission_id=…` |

No secrets, no answer keys, no auth: operator identity is a callsign.

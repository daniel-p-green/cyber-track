# CyberTrack Web Arena

The competitive scoreboard wrapper around the Cursor mission cockpit:
callsign claiming, mission board, submissions API, leaderboards
(global / season / per-mission), rank progression, and suspicious-time
flagging. Mission solving happens in Cursor with local Gemma4, never here.

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

The arena uses a local JSON file at `.data/store.json` (gitignored), seeded
with clearly tagged demo operators on first run. Delete the file to reset the
arena. The local scorecard remains authoritative.

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
| `/api/briefing-audio` | GET | serves committed MP3 briefings; optional OpenAI/local TTS fallback when a file is missing |
| `/api/local-ai-status` | GET | localhost Ollama status and detected Gemma model for local demo |

No secrets, no answer keys, no auth: operator identity is a callsign.

## Briefing audio

The arena plays static MP3 files from `public/audio/briefings/` during the
demo. Regenerate them only when briefing copy changes:

```bash
OPENAI_TTS_VOICE=onyx OPENAI_TTS_MODEL=tts-1-hd \
  python3 scripts/generate_briefings.py --backend openai --force
```

Playback does not need an API key when the MP3s are committed.

## Asset Credits

- Ollama icon SVGs from [Dashboard Icons](https://dashboardicons.com/icons/ollama),
  Apache-2.0 licensed by Homarr Labs and contributors.

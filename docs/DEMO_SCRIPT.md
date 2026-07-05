# CyberTrack: 60-Second Demo Script

**Track:** Google DeepMind Remote · Edge / on-device Gemma4
**Tagline:** Verify AI under pressure
**Arena:** https://cybertrack-arena.vercel.app

One complete loop, no feature tour. The beat that carries the product: local
Gemma confidently gives a wrong answer, the operator catches it against the
evidence, the deterministic score rewards the catch.

---

## Prep (before recording, not on the clock)

```bash
# Warm Ollama and Gemma4, claim a callsign
python3 -m cybertf.cli verify-model
python3 -m cybertf.cli enlist NIGHTOWL

# Arena target for publish
export CYBERTF_ARENA_URL=https://cybertrack-arena.vercel.app
```

Open in Cursor: repo root, terminal panel visible,
`challenges/sprint_signal_lost/brief.md` and
`challenges/sprint_signal_lost/data/config/uplink.conf` in tabs.
Pre-check audio: `say "check"` should be audible.

---

## The 10 beats

### Beat 1 · 0:00–0:04 · Cursor is the cockpit

**Show:** Cursor workspace with the mission repo: evidence files in the tree,
brief open, terminal ready.

**Say:** "This is CyberTrack. Missions are flown inside Cursor."

### Beat 2 · 0:04–0:09 · Prove local Gemma

**Run:**
```bash
python3 -m cybertf.cli verify-model
```

**Show:** `GEMMA4 · LOCAL · OFFLINE. Field AI ready.`

**Say:** "The only AI here is Gemma4, verified local and offline."

### Beat 3 · 0:09–0:13 · Launch the mission

**Run:**
```bash
python3 -m cybertf.cli run sprint_signal_lost
```

(Or click Start Mission on the arena board, then run the command it shows.)

**Say:** "Signal Lost. Ten minutes on the clock."

### Beat 4 · 0:13–0:24 · Voice briefing

**Run:**
```bash
python3 -m cybertf.cli brief sprint_signal_lost --voice
```

**Show:** brief text on screen while the 8–12 second radio briefing plays.
No talking over it; the briefing carries this beat.

### Beat 5 · 0:24–0:33 · Ask the field AI

**Run:**
```bash
python3 -m cybertf.cli ask "What caused the packet loss after the 02:10 config push?" \
  --file challenges/sprint_signal_lost/data/logs/gateway.log
```

**Show:** the model's answer leaning toward weather or the noisy node 17
antenna: plausible, tempting, wrong.

**Say:** "The field AI blames the weather. The logs disagree."

### Beat 6 · 0:33–0:42 · Catch and correct

**Show:** diff `uplink.conf` against `uplink.conf.prev` in Cursor: the push
set `mtu 9000`. Edit `uplink.conf` back to `mtu 1500`. Fill
`runs/<run_id>/answer.json` (pre-drafted off camera; on camera, show the
finding and the rejected model claim).

**Say:** "The config push set MTU to 9000. Fix it, cite the evidence, reject
the model's claim."

### Beat 7 · 0:42–0:48 · Submit, deterministic score

**Run:**
```bash
python3 -m cybertf.cli submit sprint_signal_lost runs/<run_id>/answer.json
```

**Show:** check-by-check score output, XP awarded.

**Say:** "Deterministic scoring. No model grades you."

### Beat 8 · 0:48–0:52 · After-action report

**Open:** `runs/<run_id>/aar.md` in Cursor.

**Show:** dimension bars, the moment the model was wrong and the catch.

### Beat 9 · 0:52–0:56 · Publish to the arena

**Run:**
```bash
python3 -m cybertf.cli publish <run_id>
```

**Show:** leaderboard row appears at
https://cybertrack-arena.vercel.app/leaderboard.

### Beat 10 · 0:56–1:00 · Close

**Say:** "Cursor is the interface. Gemma4 is the local edge AI. CyberTrack
scores what matters when the cloud goes dark and the stakes are high."

---

## Claims checklist

| Claim | Safe? |
|---|---|
| Local Gemma4 only in missions | ✓ verify-model + telemetry |
| Built during hackathon | ✓ git history + HACKATHON_BUILD.md |
| Not hiring/screening | ✓ training/readiness language |
| Deterministic scoring, no model in grading loop | ✓ scoring.py, reproducible from run artifacts |
| Voice briefing is fully offline | ✓ macOS `say`, no cloud TTS in demo path |
| Server-side answer validation | ✗ say "salted hash demo tier" |
| Durable Vercel leaderboard | ✗ say "ephemeral demo store; local scorecard is authoritative" |

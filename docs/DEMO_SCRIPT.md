# CyberTrack — 3-Minute Judge Demo Script

**Track:** Google DeepMind Remote · Edge / on-device Gemma4  
**Tagline:** Call of Duty for AI Operators  
**Arena:** https://cybertrack-arena.vercel.app

---

## Setup (before the judge arrives)

```bash
# Terminal 1 — web arena (optional if using Vercel)
cd web && npm run dev

# Terminal 2 — warm Ollama / Gemma4
cd ..  # repo root
python3 -m cybertf.cli verify-model
python3 -m cybertf.cli enlist NIGHTOWL   # or your callsign
```

Open in Cursor: repo root, terminal panel, `challenges/sprint_signal_lost/brief.md`.

---

## Beat 1 — Thesis (0:00–0:20)

**Say:** "High-stakes operators won't always have cloud AI. CyberTrack trains judgment with the model you can actually run at the edge — local Gemma4 inside Cursor."

**Show:** Web arena home → **GEMMA4 · LOCAL · OFFLINE** badge → mission board (6 Season Zero events).

---

## Beat 2 — Prove local Gemma (0:20–0:35)

**Run:**
```bash
python3 -m cybertf.cli verify-model
```

**Say:** "Every mission starts by proving the field AI is real, local, and offline — not a cloud substitute."

---

## Beat 3 — Fly a mission (0:35–1:30)

**Run:**
```bash
python3 -m cybertf.cli run sprint_signal_lost
python3 -m cybertf.cli brief sprint_signal_lost
```

**Show in Cursor:** evidence files — `gateway.log`, `maintenance_note.md`, `uplink.conf`.

**Run:**
```bash
python3 -m cybertf.cli ask "What caused the packet loss?" \
  --file challenges/sprint_signal_lost/data/logs/gateway.log
```

**Say:** "The field AI helps — but it only knows what you show it. The maintenance note is a false lead; the config push broke the link MTU."

**Fix** `challenges/sprint_signal_lost/data/config/uplink.conf` (mtu 9000 → 1500), fill `runs/<run_id>/answer.json`.

**Run:**
```bash
python3 -m cybertf.cli submit sprint_signal_lost runs/<run_id>/answer.json
```

---

## Beat 4 — Score + AAR (1:30–2:00)

**Show:** terminal check-by-check score output.

**Open:** `runs/<run_id>/aar.md` — dimension bars, decision trace, Gemma debrief.

**Say:** "Deterministic scoring across readiness dimensions — no model in the grading loop."

---

## Beat 5 — Arena + anti-cheat (2:00–2:40)

**Run:**
```bash
export CYBERTF_ARENA_URL=https://cybertrack-arena.vercel.app
python3 -m cybertf.cli publish <run_id>
```

**Show:** `/leaderboard` — your run, rank/XP, a **UNVERIFIED · SUSPICIOUS TIME** row on a fast run.

**Say:** "Speed counts, but impossible times get flagged — not celebrated. Local `cybertf season` works fully offline if the network fails."

---

## Beat 6 — Close (2:40–3:00)

**Show:** `/qualification` page + mission board with Basic Qual through Marathon.

**Say:** "Cursor is the cockpit. Gemma4 is the field AI. CyberTrack is a flight simulator for AI-era technical judgment — built during the hackathon, open source, training-only framing."

---

## Claims checklist

| Claim | Safe? |
|---|---|
| Local Gemma4 only in missions | ✓ verify-model + telemetry |
| Built during hackathon | ✓ git history + HACKATHON_BUILD.md |
| Not hiring/screening | ✓ training/readiness language |
| Server-side answer validation | ✗ say "salted hash demo tier" |
| Durable Vercel leaderboard | ✗ say "ephemeral demo store; local scorecard is authoritative" |

# Sprint: Signal Lost

**Event:** Sprint · **Timebox:** 10 minutes · **Grid:** HALCYON edge sensor
uplink (synthetic training environment)

## Situation

At 02:10 UTC a routine configuration push went out to the HALCYON uplink
gateway. Since then, field sensors have been dropping packets and telemetry
is arriving in fragments. It is storm season, node 17's antenna has been
noisy for weeks, and the previous shift's hunch was "weather." Someone needs
to find the real cause — fast.

## Objectives

1. Start the clock: `cybertf run sprint_signal_lost`
2. Work the evidence in `challenges/sprint_signal_lost/data/`:
   - `logs/gateway.log` — uplink gateway events
   - `logs/node_17.log` — field node radio log
   - `config/uplink.conf` — live gateway config (as pushed at 02:10)
   - `config/uplink.conf.prev` — config before the push
   - `notes/maintenance_note.md` — shift maintenance notes
3. Consult your field AI. Try asking before and after showing it evidence —
   notice how its answer changes:
   `cybertf ask "Sensors started dropping packets after a config push. Where do I look first?"`
   `cybertf ask "What changed between these configs and could it drop packets?" --file challenges/sprint_signal_lost/data/config/uplink.conf --file challenges/sprint_signal_lost/data/config/uplink.conf.prev`
4. **Patch the live config** (`config/uplink.conf`) back to a safe value in
   Cursor.
5. Fill in `runs/<run_id>/answer.json` and submit:
   `cybertf submit sprint_signal_lost runs/<run_id>/answer.json`

## Constraints

- Local Gemma4 field AI only (`cybertf ask`). No cloud assistants.
- The model's first instinct may match the previous shift's. Verify against
  the logs before you commit to a root cause.
- Cite your evidence files in the answer.

The scoreboard rewards being right first, fast second.

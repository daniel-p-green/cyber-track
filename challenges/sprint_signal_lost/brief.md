# Sprint: Signal Lost

**Event:** Sprint · **Timebox:** 10 minutes · **Grid:** HALCYON edge sensor
uplink (synthetic training environment)

## Situation

At 02:10 UTC a routine configuration push went out to the uplink gateway at
HALCYON's coastal sensor line, the ring of field nodes that feeds early
storm warnings to three downstream stations. Since then, sensors have been
dropping packets and telemetry is arriving in fragments. The same degraded
uplink is your only backhaul: with the link flapping, there is no cloud AI
to call, only the Gemma4 model running on the gateway's maintenance laptop.
It is storm season, node 17's antenna has been noisy for weeks, and the
previous shift's hunch was "weather." If the warning feed stays dark through
the next front, downstream stations fly blind. Find the real cause and patch
the config, fast.

## Objectives

1. Start the clock: `cybertf run sprint_signal_lost`
2. Work the evidence in `challenges/sprint_signal_lost/data/`:
   - `logs/gateway.log`: uplink gateway events
   - `logs/node_17.log`: field node radio log
   - `config/uplink.conf`: live gateway config (as pushed at 02:10)
   - `config/uplink.conf.prev`: config before the push
   - `notes/maintenance_note.md`: shift maintenance notes
3. Consult local Gemma. Try asking before and after showing it evidence;
   notice how its answer changes:
   `cybertf ask "Sensors started dropping packets after a config push. Where do I look first?"`
   `cybertf ask "What changed between these configs and could it drop packets?" --file challenges/sprint_signal_lost/data/config/uplink.conf --file challenges/sprint_signal_lost/data/config/uplink.conf.prev`
4. **Patch the live config** (`config/uplink.conf`) back to a safe value in
   Cursor.
5. Fill in `runs/<run_id>/answer.json` and submit:
   `cybertf submit sprint_signal_lost runs/<run_id>/answer.json`

## Constraints

- Local Gemma4 via `cybertf ask` only. No cloud assistants.
- The model's first instinct may match the previous shift's. Verify against
  the logs before you commit to a root cause.
- Cite your evidence files in the answer.

The scoreboard rewards being right first, fast second.

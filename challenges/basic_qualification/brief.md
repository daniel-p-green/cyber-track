# Basic Qualification

**Event:** Qualification · **Timebox:** 15 minutes · **Grid:** HALCYON (synthetic training environment)

Welcome to CyberTrack, operator. This qualification teaches the full mission
loop: cockpit, field AI, evidence, submission, after-action report. Everything
here is synthetic training data. No live systems.

## Situation

You are taking over monitoring duty for the HALCYON relay grid. A previous
shift left an **archived field-AI advisory** in the workspace. Field AI models
run locally and offline. They are useful and fast, but they only know what
they were shown. Your first discipline as an operator: **verify before you
trust.**

## Objectives

1. **Enlist.** Pick a callsign:
   `cybertf enlist <CALLSIGN>`
2. **Verify your field AI.** Prove a real Gemma model is serving locally:
   `cybertf verify-model`
3. **Start the mission clock:**
   `cybertf run basic_qualification`
4. **Read the evidence.** Open `challenges/basic_qualification/data/` in
   Cursor. Compare the archived advisory against the relay roster.
5. **Consult your field AI at least once.** Example:
   `cybertf ask "What should I check to verify a claim about relay station coverage?" --file challenges/basic_qualification/data/relay_roster.txt`
6. **Answer.** Fill in `runs/<run_id>/answer.json` (a template was copied
   there when the run started).
7. **Submit:**
   `cybertf submit basic_qualification runs/<run_id>/answer.json`
8. **Read your after-action report** in the run folder, then publish to the
   arena if you're online: `cybertf publish <run_id>`

## Constraints

- Your only AI is the local Gemma4 field model via `cybertf ask`. No cloud
  assistants inside missions.
- Cite the files that support your answers in the `evidence` list.

Good hunting.

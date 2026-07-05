# Basic Qualification

**Event:** Qualification · **Timebox:** 15 minutes · **Grid:** HALCYON (synthetic training environment)

Welcome to CyberTrack, operator. This qualification teaches the full mission
loop: cockpit, local model, evidence, submission, after-action report. Everything
here is synthetic training data. No live systems.

## Situation

You are reporting to the HALCYON training annex, a sealed replica of the
relay grid built for AI operations readiness. Standing policy keeps the annex
air-gapped: no cloud AI, no outside networks, only the local Gemma4 field
model on your machine. That is not an obstacle, it is the point. The grid you
may one day defend runs the same way. A previous shift left an **archived
model advisory** in the workspace, and part of it does not match the relay
roster. Your first decision as an operator: which claims in that advisory
survive contact with the evidence, and which do not. **Verify before you
trust.**

## Objectives

1. **Claim a callsign.**
   `cybertf enlist <CALLSIGN>`
2. **Verify local Gemma.** Prove a real Gemma model is serving locally:
   `cybertf verify-model`
3. **Start the mission clock:**
   `cybertf run basic_qualification`
4. **Read the evidence.** Open `challenges/basic_qualification/data/` in
   Cursor. Compare the archived advisory against the relay roster.
5. **Consult local Gemma at least once.** Example:
   `cybertf ask "What should I check to verify a claim about relay station coverage?" --file challenges/basic_qualification/data/relay_roster.txt`
6. **Answer.** Fill in `runs/<run_id>/answer.json` (a template was copied
   there when the run started).
7. **Submit:**
   `cybertf submit basic_qualification runs/<run_id>/answer.json`
8. **Read your after-action report** in the run folder, then publish to the
   arena if you're online: `cybertf publish <run_id>`

## Constraints

- Your only AI is local Gemma4 via `cybertf ask`. No cloud
  assistants inside missions.
- Cite the files that support your answers in the `evidence` list.

Good hunting.

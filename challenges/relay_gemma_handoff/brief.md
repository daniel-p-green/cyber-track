# Relay: Human + Gemma Handoff

**Event:** Relay · **Timebox:** 15 minutes · **Grid:** HALCYON Sector 4 sensor array (synthetic training environment)

## Situation

You are the Shift 1 operator at HALCYON Sector 4, the array that watches the
grid's eastern approach. An active calibration incident (HALCYON-INC-0078)
has five nodes reading drifted values; you have corrected three, and your
shift is ending. Sector 4 handles raw positional data classified
grid-internal, so incident details never leave the local network: no cloud
AI sees this traffic, by policy, ever. Shift 2 inherits the incident with
only the local Gemma field model to assist them. If your handoff is vague,
the wrong nodes get recalibrated and the validation deadline is missed.

Your decision: what must the handoff brief contain so the field model can
actually continue the work. Write it, then test it against the model.

The incident details are in `data/incident_context.md`. Read it carefully;
the remaining node IDs and the exact offset value are facts that must appear
in your handoff.

## Objectives

1. Start the clock: `cybertf run relay_gemma_handoff`

2. Read `challenges/relay_gemma_handoff/data/incident_context.md` to understand
   what was done in Shift 1 and what remains.

3. Write your handoff brief in the answer field (minimum 200 characters).
   It must include:
   - The remaining node IDs that still need correction
   - The exact calibration offset value to apply
   - The validation deadline

4. Use your field AI (at least twice: once to test the handoff, once to probe
   a detail):
   ```
   cybertf ask "Here is my handoff brief: [paste your brief here]. Based on this, which nodes need calibration and what offset should be applied?"
   ```
   Then ask a follow-up question to probe the model's understanding.

5. Report whether the model correctly identified both nodes and the offset.

6. Fill in `runs/<run_id>/answer.json` and submit:
   ```
   cybertf submit relay_gemma_handoff runs/<run_id>/answer.json
   ```

## What to File

- **handoff_brief**: your shift-2 handoff brief (≥200 chars, must mention node_21, node_23, and the offset)
- **gemma_followed**: did the field model correctly answer the shift-2 question? (yes/no + brief reason)
- **continuation_critique**: assess the model's response quality: what was useful, what was missing (≥100 chars)
- **evidence**: include incident_context.md

## Constraints

- Local Gemma4 field AI only. No cloud assistants.
- The field model only knows what you tell it. A vague handoff brief will produce a vague continuation.
- Use `cybertf ask` at least twice.
- Cite your evidence.

A good handoff brief is the primary deliverable. The field model's performance reflects the quality of your brief.

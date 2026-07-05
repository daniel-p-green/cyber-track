# Field: Prompt Under Fire

**Event:** Field · **Timebox:** 10 minutes · **Grid:** HALCYON relay grid (synthetic training environment)

## Situation

Relay R-7 on the HALCYON grid is degraded, and the exercise assumes a
contested environment: outbound traffic cannot be trusted, so all cloud AI
is off the table and every plan must be checked against documents you hold
locally. A prior shift queried the field model and archived three draft
restoration plans in `data/proposed_plans.md`. Nobody has reviewed them. One
is safe. One violates standing ops policy. One calls for a tool the HALCYON
grid does not have, a detail the model invented. If the wrong plan executes,
R-7 goes from degraded to down.

Your decision is not how to restore the relay. It is which plan an operator
can act on, and why the others cannot leave the queue.

## Objectives

1. Start the clock: `cybertf run field_prompt_under_fire`

2. Read the evidence in `challenges/field_prompt_under_fire/data/`:
   - `proposed_plans.md`: the three AI-drafted plans to review
   - `ops_policy.md`: the standing maintenance policy
   - `toolkit_manifest.txt`: the approved tool list

3. Consult your field AI to help reason through the plans:
   ```
   cybertf ask "Review this plan against the ops policy I'll paste. Flag any violations."
   ```

4. Complete `runs/<run_id>/answer.json` with your findings and submit:
   ```
   cybertf submit field_prompt_under_fire runs/<run_id>/answer.json
   ```

## What to File

- **safe_plan**: letter of the safe, policy-compliant plan (A, B, or C)
- **unsafe_plan**: letter of the plan that violates ops policy
- **unsafe_reason**: the specific section it violates and why (1–3 sentences)
- **hallucinated_plan**: letter of the plan that references a non-existent tool
- **hallucinated_tool**: the exact name of the hallucinated tool
- **corrected_plan**: a corrected version of Plan A with the violation removed
- **evidence**: file paths you used to reach your conclusions

## Constraints

- Local Gemma4 field AI only. No cloud assistants.
- Cite your evidence. "The model said so" is not evidence.
- The field model may repeat the plans' errors if you ask naively. Probe it
  with specific policy questions.

The scoreboard rewards correctness. Speed is a tiebreaker.

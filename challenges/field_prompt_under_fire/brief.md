# Field: Prompt Under Fire

**Event:** Field · **Timebox:** 10 minutes · **Grid:** HALCYON relay grid (synthetic training environment)

## Situation

A degraded HALCYON relay — R-7 — needs restoration. A prior shift queried the
field model and received three draft plans archived in `data/proposed_plans.md`.
The plans have not been reviewed. One is safe. The others contain problems that
a careful operator must catch before anyone acts.

Your job is not to restore the relay. Your job is to review the plans, identify
which is safe, which violates standing ops policy, and which references a tool
the HALCYON grid does not have.

## Objectives

1. Start the clock: `cybertf run field_prompt_under_fire`

2. Read the evidence in `challenges/field_prompt_under_fire/data/`:
   - `proposed_plans.md` — the three AI-drafted plans to review
   - `ops_policy.md` — the standing maintenance policy
   - `toolkit_manifest.txt` — the approved tool list

3. Consult your field AI to help reason through the plans:
   ```
   cybertf ask "Review this plan against the ops policy I'll paste. Flag any violations."
   ```

4. Complete `runs/<run_id>/answer.json` with your findings and submit:
   ```
   cybertf submit field_prompt_under_fire runs/<run_id>/answer.json
   ```

## What to File

- **safe_plan** — letter of the safe, policy-compliant plan (A, B, or C)
- **unsafe_plan** — letter of the plan that violates ops policy
- **unsafe_reason** — the specific section it violates and why (1–3 sentences)
- **hallucinated_plan** — letter of the plan that references a non-existent tool
- **hallucinated_tool** — the exact name of the hallucinated tool
- **corrected_plan** — a corrected version of Plan A with the violation removed
- **evidence** — file paths you used to reach your conclusions

## Constraints

- Local Gemma4 field AI only. No cloud assistants.
- Cite your evidence. "The model said so" is not evidence.
- The field model may repeat the plans' errors if you ask naively. Probe it
  with specific policy questions.

The scoreboard rewards correctness. Speed is a tiebreaker.

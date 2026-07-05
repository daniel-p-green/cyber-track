# Field: Patch the Edge Agent

**Event:** Field · **Timebox:** 15 minutes · **Grid:** HALCYON forward sensor network (synthetic training environment)

## Situation

The severity classifier deployed on HALCYON's forward sensor nodes has a
bug. Events at a specific boundary score are being mislabeled, so real
warnings are escalating late across the whole forward line. These nodes are
solar-powered field hardware with no route to the cloud; the classifier runs
on the device, and so does your only AI. That is by design: an edge agent
that phones home is an edge agent that fails when the link does. The fix
ships tonight with the next maintenance window. Your decision: what the
minimal correct change is, backed by the spec, not by intuition (yours or
the model's).

The classifier is in `data/edge_agent.py`. The specification is in
`data/severity_spec.md`. The test suite is in `data/test_edge_agent.py`.
Right now, multiple tests are failing. They must all pass after your fix.

The fix is small. Do not rewrite the module. Understand the specification,
find the boundary error, and make the minimal correct change.

## Objectives

1. Start the clock: `cybertf patch_edge_agent` →
   `cybertf run field_patch_edge_agent`

2. Work the evidence in `challenges/field_patch_edge_agent/data/`:
   - `severity_spec.md`: authoritative threshold specification
   - `edge_agent.py`: the buggy classifier
   - `test_edge_agent.py`: the failing test suite

3. Run the tests to see which ones fail:
   ```
   cd challenges/field_patch_edge_agent/data
   python -m unittest -v test_edge_agent
   ```

4. Consult local Gemma:
   ```
   cybertf ask "I have a severity classifier with a boundary bug. The spec says score >= 50 is HIGH. What operator mistake could cause score 50 to be classified as MEDIUM instead?"
   ```

5. Apply the minimal fix to `edge_agent.py` in Cursor.

6. Re-run the tests to confirm all pass.

7. Fill in `runs/<run_id>/answer.json` and submit:
   ```
   cybertf submit field_patch_edge_agent runs/<run_id>/answer.json
   ```

## What to File

- **bug_location**: the function name that contains the bug
- **explanation**: what the bug is, how it manifests, and the minimal fix (2–4 sentences)
- **minimal_change_description**: describe the one-line change you made
- **evidence**: include severity_spec.md and edge_agent.py

## Constraints

- Local Gemma4 via `cybertf ask` only. No cloud assistants.
- Minimal fix only. Do not refactor or restructure the module.
- The spec is the ground truth, not the model's intuition.

Tests passing is the primary objective. Explanation quality is rewarded separately.

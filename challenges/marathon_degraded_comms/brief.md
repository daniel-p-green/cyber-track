# Marathon: Degraded Comms Incident

**Event:** Marathon · **Timebox:** 25 minutes · **Grid:** HALCYON forward node cluster FWD-7 (synthetic training environment)

## Situation

Forward cluster FWD-7 sits at the far edge of the HALCYON grid, two relay
hops past the last hardened station, on a satellite backhaul that has been
degraded since last night. Three of its sensors went unresponsive around
03:42 UTC. The evidence reaching you is fragmented: telemetry shows a clean
dropout, a delayed log batch arrived out of order mixing events from
different hours, and two human sitreps partially contradict each other.
Cloud AI is out of reach and would be too slow anyway; round trips over the
degraded backhaul take longer than the decisions do. The local model has
already filed a high-confidence recommendation, and you suspect it is wrong.
Acting on a bad recommendation could restart the wrong subsystem and extend
the outage. Your decision: what actually failed, and whether the model's
recommendation is safe to execute.

## Objectives

1. Start the clock: `cybertf run marathon_degraded_comms`

2. Work all four evidence files in `challenges/marathon_degraded_comms/data/`:
   - `telemetry_snapshot.csv`: sensor readings showing the outage pattern
   - `delayed_logs.log`: event log batch that arrived out of order (read timestamps carefully)
   - `situation_reports.md`: two human sitreps with conflicting assessments
   - `model_recommendation.md`: the local model's recommendation (evaluate critically)

3. Consult local Gemma at least twice:
   ```
   cybertf ask "I have out-of-order logs. How do I correlate a delayed log batch to find the true event sequence?"
   cybertf ask "A comms daemon restart is recommended for a multi-node outage. What evidence would confirm or refute this?"
   ```

4. Fill in `runs/<run_id>/answer.json` and submit:
   ```
   cybertf submit marathon_degraded_comms runs/<run_id>/answer.json
   ```

## What to File

- **root_cause**: the true root cause of the outage (be specific: what system failed, how)
- **brownout_time_utc**: the UTC time the power event began (from the delayed logs)
- **model_recommendation_verdict**: is the recommendation safe? ('unsafe' / 'reject' / 'incorrect')
- **memo**: operational memo ≥300 chars: classify the incident, state root cause, rate the model recommendation, and use uncertainty language where evidence is incomplete
- **affected_node_count**: how many nodes were affected
- **evidence**: include delayed_logs.log and situation_reports.md (both required)

## Constraints

- Local Gemma4 via `cybertf ask` only. No cloud assistants.
- The logs arrived out of order. Check timestamps before drawing causal conclusions.
- The model recommendation is confidently stated. Confidence is not correctness.
- Use uncertainty language in your memo where the evidence is partial or unverified.
- Cite both delayed_logs.log and situation_reports.md in your evidence list.

The marathon format rewards thoroughness. Take your time with the log correlation.

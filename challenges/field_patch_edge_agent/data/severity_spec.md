# HALCYON Severity Specification — Sensor Event Classifier
# Version: 1.3   Effective: 2026-03-15

## Purpose

Defines the anomaly score thresholds used by the edge agent severity
classifier (`edge_agent.py`) deployed on HALCYON forward nodes.

## Anomaly Score Thresholds

| Severity | Lower Bound   | Upper Bound   | Notes                         |
|----------|---------------|---------------|-------------------------------|
| LOW      | (none)        | < 10          | Routine variance, no action   |
| MEDIUM   | >= 10         | < 50          | Monitor, log for trend        |
| HIGH     | >= 50         | < 100         | Investigate within shift      |
| CRITICAL | >= 100        | (none)        | Immediate response required   |

**Boundary rule:** All lower bounds are INCLUSIVE. A sensor reading with a
composite anomaly score of exactly 50 MUST be classified as HIGH. A score
of exactly 10 MUST be classified as MEDIUM. A score of exactly 100 MUST
be classified as CRITICAL.

## Examples

| Score | Expected Severity |
|-------|-------------------|
| 0     | LOW               |
| 9.9   | LOW               |
| 10    | MEDIUM            |
| 49.9  | MEDIUM            |
| 50    | HIGH              |
| 99.9  | HIGH              |
| 100   | CRITICAL          |
| 200   | CRITICAL          |

## Calibration Notes

The boundary at 50 was changed from EXCLUSIVE (< 50 = MEDIUM) to INCLUSIVE
(>= 50 = HIGH) in version 1.2 of this spec (2026-01-08). Any classifier
implementation predating that change may contain a stale `>` comparison
instead of the required `>=`. Check all boundary comparisons carefully.

# Incident Context — Sensor Calibration Drift, HALCYON Grid Sector 4

**Incident ID:** HALCYON-INC-0078
**Opened:** 2026-07-03 14:00 UTC
**Type:** Calibration drift — atmospheric sensor array
**Grid zone:** Sector 4, forward sensor ring

---

## Summary

A systematic calibration drift affecting multiple HALCYON atmospheric sensors
in Sector 4 was detected during the 14:00 UTC validation window. All affected
nodes are reporting readings offset approximately +2.3 degrees above
calibrated baseline.

Root cause: firmware update FWUP-0078 deployed at 11:30 UTC introduced an
incorrect reference table for the pressure-temperature compensation curve.
The correction has been identified and validated on bench hardware.

**The corrected offset to apply is: +0.6 degrees**

This offset counteracts the firmware error and restores accurate readings.
It must be applied individually to each remaining affected node using the
calibration tool before the next validation window.

---

## Node Status at Shift-1 Start (14:00 UTC)

| Node    | Status   | Action Required         |
|---------|----------|-------------------------|
| node_18 | Drifting | Apply +0.6 correction   |
| node_21 | Drifting | Apply +0.6 correction   |
| node_23 | Drifting | Apply +0.6 correction   |
| node_24 | Drifting | Apply +0.6 correction   |
| node_27 | Drifting | Apply +0.6 correction   |

---

## Shift-1 Progress

The following nodes were corrected and validated during Shift 1:

- **node_18** — correction applied at 15:12 UTC, validated nominal ✓
- **node_24** — correction applied at 16:30 UTC, validated nominal ✓
- **node_27** — correction applied at 17:45 UTC, validated nominal ✓

---

## Remaining for Shift 2

The following nodes still require the calibration correction. The incoming
Shift 2 operator must apply the +0.6 degree offset to each of these nodes
before the next validation window at 22:00 UTC.

- **node_21** — correction pending
- **node_23** — correction pending

There is no known obstacle to applying the correction. The procedure is the
same as for the nodes already fixed.

---

## Correction Procedure

```
halcyon-cal apply --node <node_id> --offset +0.6
```

Validate each node immediately after correction:

```
halcyon-cal validate --node <node_id>
```

Expected output: `PASS — reading within +/- 0.1 of calibrated baseline`

Log each result in incident HALCYON-INC-0078 with timestamp.

---

## Shift-2 Question

After writing your handoff brief, use `cybertf ask` to pass it to the local
local model and ask: **"Based on this handoff, which nodes need calibration
and what offset should be applied?"**

Report whether the local model's response correctly identifies node_21 and
node_23 as the remaining nodes and states the +0.6 degree offset.

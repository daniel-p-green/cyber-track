# HALCYON Operations Policy — Relay Maintenance Procedures

## Section 3.4 — Watchdog and Alarm Systems

**3.4.1** The relay watchdog service (`halcyon-watchdog`) MUST remain active at all
times, including during scheduled maintenance windows.

**3.4.2** Disabling or suppressing the watchdog — for any reason including
"noise reduction", "alarm fatigue", or "routine maintenance" — is a POLICY
VIOLATION and requires immediate escalation to the shift supervisor.

**3.4.3** Any plan that includes a step to disable the watchdog or reduce alarm
verbosity during active maintenance is non-compliant and must be rejected.
Operators who proceed under a non-compliant plan are personally accountable
for any events that occur during the watchdog blackout period.

## Section 3.5 — Approved Restore Sequence

**3.5.1** Relay restores must be performed in the following order:

  1. Power verification
  2. Signal test
  3. Beam alignment
  4. Watchdog confirmation

**3.5.2** Do not proceed to the next step without confirming the previous
step's success criteria.

**3.5.3** If any step fails, halt and escalate. Do not attempt workarounds
during a live restore.

## Section 3.6 — Approved Tool Usage

**3.6.1** Only tools listed in the current `toolkit_manifest.txt` may be
used during relay maintenance operations.

**3.6.2** Use of any tool not present in the manifest is unauthorized and
constitutes a procedural violation regardless of stated intent.

**3.6.3** Field model advisories that reference unlisted tools must be flagged
as containing hallucinated capabilities and must not be acted upon without
supervisor approval.

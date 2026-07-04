# Shift Maintenance Notes — 2026-07-03/04

Synthetic training data.

- Node 17 antenna mast: known RSSI noise during storm gusts since June.
  Radio team assessed it 06-30: **cosmetic, not service-affecting.** Do not
  chase it again unless RSSI drops below alarm threshold (-92dBm).
- Storm cell tracking through sector 5 overnight. Expect noisy radio WARNs.
- 02:10 config push (rev 4821): ops console applied "high-throughput profile"
  from the vendor playbook to tunnel0. NOTE: the upstream microwave hop was
  never validated for jumbo frames, and tunnel0 has `fragmentation off` per
  security policy. If anything looks weird after the push, compare against
  rev 4790 before blaming the weather.
- Reminder: gateway heartbeat loss % is the ground truth for service impact.
  Node radio WARNs alone are not an outage.

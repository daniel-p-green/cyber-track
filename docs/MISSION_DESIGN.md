# Mission Design Guide

How to author a CyberTrack mission pack. Missions are data-driven: drop a
folder into `challenges/` and the engine, scorer, AAR, scorecard, and arena
pick it up with zero engine changes.

## Anatomy

```
challenges/<mission_id>/
  mission.json         # metadata + answer schema + deterministic checks
  brief.md             # operator-facing field dispatch
  data/                # synthetic evidence: logs, configs, code, notes
  answer.example.json  # blank template copied into each run dir
```

See `docs/ARCHITECTURE.md` for the full `mission.json` schema and the
supported check types.

## Design rules

1. **One honest lesson per mission.** Every event teaches a specific
   constrained-AI discipline: verify the claim, catch the hallucinated tool,
   reject the confident bad plan, write the handoff the model can execute.
2. **Fair red herrings.** The tempting wrong answer must be discoverable as
   wrong from evidence inside the workspace — never outside knowledge.
   Signal Lost's storm is refutable from `node_17.log` + the maintenance
   note.
3. **Synthetic and defensive, always.** Fictional systems (HALCYON grid),
   no real nations or units, no offensive tradecraft. Label fixtures as
   synthetic training data.
4. **Deterministic scoring only.** The scorer never calls a model. If a
   quality can't be checked deterministically, reward its measurable proxy
   (length, required tokens via regex, cited files, telemetry events).
5. **No plaintext answers in the repo.** Use `cybertf.scoring.answer_hash`
   to generate salted hashes, with generous variant lists for phrasing.
   Prefer structural checks (`tests_pass`, `file_contains`,
   `evidence_includes`) that embed no answer at all.
6. **Point budget.** Aim for 90 check points; the engine adds time (5) and
   local/offline compliance (5) for a clean 100.
7. **Timing.** `expected_seconds.min` is the suspicious-time floor — set it
   at the fastest an honest expert could go. `par_seconds` is the
   full-speed-bonus threshold. Timebox is the decay endpoint.
8. **The model moment.** Design the brief so the operator's natural first
   `cybertf ask` happens before they've gathered evidence — then let the
   evidence correct the picture. Never script the live model; use archived
   advisories (fixture files) when a wrong claim must be deterministic.

## Checklist before shipping a mission

- [ ] Correct answers score ≥90%; a plausible wrong answer scores clearly lower.
- [ ] Full loop tested: `run → ask → submit → report`.
- [ ] Fixture state in git is the *unsolved* state (bugs unfixed, configs unpatched).
- [ ] Brief lists exact commands and cites the data directory.
- [ ] No banned framing (hiring/screening/offensive content).
- [ ] Answer variants cover reasonable phrasings (test with `answer_hash`).

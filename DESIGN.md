# CyberTrack Design System

This is the design operating manual for CyberTrack. It is written for humans
and for AI agents that build on this codebase. When implementation and this
document disagree, fix one of them in the same change.

Ground rules for using this doc:

- Tokens and component patterns here are buildable specs, not moodboard prose.
- Web tokens live in `web/app/globals.css`. Keep them in sync with section 3.
- Copy rules in section 9 apply to every user-facing string, including this doc.
- Visual reference sheet:
  `/Users/danielgreen/.codex/generated_images/019f2e41-b5ca-7982-acd1-ea1d5696dbab/ig_0c6c567150b60b42016a49a20a1b448197a2611a426cc5a208.png`.
  Use it as a north star. Recreate components with CSS, inline SVG, and simple
  icons. Do not slice raster UI assets unless a component cannot be built
  quickly.

---

## 1. Product Identity

**Thesis:** The next generation of operators will not be judged by whether
they can get an AI answer. They will be judged by whether they can verify it
under pressure.

**What it is:** CyberTrack is a tactical mission arena where players solve
high-pressure technical incidents inside Cursor using only local Gemma4. Each
mission simulates conditions when cloud AI is unavailable, untrusted, or
inappropriate: incomplete evidence, time pressure, imperfect model guidance,
and the need to make a defensible call.

**Scoring:** evidence discipline, model skepticism, recovery from bad
guidance, decision quality, and local/offline compliance. After each mission,
an after-action report shows where reasoning held up and where it broke.

**Closing line (use in README, pitch, footer-adjacent copy):** Cursor is the
interface. Gemma4 is the local edge AI. CyberTrack scores what matters when
the cloud goes dark and the stakes are high.

**Hook (optional pitch shorthand):** "Call of Duty for AI operators." Say it
at most once, then immediately explain the practical loop. CyberTrack is an
original property: no copied game assets, UI, names, typography, or trade
dress.

**CyberTrack is:**

- Timed missions flown inside Cursor with local Gemma via `cybertf ask`.
- Deterministic scoring, an after-action report, XP, ranks, a leaderboard.
- Synthetic, defensive, fictional scenarios (the HALCYON grid does not exist).

**CyberTrack is not:**

- Hiring, recruiting, screening, or job-suitability scoring. Scores are
  training feedback. This rule appears in the footer and setup page.
- A CTF, cyber range, or exploit game. No offensive content, no live targets.
- A dashboard product. The web arena is a scoreboard around Cursor, never the
  place where mission work happens.
- Surveillance. Telemetry is opt-in, transparent, workspace-scoped.

## 2. Experience Model

Two surfaces, one loop.

**Cursor is the cockpit.** Evidence files live in the editor, the local Gemma
field AI is invoked through `cybertf ask` in the terminal, the answer artifact
(`answer.json`) is edited in the workspace, and the arena runs in Cursor's
in-app browser. We teach people to fly the editor they already have. We never
rebuild an IDE on the web.

**The web arena is the mission map, scoreboard, and service record.** It shows
Season One progression, mission briefings, published runs, web AAR pages,
ranks, and the operator record. Every arena page keeps the "solve it in
Cursor" loop explicit. The arena wraps the mission engine; it is not where
missions are solved.

**Page roles (information architecture):**

- **Home:** the thesis, the five-step loop (brief, evidence, interrogate,
  decide, debrief), what gets scored, an AAR extract as the payoff preview,
  the Season One rail, and the setup CTA. One idea per section, one hero.
- **Setup (`/qualification`):** Cursor + Ollama + local Gemma + callsign +
  first mission, in six persisted steps. Commands live here because setup is
  the one place terminal work is the content.
- **Mission board (`/missions`):** scenario-led dossier cards. Each card
  leads with the hook and the operator's call, then timebox, XP, evidence
  count, and skills tested. No command text on cards.
- **Mission detail (`/missions/[id]`):** a briefing, not a checklist. Zones
  in order: Situation (with the edge condition called out), Evidence (files
  with roles plus a session checklist), The Model Will Get This Wrong (the
  planted-trap warning), Your Decision, then one demoted "flight ops"
  terminal block. Scoring and top runs live in the aside.
- **AAR (`/runs/[runId]`):** the payoff. Score ring and XP up top, then
  "where it broke" before "where it held up" (failures teach more),
  readiness dimension bars, and a run-integrity panel (local model, time
  bounds, telemetry, deterministic scoring). Flagged runs carry an amber
  banner.
- **Leaderboard (`/leaderboard`):** real runs only by default. Demo seed
  rows are hidden behind an explicit "show demo reference rows" toggle and
  render dimmed with a boxed `demo` tag when shown. Empty boards invite the
  first run instead of faking a crowd. Run rows link to their AAR pages.
- **Operator record (`/operators/[callsign]`):** rank, XP progress, mission
  record with AAR links, badges, best dimension scores.

**Local Gemma is the constrained field AI.** Useful, fast, sometimes wrong.
It simulates edge deployments where cloud AI is unavailable, untrusted, or
too slow. It is the mission AI, not the judge. The `cybertf` CLI is the
instrumented mission interface: it verifies the model, starts runs, sends
Gemma prompts, logs ask/submission telemetry, scores artifacts, writes AARs,
and publishes results.

**Mission loop (design every screen against this):**

1. Setup once: Cursor, workspace, Ollama, pull Gemma, verify, claim callsign.
2. Pick a mission on the arena board. Start the run (timer arms).
3. Read the evidence files in Cursor.
4. Ask local Gemma through `cybertf ask` with the right files and context.
5. Verify or reject the model's claims against the evidence.
6. Edit the answer artifact in Cursor.
7. Submit. Deterministic scoring, AAR written, XP awarded.
8. Publish to the arena. Leaderboard row, rank progress, operator record.

## 3. Visual System

**Feel:** premium developer-tool cockpit with restrained tactical/MMORPG
progression. Quiet, confident, dark-first. Intensity comes from typography,
spacing, and signal color, never decoration.

### Dark theme tokens (primary identity)

| Token | Value | Role |
|---|---|---|
| `--bg` | `#0B0F14` | page background, near black, blue-cold |
| `--bg-2` | `#0D1219` | gradient partner for `--bg` |
| `--panel` | `#13181F` | cards, panels (graphite) |
| `--panel-2` | `#1C2430` | raised elements, inputs (deep slate) |
| `--panel-3` | `#232D3A` | highest surface |
| `--line` | `#232D3A` | hairline borders |
| `--line-strong` | `#33404F` | emphasized borders, HUD corners |
| `--text` | `#E6E9EE` | primary text (off white) |
| `--muted` | `#95A3B3` | secondary text (steel) |
| `--signal` | `#3BD671` | signal green |
| `--ice` | `#44C2FF` | cyan |
| `--amber` | `#FFB020` | amber |
| `--alert` | `#FF5D5D` | alert red |

### Light theme tokens (gray/steel daylight console)

Light mode is lighter than dark mode, not white. Think gray daylight command
console: soft steel surfaces, muted grid, low eye strain. No paper-white
backgrounds anywhere. Target values (tune for contrast, keep the steel feel):

| Token | Target | Role |
|---|---|---|
| `--bg` | `#C2CBD4` | steel gray page background |
| `--bg-2` | `#B7C1CB` | gradient partner |
| `--panel` | `#D3DAE1` | cards, panels |
| `--panel-2` | `#C7CFD7` | raised elements, inputs |
| `--panel-3` | `#BAC4CD` | highest surface |
| `--line` | `#9FACB9` | hairline borders |
| `--line-strong` | `#7E8D9B` | emphasized borders |
| `--text` | `#131A21` | primary text |
| `--muted` | `#42505D` | secondary text |
| `--signal` | `#0C7A43` | signal green, darkened for contrast |
| `--ice` | `#0A6DA6` | cyan, darkened |
| `--amber` | `#8A5A00` | amber, darkened |
| `--alert` | `#B32E2E` | alert, darkened |

All text/background pairs must pass WCAG AA (4.5:1 body, 3:1 large text).

### Accent roles (both themes)

- `--signal` green: success, verified, local Gemma online, XP, primary CTA.
- `--ice` cyan: links, interactive accents, the active mission state.
- `--amber`: timers, warnings, unverified hypotheses, suspicious-time flags.
- `--alert` red: failures and integrity violations only. Rare by design.

One signal color per component. If a card needs two accents, it is two
components. Never gradient-soup.

### Surfaces, borders, texture

- Surface hierarchy: `--bg` page, `--panel` card, `--panel-2` raised element
  or input, `--panel-3` sparingly for the highest layer. Never skip levels
  for contrast tricks; adjust borders instead.
- Borders are 1px hairlines in `--line`; use `--line-strong` for emphasis and
  HUD corner brackets (the `.hud-corners` utility). Border radius is 2px.
  CyberTrack is squared-off; anything rounder than 2px reads as generic SaaS.
- Background texture: faint grid (`.ops-grid-bg`) or scanline at 4% opacity
  or less. Atmosphere, never noise. One texture per page maximum.
- Glow: allowed only as a soft box-shadow on the single hero element of a
  page (score ring, hero panel) and on the pulse dot. Never on text, borders,
  buttons, or more than one element per viewport.

## 4. Typography

Three families, three jobs:

- **Display** (`Barlow Condensed`): page titles, section labels, mission
  names, buttons, tags. Uppercase. Weights 600 to 800.
- **Body** (system UI sans): paragraphs, descriptions, list items. Weight 400;
  600 for inline emphasis. Never uppercase body text.
- **Mono** (`JetBrains Mono`): callsigns, timers, scores, XP, run IDs, file
  paths, commands. Timers and scores are the heroes: large mono numerals.

Rules:

- All-caps is for display-family labels 14px and under, plus page titles.
  If a string is a full sentence, it is body text and never all-caps.
- Letter-spacing scales inversely with size: 0.10 to 0.14em on small labels
  (10 to 12px), 0.04 to 0.06em on buttons and titles, none on body or mono.
- Body text: 13.5 to 15px at line-height 1.6 to 1.7, max width about 65ch.
- Dense screens (mission detail): one type size for all body content, one for
  all labels. Hierarchy comes from weight and color (`--text` vs `--muted`),
  not from adding more sizes. If a screen uses more than five distinct font
  sizes, remove some.
- Minimum sizes: 10px for display labels, 12px for anything users must read.
- Hero headlines: cap at about 36px desktop, weight 700, line-height at or
  above 1.1, max 26ch. A hero that shouts reads as amateur; the thesis
  carries the weight, not the font size. One accent word or phrase in ice,
  no underline decorations.

## 5. Layout Rhythm

- Container: max-width 1240px, 20px side padding. Section padding clamps
  around 30 to 48px vertical. Hairline dividers between page sections.
- Section headers use the `.section-label` pattern: mono index, uppercase
  label, rule line filling the remaining width.
- Cards: 18 to 24px internal padding, 13 to 18px gap between stacked blocks.
  Grids gap at 14 to 18px. Never pack panels edge to edge.
- Negative space is a feature. Every page should have one clearly dominant
  element (hero, HUD strip, podium, score ring). If everything is loud,
  nothing is.
- Two-column pages (mission detail, AAR, profile, setup): main column plus a
  300 to 420px aside. The aside is sticky on desktop, stacks below on mobile.
- Mission detail must scan top to bottom as: identity (title, tags, hook),
  HUD strip (timebox, status, reward, constraint, flag threshold), then the
  briefing zones: Situation, Evidence, The Model Will Get This Wrong, Your
  Decision, and finally the demoted flight-ops command block. Scoring and
  top runs live in the aside.
- Command text is never the dominant content of a page except Setup. On any
  other page, terminal commands appear in at most one demoted block near the
  bottom of the main column.
- Mobile: single column, no horizontal overflow at 390px. Rails become
  vertical lists. Verify overflow on every touched page before shipping.

## 6. Components

Concrete patterns. Reuse these; do not invent parallel versions.

- **Wordmark:** CYBERTRACK in display 800, all caps, followed by a small
  signal-green underscore block that blinks like a terminal caret. Never
  italicized, never gradiented.
- **Local Gemma status chip:** outlined pill, pulse dot, `LOCAL GEMMA4`
  (+ `ONLINE` in full size) in signal green on a 8 to 13% signal tint.
  Present in the header on every page. A `100% LOCAL` variant may appear on
  scoring surfaces.
- **Season progress map:** horizontal rail of mission nodes joined by route
  lines. Node states: completed (green check ring), active (cyan reticle),
  available (plain ring), locked (dashed ring, padlock), advanced (amber
  diamond). Route lines: solid green completed, solid cyan active, dashed
  available, dotted locked. Always include a compact legend. Do not
  functionally lock missions in the demo.
- **Mission dossier card:** hex-badged mission glyph, index number, event-type
  tag, slope difficulty badge, title, one-line scenario hook, "your call"
  line, meta grid (timebox, XP, evidence count), skills-tested chips, Open
  Briefing button plus a quiet Top Runs link. No commands on cards.
- **Mission briefing (web):** breadcrumb + Gemma chip status bar, mission
  head, HUD strip (5 cells desktop, 2-col mobile), then stacked briefing
  zones. The model-trap zone uses the amber accent; the edge-condition
  callout inside Situation uses the ice accent. One demoted flight-ops
  block with copy buttons closes the main column.
- **Web AAR page:** header panel with score ring, elapsed time, exchange
  count, and XP; "where it broke" (alert accent) above "where it held up"
  (signal accent) as check rows with points; readiness dimension bars; run
  integrity list; the training-not-hiring rule. Suspicious runs get an amber
  flag banner in the header. When per-check data was not published, point to
  `runs/<run_id>/aar.md` instead of faking detail.
- **Evidence checklist:** toggleable file rows (`challenges/<id>/data/<file>`)
  with check marks and an `n/m REVIEWED` mono counter. Session-local state;
  the CLI is the scoring source of truth.
- **Local Gemma field AI panel:** terminal-native `cybertf ask` exchange with
  attached evidence files, model name, latency, and a clear "verify before you
  trust" note. This is the real instrumented mission AI path.
- **Cursor cockpit sketch (illustrative):** stylized concept sketch only:
  files pane, answer editor pane, terminal exchange, and arena browser. Clearly
  a sketch, never a pixel copy of Cursor and never fake terminal output.
- **Submission panel:** the submit/publish commands with copy buttons, plus
  the deterministic-scoring note and flag threshold. Submission happens via
  CLI; the panel explains it, it does not fake a web submit.
- **AAR score ring:** large circular progress ring, mono score over `/100`
  centered. One per screen, may carry the page's single glow.
- **Metric bars:** label left, mono `n/100` or percent right, 4px track below
  filled by score color (green 80+, amber 50 to 79, alert below 50).
- **Rank badge / XP strip:** hex plate with initial, tiered diamond chevrons,
  rank name in display caps, mono XP, thin progress bar toward next rank.
  Original abstract geometry only, no real-world insignia.
- **Leaderboard row:** position, callsign (mono, link), rank marks + name,
  mono XP or score, missions/time, and on mission scope an AAR link. Demo
  seed rows are hidden by default behind a "show demo reference rows"
  toggle; when shown they render at reduced opacity with a detached boxed
  `demo` tag that never reads as part of the callsign, and they never rank
  above real runs on the podium.
- **Empty leaderboard state:** never fake a crowd. State that no verified
  runs are posted and offer the setup or briefing CTA.
- **Suspicious-time flag:** amber triangle icon plus `Suspicious time` tag;
  row muted at about 60% opacity, position replaced by the icon, zero XP.
  Flagged, not celebrated.
- **Setup wizard:** six expandable steps with persisted completion, segment
  progress bar, aside with support commands, rank ladder, roadmap note.
- **Welcome briefing:** four-step modal (mission, cockpit, arena, get
  started) shown on first visit, replayable from the header `?` button.
- **Footer:** one line of identity, the training-not-hiring rule, creator
  credit with labeled X/LinkedIn links. Quiet; never navigation soup.

## 7. Mission Design

- Missions are rich scenarios with fictional systems (Relay Station K4,
  HALCYON grid), written as calm field dispatches: situation, objective,
  constraints, deliverable, start commands. Second person, present tense.
- Each mission has a short briefing with color beyond tasks. It names a
  fictional location/system, what changed, what is at risk, why cloud AI is
  unavailable or inappropriate, and what the operator must decide.
- The selected demo mission should have a live voice briefing in the video
  path. Target 8 to 12 seconds. Voice narration is demo polish; local Gemma is
  still the only mission AI.
- No copy/paste gameplay. A mission is broken if it can be completed by
  pasting commands without reading evidence. The work is reading files,
  reasoning, and writing a decision.
- Every mission ships evidence artifacts (logs, configs, rosters, sitreps,
  code, tests) that contain the answer and at least one tempting false lead.
  Red herrings must be discoverable from the evidence, never outside
  knowledge.
- Every mission plants at least one bad model hypothesis: a claim local
  Gemma will plausibly make that the evidence disproves.
- The deliverable is an operator decision plus rationale in `answer.json`:
  finding, evidence paths cited, and where the format asks for it, the
  verdict on the model's claim.
- Design for deterministic footprints of skepticism: planted claims have
  known IDs and known disproving evidence, so catching or missing them is
  checkable without a model in the grading loop.

## 8. Scoring and AAR

- Scoring is deterministic and reproducible from run artifacts alone. No
  model grades you. Re-running a submission yields the same score.
- Dimensions and what they mean: mission completion (right answer), evidence
  discipline (cited the files that prove it), model skepticism /
  hallucination resistance (caught planted bad claims), recovery from bad AI
  guidance (corrected course after a wrong hypothesis), prompt discipline
  (asked with the right context), communication quality (clear rationale,
  uncertainty language), time-to-signal (speed, capped at 10% of score),
  tool reliability, terminal recovery, local/offline compliance (real local
  model verified, no cloud).
- The AAR must show: per-dimension scores with the specific checks behind
  them, the run timeline, the moment the model was wrong and what the player
  did about it, and an integrity footer (local model verified, time within
  bounds, telemetry state).
- Gemma may narrate a debrief in the AAR. Label it as narrative that does
  not affect the score. Gemma is the field AI being challenged; the grader
  is the deterministic scorer with the answer key. Keep those roles visually
  and verbally separate everywhere.
- Suspicious times earn zero XP and a flag. Evidence beats speed.

## 9. Copy Voice

- Concrete over abstract. Name the player action: opens Cursor, asks local
  Gemma, checks logs, rejects a bad hypothesis, fixes the config, submits
  evidence, reads the AAR, climbs the leaderboard.
- Short over grand. One sentence does one job. Cut thesis sentences.
- No em dashes anywhere in user-facing copy. Use periods, commas, colons, or
  parentheses.
- Banned words unless literal: pivotal, transformative, showcase,
  underscores, highlights, crucial, foster, enduring, robust, cutting-edge,
  seamless, leverage. Banned structures: "In summary", "Overall", "Let's
  walk through", "This guide explores", "Not only X but also Y", "From X to
  Y", "It is important to remember".
- Preferred terms: Cursor, `cybertf ask`, local Gemma field AI, evidence, AAR,
  leaderboard, timed mission, callsign, XP, rank, Season One. Use
  "operator", "mission", and "arena" where they earn their place; use
  simpler words elsewhere.
- Banned framing: hiring/screening/selection language, real militaries or
  nations, offensive-security language, "analytics/KPIs/insights"
  dashboard-speak.
- Mission briefs: calm, terse, no hoo-ah theatrics, readable by a smart
  16-year-old, respectable to a SOC engineer.

## 10. Demo Principles

- One complete loop beats a feature tour. The demo beat that carries the
  product: local Gemma confidently gives a wrong answer, the player catches
  it against the evidence, the deterministic score rewards the catch, the
  AAR and leaderboard show it.
- The 60-second video flow is: Cursor workspace, `cybertf verify-model`, one
  short voice briefing, mission run, `cybertf ask`, evidence correction,
  submit/score, AAR, publish to arena, service record or Season One map.
- Always show Cursor, local Gemma, evidence files, the correction, and the AAR
  as one connected loop. The website alone is not the product.
- Show the arena as the progression wrapper after the scored run exists.
- Show the suspicious-time flag if it fits the edit. Integrity is a feature.
- State the honest boundaries out loud when relevant: demo seed data,
  ephemeral store, hash-based validation tier, and which missions were flown
  end to end.

## 11. Anti-Patterns

Reject these on sight, in code review and in design review:

- Dashboard clutter: chart-first layouts, KPI grids, more than one hero per
  viewport.
- Fake terminal theater: scripted fake output that misrepresents how players
  actually work. Sketches must teach the real workflow.
- White-paper light mode: paper-white backgrounds, default-Bootstrap gray.
  Light mode is steel, not paper.
- All-caps overuse: uppercase body text, uppercase sentences, shouting labels
  above 14px.
- Copy/paste missions: any mission solvable without reading evidence.
- Generic SaaS cards: large border radii, drop-shadow stacks, pastel
  gradients, emoji icons.
- Military cosplay: real insignia, camo, weapons, soldiers, ranks copied
  from real forces, war imagery. Restrained tactical is a texture, not a
  costume.
- Cloud AI confusion: any UI or copy implying a cloud model plays or grades.
  The only player-facing model is local Gemma; simulation mode is always
  labeled.
- Decoration creep: second glow, second texture, second accent per
  component, animation loops, parallax, fake 3D.
- Command-first product pages: `cybertf`, copy buttons, and `answer.json`
  dominating mission or home surfaces. The scenario and the decision are the
  content; commands are demoted scaffolding (Setup excepted).
- Prominent fake data: seeded rows on podiums, demo operators presented as
  real, populated-looking boards with zero real runs.

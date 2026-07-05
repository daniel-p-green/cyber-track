import Link from "next/link";
import { MISSIONS } from "@/lib/missions";
import { slopeForDifficulty } from "@/lib/utils";
import {
  MissionGlyph,
  RailNode,
  SlopeBadge,
  VerifyChip,
  IconChat,
  IconOffline,
  IconExternal,
  IconBars,
  IconTimer,
  IconFile,
  IconTerminal,
  type NodeState,
} from "./components/svg";
import ZuluClock from "./components/ZuluClock";
import styles from "./page.module.css";

const LOOP = [
  {
    title: "Brief",
    note: "Pick a mission. Start the run, the timer arms.",
    icon: <IconTimer size={15} />,
  },
  {
    title: "Evidence",
    note: "Read the logs, configs, and sitreps in the editor.",
    icon: <IconFile size={15} />,
  },
  {
    title: "Interrogate",
    note: "Ask local Gemma. It only knows what you show it.",
    icon: <IconChat size={15} />,
  },
  {
    title: "Decide",
    note: "Verify or reject its claims. File your call with citations.",
    icon: <IconTerminal size={15} />,
  },
  {
    title: "Debrief",
    note: "Deterministic score, after-action report, XP, rank.",
    icon: <IconBars size={15} />,
  },
];

const SCORED_ON = [
  {
    name: "Evidence discipline",
    note: "You cited the files that prove your finding.",
  },
  {
    name: "Model skepticism",
    note: "You caught the claims the evidence disproves.",
  },
  {
    name: "Recovery",
    note: "You corrected course after bad guidance.",
  },
  {
    name: "Decision quality",
    note: "Your call is right and your rationale holds.",
  },
  {
    name: "Local compliance",
    note: "A verified local model, no cloud, the whole run.",
  },
];

const SETUP_LINKS = [
  { label: "Download Cursor", href: "https://cursor.com?ref=CyberTrack" },
  { label: "Install Ollama", href: "https://ollama.com/download" },
];

/* Illustrative AAR extract, modeled on real cybertf score output:
   the payoff screen players work toward. */
const AAR_CHECKS = [
  { label: "Root cause correctly identified", pass: true, pts: "20/20" },
  { label: "Config regression cited as evidence", pass: true, pts: "10/10" },
  { label: "Model's weather hypothesis rejected", pass: true, pts: "10/10" },
  { label: "Patch verified before submit", pass: false, pts: "0/15" },
];

const AAR_DIMS = [
  { label: "evidence_discipline", pct: 100 },
  { label: "hallucination_resistance", pct: 100 },
  { label: "mission_completion", pct: 71 },
  { label: "time_to_signal", pct: 60 },
];

function nodeState(index: number): NodeState {
  return index === 0 ? "active" : "available";
}

function lineClass(state: NodeState): string {
  if (state === "completed") return styles.lineCompleted;
  if (state === "active") return styles.lineActive;
  if (state === "locked") return styles.lineLocked;
  return styles.lineAvailable;
}

export default function Home() {
  return (
    <div className={`${styles.root} ops-grid-bg`}>
      {/* ── Ops status strip ─────────────────────────────────────────── */}
      <div className={styles.statusStrip}>
        <div className={`container ${styles.statusInner}`}>
          <span className={styles.statusItem}>
            <span className="pulse-dot" /> SEASON ZERO ACTIVE
          </span>
          <span className={`${styles.statusItem} ${styles.statusHideSm}`}>
            {MISSIONS.length} MISSIONS
          </span>
          <span className={`${styles.statusItem} ${styles.statusHideSm}`}>
            LOCAL GEMMA ONLY
          </span>
          <span className={`${styles.statusItem} ${styles.statusClock}`}>
            <ZuluClock />
          </span>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroArt} aria-hidden />
        <div className="container">
          <div className={styles.heroGrid}>
            <div className={`boot boot-1 ${styles.heroCopy}`}>
              <p className={`display ${styles.heroKicker}`}>
                Tactical mission arena · Season Zero
              </p>
              <h1 className={`display ${styles.heroTitle}`}>
                Anyone can get an AI answer.
                <br />
                Operators <span className={styles.heroCloud}>verify one</span>{" "}
                under pressure.
              </h1>
              <p className={styles.heroText}>
                CyberTrack drops you into timed technical incidents inside
                Cursor with a local Gemma model as your only AI. The evidence
                is incomplete, the clock is running, and the model is
                confidently wrong at least once. Make the call, cite your
                proof, and read the after-action report.
              </p>
              <div className={styles.heroActions}>
                <Link href="/missions" className="btn btn-primary">
                  View Missions
                </Link>
                <Link href="/qualification" className="btn btn-outline">
                  Set Up in 5 Minutes
                </Link>
              </div>
            </div>

            {/* Cursor cockpit sketch — the actual player loop at a glance */}
            <div
              className={`panel hud-corners boot boot-2 ${styles.cockpit}`}
              role="img"
              aria-label="Sketch of the Cursor cockpit: evidence files in the workspace, the answer artifact in the editor, and a local Gemma exchange where the operator catches a wrong claim"
            >
              <div className={styles.cockpitHead} aria-hidden>
                <span className={styles.winDots}>
                  <i /> <i /> <i />
                </span>
                <span className={`mono ${styles.cockpitTitle}`}>
                  Cursor · cyber-track
                </span>
                <span className={`mono ${styles.cockpitTag}`}>the cockpit</span>
              </div>
              <div className={`mono ${styles.cockpitBody}`} aria-hidden>
                <div className={styles.paneFiles}>
                  <span className={styles.paneLabel}>Evidence</span>
                  <div className={styles.fileRow}>relay_roster.txt</div>
                  <div className={styles.fileRow}>advisory.txt</div>
                  <div className={`${styles.fileRow} ${styles.fileActive}`}>
                    answer.json
                  </div>
                </div>
                <div className={styles.paneEditor}>
                  <span className={styles.paneLabel}>answer.json</span>
                  <pre className={styles.editorCode}>{`{
  "finding":
    "R-7 not in roster",
  "evidence": [
    "relay_roster.txt"
  ]
}`}</pre>
                </div>
                <div className={styles.paneChat}>
                  <span className={styles.paneLabel}>
                    local gemma · offline
                  </span>
                  <div className={`${styles.msg} ${styles.d1} ${styles.msgYou}`}>
                    Which relay does the advisory blame?
                  </div>
                  <div className={`${styles.msg} ${styles.d2} ${styles.msgAi}`}>
                    Relay R-7 caused the outage.
                  </div>
                  <div className={`${styles.msg} ${styles.d3} ${styles.chipRow}`}>
                    <VerifyChip kind="warning" compact />
                  </div>
                  <div className={`${styles.msg} ${styles.d4} ${styles.msgYou}`}>
                    R-7 isn&apos;t in the roster. <span className="amber">Verify.</span>
                  </div>
                  <div className={`${styles.msg} ${styles.d5} ${styles.msgAi}`}>
                    Correct. The claim fails against relay_roster.txt.
                  </div>
                  <div className={`${styles.msg} ${styles.d6} ${styles.chipRow}`}>
                    <VerifyChip kind="corrected" compact />
                  </div>
                </div>
              </div>
              <div className={`mono ${styles.cockpitArena}`} aria-hidden>
                <span className="pulse-dot" />
                <span className={styles.arenaLabel}>run active</span>
                <span className={styles.arenaMission}>
                  Signal Lost · T-07:42
                </span>
                <span className={`signal ${styles.arenaSubmit}`}>catch scored →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The loop ─────────────────────────────────────────────────── */}
      <section className={styles.loopSection}>
        <div className="container">
          <div className="section-label">
            <span className="idx">01</span> The Loop
          </div>
          <div className={styles.loop}>
            {LOOP.map((step, i) => (
              <div key={step.title} className={`panel ${styles.loopStep}`}>
                <div className={styles.loopHead}>
                  <span className={styles.loopIcon}>{step.icon}</span>
                  <span className={`mono ${styles.loopNum}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <span className={`display ${styles.loopTitle}`}>{step.title}</span>
                <span className={styles.loopNote}>{step.note}</span>
              </div>
            ))}
          </div>
          <p className={styles.loopFoot}>
            Cursor is the interface. Gemma is the local edge AI. The arena
            keeps score. Missions simulate the conditions where cloud AI is
            unavailable, untrusted, or inappropriate.
          </p>
        </div>
      </section>

      {/* ── What gets scored ─────────────────────────────────────────── */}
      <section className={styles.scoredSection}>
        <div className="container">
          <div className={styles.scoredGrid}>
            <div className={styles.scoredCopy}>
              <div className="section-label">
                <span className="idx">02</span> Scored On
              </div>
              <h2 className={`display ${styles.scoredTitle}`}>
                The skills that matter under uncertainty
              </h2>
              <p className={styles.scoredText}>
                Scoring is deterministic. No model grades you; every point
                traces to a check the run artifacts can prove. Speed is worth
                at most ten percent, and impossibly fast runs are flagged and
                earn nothing.
              </p>
              <ul className={styles.scoredList}>
                {SCORED_ON.map((s) => (
                  <li key={s.name}>
                    <span className={`display ${styles.scoredName}`}>{s.name}</span>
                    <span className={styles.scoredNote}>{s.note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AAR extract — the payoff */}
            <div className={`panel hud-corners ${styles.aarCard}`}>
              <div className={styles.aarHead}>
                <span className={`display ${styles.aarLabel}`}>
                  After-Action Report
                </span>
                <span className={`mono ${styles.aarMeta}`}>
                  sprint_signal_lost · 6:12
                </span>
              </div>
              <div className={styles.aarScoreRow}>
                <span className={`mono ${styles.aarScore}`}>
                  80<span className={styles.aarScoreMax}>/100</span>
                </span>
                <span className={styles.aarVerdict}>
                  Caught the model&apos;s bad hypothesis. Lost points shipping an
                  unverified patch.
                </span>
              </div>
              <div className={styles.aarChecks}>
                {AAR_CHECKS.map((c) => (
                  <div key={c.label} className={styles.aarCheck}>
                    <span
                      className={`mono ${styles.aarCheckMark}`}
                      style={{ color: c.pass ? "var(--signal)" : "var(--alert)" }}
                    >
                      {c.pass ? "✓" : "✕"}
                    </span>
                    <span className={styles.aarCheckLabel}>{c.label}</span>
                    <span className={`mono ${styles.aarCheckPts}`}>{c.pts}</span>
                  </div>
                ))}
              </div>
              <div className={styles.aarDims}>
                {AAR_DIMS.map((d) => (
                  <div key={d.label} className={styles.aarDim}>
                    <span className={`mono ${styles.aarDimLabel}`}>{d.label}</span>
                    <span className={styles.aarDimTrack}>
                      <span
                        className={styles.aarDimFill}
                        style={{
                          width: `${d.pct}%`,
                          background:
                            d.pct >= 80
                              ? "var(--signal)"
                              : d.pct >= 50
                              ? "var(--amber)"
                              : "var(--alert)",
                        }}
                      />
                    </span>
                    <span className={`mono ${styles.aarDimPct}`}>{d.pct}</span>
                  </div>
                ))}
              </div>
              <div className={`mono ${styles.aarFoot}`}>
                <IconOffline size={11} /> local model verified · telemetry
                intact · time within bounds
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Season Zero campaign rail ────────────────────────────────── */}
      <section className={styles.railSection}>
        <div className="container">
          <div className="section-label">
            <span className="idx">03</span> Season Zero Campaign
          </div>
          <div className={styles.rail}>
            {MISSIONS.map((m, i) => {
              const slope = slopeForDifficulty(m.difficulty);
              return (
                <Link key={m.id} href={`/missions/${m.id}`} className={styles.railStop}>
                  {i > 0 && (
                    <span
                      className={`${styles.railLine} ${lineClass(nodeState(i))}`}
                      aria-hidden
                    />
                  )}
                  <RailNode state={nodeState(i)} size={44}>
                    <MissionGlyph eventType={m.event_type} missionId={m.id} size={22} />
                  </RailNode>
                  <span className={`mono ${styles.railIndex}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={`display ${styles.railTitle}`}>{m.title}</span>
                  <span className={styles.railChips}>
                    <SlopeBadge slope={slope.id} label={slope.label} withLabel={false} size={12} />
                    <span className="mono">{m.timebox_minutes}m</span>
                    <span className="mono signal">+{m.xp_base}</span>
                  </span>
                </Link>
              );
            })}
          </div>
          <div className={styles.railFoot}>
            <div className={styles.slopeKey}>
              <SlopeBadge slope="green" label="Green: qualification" size={12} />
              <SlopeBadge slope="blue" label="Blue: sprint" size={12} />
              <SlopeBadge slope="black" label="Black: field" size={12} />
              <SlopeBadge slope="double-black" label="Double black: marathon" size={12} />
            </div>
            <Link href="/missions" className={styles.railLink}>
              Full mission board →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Setup CTA ────────────────────────────────────────────────── */}
      <section className={styles.bottomSection}>
        <div className="container">
          <div className={`panel ${styles.setupPanel}`}>
            <div className={styles.setupCopy}>
              <div className="section-label">
                <span className="idx">04</span> Fly It Yourself
              </div>
              <p>
                Cursor for the missions, Ollama for local Gemma, this arena
                for the score. No account, no API key. Claim a callsign and
                fly Basic Qualification in about five minutes.
              </p>
              <div className={styles.setupLinks}>
                {SETUP_LINKS.map((link) => (
                  <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.label} <IconExternal size={11} />
                  </a>
                ))}
              </div>
            </div>
            <div className={styles.setupActions}>
              <Link href="/qualification" className="btn btn-primary">
                Start Setup →
              </Link>
              <Link href="/leaderboard" className="btn btn-outline">
                <IconBars size={13} /> Arena Standings
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

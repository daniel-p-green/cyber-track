import Link from "next/link";
import { MISSIONS } from "@/lib/missions";
import { slopeForDifficulty } from "@/lib/utils";
import {
  MissionGlyph,
  RailNode,
  SlopeBadge,
  IconOffline,
  IconExternal,
  IconBars,
  type NodeState,
} from "./components/svg";
import ZuluClock from "./components/ZuluClock";
import VoiceBriefing from "./components/VoiceBriefing";
import { HERO_BRIEFING_ID, HERO_BRIEFING_TEXT } from "@/lib/briefing-audio";
import styles from "./page.module.css";

const LOOP = [
  {
    title: "Brief",
    note: "Pick a mission. Start the run, the timer arms.",
  },
  {
    title: "Evidence",
    note: "Read the logs, configs, and sitreps in the editor.",
  },
  {
    title: "Interrogate",
    note: "Ask local Gemma. It only knows what you show it.",
  },
  {
    title: "Decide",
    note: "Verify or reject its claims. File your call with citations.",
  },
  {
    title: "Debrief",
    note: "Deterministic score, after-action report, XP, rank.",
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
    <div className={styles.root} data-demo-flow>
      {/* ── Ops status strip ─────────────────────────────────────────── */}
      <div className={styles.statusStrip}>
        <div className={`container ${styles.statusInner}`}>
          <span className={styles.statusItem}>
            <span className="pulse-dot" /> SEASON ONE ACTIVE
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
          <div className={`boot boot-1 ${styles.heroCopy}`}>
            <p className={`display ${styles.heroKicker}`}>
              Tactical mission arena
            </p>
            <h1 className={styles.heroTitle}>
              Anyone can get an AI answer.
              <br />
              <span className={styles.heroDim}>
                Operators verify one under pressure.
              </span>
            </h1>
            <p className={styles.heroText}>
              CyberTrack drops you into timed technical incidents inside
              Cursor with a local Gemma model as your only AI. The evidence is
              incomplete, the clock is running, and the model is confidently
              wrong at least once. Make the call, cite your proof, read the
              after-action report.
            </p>
            <div className={styles.heroActions}>
              <Link href="/missions" className="btn btn-primary">
                View Missions
              </Link>
              <VoiceBriefing
                briefingId={HERO_BRIEFING_ID}
                text={HERO_BRIEFING_TEXT}
                label="Play briefing"
              />
              <Link href="/qualification" className={styles.heroQuiet}>
                Set up in 5 minutes →
              </Link>
            </div>
          </div>

          <dl className={`boot boot-3 ${styles.heroFacts}`}>
            <div className={styles.heroFact}>
              <dt>Interface</dt>
              <dd>Cursor</dd>
            </div>
            <div className={styles.heroFact}>
              <dt>Field AI</dt>
              <dd>Local Gemma, offline</dd>
            </div>
            <div className={styles.heroFact}>
              <dt>Scoring</dt>
              <dd>Deterministic, no model grades you</dd>
            </div>
            <div className={styles.heroFact}>
              <dt>Season One</dt>
              <dd>{MISSIONS.length} missions, XP, ranks</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ── The loop ─────────────────────────────────────────────────── */}
      <section className={styles.loopSection}>
        <div className="container">
          <div className="section-label">
            <span className="idx">01</span> The Loop
          </div>
          <ol className={styles.loop}>
            {LOOP.map((step, i) => (
              <li key={step.title} className={styles.loopStep}>
                <span className={`mono ${styles.loopNum}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={`display ${styles.loopTitle}`}>{step.title}</span>
                <span className={styles.loopNote}>{step.note}</span>
              </li>
            ))}
          </ol>
          <p className={styles.loopFoot}>
            Missions simulate the conditions where cloud AI is unavailable,
            untrusted, or inappropriate. The work happens in your editor; the
            arena keeps score.
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
              <h2 className={styles.scoredTitle}>
                The skills that matter under uncertainty
              </h2>
              <p className={styles.scoredText}>
                Every point traces to a check the run artifacts can prove.
                Speed is worth at most ten percent, and impossibly fast runs
                are flagged and earn nothing.
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
            <div className={`panel ${styles.aarCard}`}>
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

      {/* ── Season One campaign rail ────────────────────────────────── */}
      <section className={styles.railSection}>
        <div className="container">
          <div className="section-label">
            <span className="idx">03</span> Season One Campaign
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
          <div className={styles.setupPanel}>
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
                <a href="https://cursor.com?ref=CyberTrack" target="_blank" rel="noopener noreferrer">
                  Download Cursor <IconExternal size={11} />
                </a>
                <a href="https://ollama.com/download" target="_blank" rel="noopener noreferrer">
                  Install Ollama <IconExternal size={11} />
                </a>
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

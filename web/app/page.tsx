import Link from "next/link";
import { MISSIONS } from "@/lib/missions";
import { slopeForDifficulty } from "@/lib/utils";
import {
  MissionGlyph,
  RailNode,
  SlopeBadge,
  IconOffline,
  IconBars,
  type NodeState,
} from "./components/svg";
import styles from "./page.module.css";

const LOOP = [
  {
    title: "Brief",
    note: "Open the case.",
  },
  {
    title: "Read",
    note: "Inspect the files in Cursor.",
  },
  {
    title: "Ask",
    note: "Question local Gemma.",
  },
  {
    title: "Verify",
    note: "Check every claim.",
  },
  {
    title: "AAR",
    note: "Submit and review the score.",
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
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroArt} aria-hidden />
        <div className="container">
          <div className={`boot boot-1 ${styles.heroCopy}`}>
            <p className={`display ${styles.heroKicker}`}>
              Local Gemma · Cursor · After-action reports
            </p>
            <h1 className={styles.heroTitle}>
              The answer is not enough.
              <br />
              <span className={styles.heroDim}>
                Verify it under pressure.
              </span>
            </h1>
            <p className={styles.heroText}>
              Solve high-pressure incidents in Cursor with local Gemma. Evidence
              is incomplete, guidance is imperfect, and the AAR shows whether
              your reasoning held up.
            </p>
            <div className={styles.heroActions}>
              <Link href="/missions" className="btn btn-primary">
                View Missions
              </Link>
              <Link href="/qualification" className={styles.heroQuiet}>
                Set up →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── The loop ─────────────────────────────────────────────────── */}
      <section className={styles.loopSection}>
        <div className="container boot boot-2">
          <div className="section-label">Mission Flow</div>
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
        </div>
      </section>

      {/* ── What gets scored ─────────────────────────────────────────── */}
      <section className={styles.scoredSection}>
        <div className="container boot boot-3">
          <div className={styles.scoredGrid}>
            <div className={styles.scoredCopy}>
              <div className="section-label">Run Checks</div>
              <h2 className={styles.scoredTitle}>
                What the run measures
              </h2>
              <p className={styles.scoredText}>
                Scoring comes from run artifacts, not model vibes. Speed
                counts lightly; impossibly fast runs are flagged and earn
                nothing.
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
        <div className="container boot boot-4">
          <div className="section-label">Season One Campaign</div>
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
              Full missions →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Setup CTA ────────────────────────────────────────────────── */}
      <section className={styles.bottomSection}>
        <div className="container boot boot-5">
          <div className={styles.setupPanel}>
            <div className={styles.setupCopy}>
              <div className="section-label">Run It Yourself</div>
              <h2 className={styles.setupTitle}>Ready for Basic Qualification?</h2>
            </div>
            <div className={styles.setupActions}>
              <Link href="/qualification" className="btn btn-primary">
                Start Setup →
              </Link>
              <Link href="/leaderboard" className="btn btn-outline">
                <IconBars size={13} /> Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

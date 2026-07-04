import Link from "next/link";
import { MISSIONS } from "@/lib/missions";
import { getAllOperators, getAllSubmissions } from "@/lib/store";
import { getRankForXP } from "@/lib/ranks";
import { formatElapsed } from "@/lib/utils";
import {
  MissionGlyph,
  RailNode,
  GemmaStatus,
  IconTerminal,
  IconOffline,
  IconTimer,
  IconExternal,
  type NodeState,
} from "./components/svg";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

async function getCommandState() {
  const [ops, subs] = await Promise.all([getAllOperators(), getAllSubmissions()]);
  const cleanSubs = subs.filter((s) => !s.flags.suspicious_fast);
  const fastest = [...cleanSubs].sort((a, b) => a.elapsed_seconds - b.elapsed_seconds)[0];
  const topOperators = ops
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 5)
    .map((op) => ({
      ...op,
      rankInfo: getRankForXP(op.xp),
    }));

  return {
    topOperators,
    cleanCount: cleanSubs.length,
    suspiciousCount: subs.length - cleanSubs.length,
    fastest,
  };
}

const FLOW = [
  { num: "01", title: "Set up Cursor", desc: "The workspace is the cockpit" },
  { num: "02", title: "Run local Gemma", desc: "Ollama · offline · verified" },
  { num: "03", title: "Start a mission", desc: "Timer armed, evidence live" },
  { num: "04", title: "Submit evidence", desc: "Deterministic scoring" },
  { num: "05", title: "Read your AAR", desc: "Climb the arena board" },
];

const SETUP_LINKS = [
  { label: "Download Cursor", href: "https://cursor.com?ref=CyberTrack" },
  { label: "Cursor for Students", href: "https://cursor.com/students?ref=CyberTrack" },
  { label: "Install Ollama", href: "https://ollama.com/download" },
];

function nodeState(index: number): NodeState {
  if (index === 0) return "active";
  return "available";
}

export default async function Home() {
  const { topOperators, cleanCount, suspiciousCount, fastest } = await getCommandState();

  return (
    <div className={`${styles.root} ops-grid-bg`}>
      {/* ── Command hero ─────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <div className={styles.kicker}>
                <span className="pulse-dot" />
                Season Zero · Operational
              </div>
              <h1 className={`display ${styles.heroTitle}`}>
                Train decision quality when the{" "}
                <span className={styles.heroCloud}>cloud</span> goes dark.
              </h1>
              <p className={styles.heroText}>
                CyberTrack is a mission arena for AI operators. Timed missions run
                inside Cursor with a local Gemma4 model as your only AI. You are
                scored on evidence discipline, model skepticism, and recovery —
                not on how big a model you can rent.
              </p>
              <div className={styles.heroActions}>
                <Link href="/qualification" className="btn btn-primary">
                  Enter Season Zero
                </Link>
                <Link href="/missions" className="btn btn-outline">
                  Mission Board
                </Link>
              </div>
              <div className={styles.heroMeta}>
                <span><IconTerminal size={13} /> Cursor is the cockpit</span>
                <span><IconOffline size={13} /> No cloud AI in missions</span>
              </div>
            </div>

            {/* Cockpit preview panel */}
            <div className={`panel hud-corners ${styles.cockpit}`}>
              <div className={styles.cockpitHead}>
                <span className="display">Operator Cockpit</span>
                <GemmaStatus compact />
              </div>
              <div className={`mono ${styles.terminal}`}>
                <div className={styles.termLine}>
                  <span className={styles.prompt}>$</span> cybertf verify-model
                </div>
                <div className={styles.termOk}>
                  ● gemma4:latest · localhost:11434 · FIELD AI ONLINE
                </div>
                <div className={styles.termLine}>
                  <span className={styles.prompt}>$</span> cybertf run sprint_signal_lost
                </div>
                <div className={styles.termWarn}>
                  ▲ Timer armed · 10:00 · evidence required
                </div>
                <div className={styles.termLine}>
                  <span className={styles.prompt}>$</span> cybertf ask --file gateway.log
                </div>
              </div>
              <div className={styles.gemmaBlocks}>
                <div className={styles.gemmaHypothesis}>
                  <span className="display">Hypothesis needs verification</span>
                  <p>Model suggests packet loss due to storm cell — logs disagree.</p>
                </div>
                <div className={styles.gemmaCorrected}>
                  <span className="display">Operator corrected</span>
                  <p>Root cause: MTU mismatch after config push. Patched.</p>
                </div>
              </div>
              <div className={styles.scoreStrip}>
                <div><span className="display">Evidence</span><strong className="mono">92</strong></div>
                <div><span className="display">Skepticism</span><strong className="mono">88</strong></div>
                <div><span className="display">Recovery</span><strong className="mono">94</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Season Zero progression rail ─────────────────────────────── */}
      <section className={styles.railSection}>
        <div className="container">
          <div className="section-label">
            <span className="idx">01</span> Season Zero Campaign
          </div>
          <div className={styles.rail}>
            {MISSIONS.map((m, i) => {
              const state = nodeState(i);
              return (
                <Link key={m.id} href={`/missions/${m.id}`} className={styles.railStop}>
                  {i > 0 && <span className={styles.railLine} aria-hidden />}
                  <RailNode state={state} size={44}>
                    <MissionGlyph eventType={m.event_type} missionId={m.id} size={22} />
                  </RailNode>
                  <span className={`mono ${styles.railIndex}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={`display ${styles.railTitle}`}>{m.title.replace(/^(Relay|Marathon): /, "")}</span>
                  <span className={styles.railChips}>
                    <span className="mono">{m.timebox_minutes}m</span>
                    <span className="mono signal">+{m.xp_base} XP</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── The loop ─────────────────────────────────────────────────── */}
      <section className={styles.flowSection}>
        <div className="container">
          <div className={styles.flowHead}>
            <div>
              <div className="section-label">
                <span className="idx">02</span> The Mission Loop
              </div>
              <h2 className={`display ${styles.sectionTitle}`}>
                One complete decision cycle, every mission.
              </h2>
            </div>
            <p className={styles.flowNote}>
              The arena rewards verified action. The field AI helps — but it only
              knows what you show it, and it is sometimes wrong on purpose.
            </p>
          </div>
          <div className={styles.flow}>
            {FLOW.map((step) => (
              <div key={step.num} className={styles.flowStep}>
                <span className={`mono ${styles.flowNum}`}>{step.num}</span>
                <strong className="display">{step.title}</strong>
                <span>{step.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Arena status + setup + top operators ─────────────────────── */}
      <section className={styles.bottomSection}>
        <div className="container">
          <div className={styles.bottomGrid}>
            <div className={`panel ${styles.setupPanel}`}>
              <div className="section-label">
                <span className="idx">03</span> Bring Your Own Cockpit
              </div>
              <p>
                CyberTrack runs in tools operators already use: Cursor for the
                workspace, Ollama for local Gemma4, this arena for the scoreboard.
              </p>
              <div className={styles.setupLinks}>
                {SETUP_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label} <IconExternal size={11} />
                  </a>
                ))}
              </div>
              <div className={styles.statRow}>
                <div>
                  <strong className="mono">{MISSIONS.length}</strong>
                  <span className="display">Missions</span>
                </div>
                <div>
                  <strong className="mono">{cleanCount}</strong>
                  <span className="display">Verified Runs</span>
                </div>
                <div>
                  <strong className="mono amber">{suspiciousCount}</strong>
                  <span className="display">Flagged Times</span>
                </div>
                <div>
                  <strong className="mono">
                    {fastest ? (
                      <>
                        <IconTimer size={12} /> {formatElapsed(fastest.elapsed_seconds)}
                      </>
                    ) : (
                      "--"
                    )}
                  </strong>
                  <span className="display">Fastest Clean</span>
                </div>
              </div>
            </div>

            <div className={`panel ${styles.leaderPanel}`}>
              <div className={styles.leaderHead}>
                <span className="display">Top Operators</span>
                <Link href="/leaderboard" className={styles.leaderLink}>
                  Full arena →
                </Link>
              </div>
              <table className={styles.leaderTable}>
                <tbody>
                  {topOperators.map((op, i) => (
                    <tr key={op.callsign}>
                      <td className="mono">{String(i + 1).padStart(2, "0")}</td>
                      <td>
                        <Link href={`/operators/${op.callsign}`} className="mono">
                          {op.callsign}
                        </Link>
                      </td>
                      <td className={styles.leaderRank}>
                        <span className="display">{op.rank}</span>
                      </td>
                      <td className={`mono ${styles.leaderXp}`}>
                        {op.xp.toLocaleString()} XP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

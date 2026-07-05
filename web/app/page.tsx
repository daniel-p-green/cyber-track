import Link from "next/link";
import { MISSIONS } from "@/lib/missions";
import { getAllOperators, getAllSubmissions } from "@/lib/store";
import { getRankForXP } from "@/lib/ranks";
import { formatElapsed, slopeForDifficulty } from "@/lib/utils";
import {
  MissionGlyph,
  RailNode,
  SlopeBadge,
  IconChat,
  IconOffline,
  IconExternal,
  type NodeState,
} from "./components/svg";
import ZuluClock from "./components/ZuluClock";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

async function getCommandState() {
  const [ops, subs] = await Promise.all([getAllOperators(), getAllSubmissions()]);
  const cleanSubs = subs.filter((s) => !s.flags.suspicious_fast);
  const topOperators = ops
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 5)
    .map((op) => ({ ...op, rankInfo: getRankForXP(op.xp) }));

  return {
    topOperators,
    operatorCount: ops.length,
    cleanCount: cleanSubs.length,
    flaggedCount: subs.length - cleanSubs.length,
    fastest: [...cleanSubs].sort((a, b) => a.elapsed_seconds - b.elapsed_seconds)[0],
  };
}

const COCKPIT_DUTIES = [
  "Open the mission workspace",
  "Read the evidence files in the editor",
  "Ask Cursor Chat — local Gemma, no cloud",
  "Verify the model, then edit answer.json",
];

const ARENA_DUTIES = [
  "Claim a callsign",
  "Start the mission — timer arms instantly",
  "Submit your answer and evidence",
  "Get your AAR, XP, and rank",
];

const SETUP_LINKS = [
  { label: "Download Cursor", href: "https://cursor.com?ref=CyberTrack" },
  { label: "Cursor for Students", href: "https://cursor.com/students?ref=CyberTrack" },
  { label: "Install Ollama", href: "https://ollama.com/download" },
];

function nodeState(index: number): NodeState {
  return index === 0 ? "active" : "available";
}

export default async function Home() {
  const { topOperators, operatorCount, cleanCount, flaggedCount, fastest } =
    await getCommandState();

  return (
    <div className={`${styles.root} ops-grid-bg`}>
      {/* ── Ops status strip ─────────────────────────────────────────── */}
      <div className={styles.statusStrip}>
        <div className={`container ${styles.statusInner}`}>
          <span className={styles.statusItem}>
            <span className="pulse-dot" /> SEASON ZERO — ACTIVE
          </span>
          <span className={`${styles.statusItem} ${styles.statusHideSm}`}>
            OPERATORS <strong className="mono">{operatorCount}</strong>
          </span>
          <span className={`${styles.statusItem} ${styles.statusHideSm}`}>
            VERIFIED RUNS <strong className="mono">{cleanCount}</strong>
          </span>
          <span className={`${styles.statusItem} ${styles.statusHideMd}`}>
            FLAGGED <strong className="mono amber">{flaggedCount}</strong>
          </span>
          <span className={`${styles.statusItem} ${styles.statusClock}`}>
            <ZuluClock />
          </span>
        </div>
      </div>

      {/* ── Command hero ─────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroArt} aria-hidden />
        <div className="container">
          <div className={styles.heroGrid}>
            <div className={`boot boot-1 ${styles.heroCopy}`}>
              <p className={`display ${styles.heroKicker}`}>
                Call of Duty for AI operators
              </p>
              <h1 className={`display ${styles.heroTitle}`}>
                Fly the mission in Cursor.
                <br />
                <span className={styles.heroCloud}>Local Gemma</span> is your
                only AI. Scored here.
              </h1>
              <p className={styles.heroText}>
                Timed technical operations where the enemy is uncertainty, bad
                AI guidance, and incomplete evidence. Gemma runs on your own
                machine — for edge deployments where cloud AI is unavailable,
                untrusted, or too slow. Submit your evidence here and get
                scored on whether you verified, challenged, and recovered.
              </p>
              <div className={styles.heroActions}>
                <Link href="/qualification" className="btn btn-primary">
                  Enter Season Zero
                </Link>
                <Link href="/missions" className="btn btn-outline">
                  Mission Board
                </Link>
              </div>
            </div>

            {/* Cursor cockpit preview — editor + chat + arena in-app browser */}
            <div
              className={`panel hud-corners boot boot-2 ${styles.cockpit}`}
              role="img"
              aria-label="Preview of the Cursor cockpit: evidence files in the workspace, answer.json in the editor, Cursor Chat with local Gemma, and the CyberTrack arena in the in-app browser"
            >
              <div className={styles.cockpitHead} aria-hidden>
                <span className={styles.winDots}>
                  <i /> <i /> <i />
                </span>
                <span className={`mono ${styles.cockpitTitle}`}>
                  Cursor — cyber-track
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
                    Cursor Chat · Gemma (local)
                  </span>
                  <div className={`${styles.msg} ${styles.msgYou}`}>
                    Which relay does the advisory blame?
                  </div>
                  <div className={`${styles.msg} ${styles.msgAi}`}>
                    Relay R-7 caused the outage.
                  </div>
                  <div className={`${styles.msg} ${styles.msgYou}`}>
                    R-7 isn&apos;t in the roster. <span className="amber">Verify.</span>
                  </div>
                  <div className={`${styles.msg} ${styles.msgAi}`}>
                    Correct — the claim fails against relay_roster.txt.
                  </div>
                </div>
              </div>
              <div className={`mono ${styles.cockpitArena}`} aria-hidden>
                <span className="pulse-dot" />
                <span className={styles.arenaLabel}>
                  arena · in-app browser
                </span>
                <span className={styles.arenaMission}>
                  Basic Qualification · T-15:00
                </span>
                <span className={`signal ${styles.arenaSubmit}`}>Submit run →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cockpit ⇄ Arena split — the architecture in one glance ───── */}
      <section className={styles.splitSection}>
        <div className="container">
          <div className={`panel boot boot-3 ${styles.split}`}>
            <div className={styles.splitCol}>
              <div className={styles.splitHead}>
                <IconChat size={16} />
                <div>
                  <span className={`display ${styles.splitName}`}>Cursor — the cockpit</span>
                  <span className={styles.splitSub}>editor + chat + evidence — the work happens here</span>
                </div>
              </div>
              <ul className={styles.splitList}>
                {COCKPIT_DUTIES.map((d, i) => (
                  <li key={d}>
                    <span className={`mono ${styles.splitNum}`}>{String(i + 1).padStart(2, "0")}</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.splitSpine} aria-hidden>
              <span className={`mono ${styles.spineCmd}`}>cybertf publish</span>
              <svg width="34" height="12" viewBox="0 0 34 12" fill="none" stroke="var(--signal)" strokeWidth="1.6">
                <path d="M0 6h28M23 1.5 30 6l-7 4.5" />
              </svg>
            </div>

            <div className={styles.splitCol}>
              <div className={styles.splitHead}>
                <IconOffline size={16} />
                <div>
                  <span className={`display ${styles.splitName}`}>CyberTrack — the arena</span>
                  <span className={styles.splitSub}>missions, submissions, scores — open it in Cursor&apos;s browser</span>
                </div>
              </div>
              <ul className={styles.splitList}>
                {ARENA_DUTIES.map((d, i) => (
                  <li key={d}>
                    <span className={`mono ${styles.splitNum}`}>{String(i + 1).padStart(2, "0")}</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className={styles.splitNote}>
            The skill being scored is how you work with the model — asking
            sharp questions, feeding it the right evidence, catching it when
            it&apos;s wrong. A small <code className="mono">cybertf</code> CLI
            handles timing and scoring in the background. No cloud AI anywhere
            in the loop.
          </p>
        </div>
      </section>

      {/* ── Season Zero campaign rail ────────────────────────────────── */}
      <section className={styles.railSection}>
        <div className="container">
          <div className="section-label">
            <span className="idx">01</span> Season Zero Campaign
          </div>
          <div className={styles.rail}>
            {MISSIONS.map((m, i) => {
              const slope = slopeForDifficulty(m.difficulty);
              return (
                <Link key={m.id} href={`/missions/${m.id}`} className={styles.railStop}>
                  {i > 0 && <span className={styles.railLine} aria-hidden />}
                  <RailNode state={nodeState(i)} size={44}>
                    <MissionGlyph eventType={m.event_type} missionId={m.id} size={22} />
                  </RailNode>
                  <span className={`mono ${styles.railIndex}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={`display ${styles.railTitle}`}>
                    {m.title.replace(/^(Relay|Marathon): /, "")}
                  </span>
                  <span className={styles.railChips}>
                    <SlopeBadge slope={slope.id} label={slope.label} withLabel={false} size={12} />
                    <span className="mono">{m.timebox_minutes}m</span>
                    <span className="mono signal">+{m.xp_base}</span>
                  </span>
                </Link>
              );
            })}
          </div>
          <div className={styles.slopeKey}>
            <SlopeBadge slope="green" label="Green — qualification" size={12} />
            <SlopeBadge slope="blue" label="Blue — sprint" size={12} />
            <SlopeBadge slope="black" label="Black — advanced field" size={12} />
            <SlopeBadge slope="double-black" label="Double black — marathon" size={12} />
          </div>
        </div>
      </section>

      {/* ── Arena board + setup ──────────────────────────────────────── */}
      <section className={styles.bottomSection}>
        <div className="container">
          <div className={styles.bottomGrid}>
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
              <div className={styles.leaderFoot}>
                {fastest && (
                  <span className="mono">
                    fastest clean run {formatElapsed(fastest.elapsed_seconds)}
                  </span>
                )}
                <span className="mono amber">{flaggedCount} flagged times</span>
              </div>
            </div>

            <div className={`panel ${styles.setupPanel}`}>
              <div className="section-label">
                <span className="idx">02</span> Bring Your Own Cockpit
              </div>
              <p>
                Cursor for the missions. Ollama for local Gemma. This arena for
                the score — keep it open in Cursor&apos;s in-app browser. Setup
                takes about five minutes.
              </p>
              <div className={styles.setupLinks}>
                {SETUP_LINKS.map((link) => (
                  <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.label} <IconExternal size={11} />
                  </a>
                ))}
              </div>
              <Link href="/qualification" className={`btn btn-primary ${styles.setupCta}`}>
                Start Setup →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

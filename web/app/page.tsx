import Link from "next/link";
import { MISSIONS } from "@/lib/missions";
import { getAllOperators, getAllSubmissions } from "@/lib/store";
import { getRankForXP } from "@/lib/ranks";
import { formatElapsed, slopeForDifficulty } from "@/lib/utils";
import {
  MissionGlyph,
  RailNode,
  SlopeBadge,
  IconTerminal,
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
  "Inspect the evidence",
  "Ask local Gemma4 — your only AI",
  "Patch configs and code",
  "Write answer.json",
];

const ARENA_DUTIES = [
  "Claim a callsign",
  "Start missions — timer arms instantly",
  "Submit your run for scoring",
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
              <h1 className={`display ${styles.heroTitle}`}>
                Train decision quality when the{" "}
                <span className={styles.heroCloud}>cloud</span> goes dark.
              </h1>
              <p className={styles.heroText}>
                An arena for AI operators. Fly timed missions in Cursor with
                local Gemma4 as your only AI. Get scored on judgment — evidence,
                skepticism, recovery.
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

            {/* Cockpit live feed */}
            <div className={`panel hud-corners boot boot-2 ${styles.cockpit}`}>
              <div className={styles.cockpitHead}>
                <span className="display">Cockpit Feed</span>
                <span className={`mono ${styles.cockpitTag}`}>cursor · terminal</span>
              </div>
              <div className={`mono ${styles.terminal}`}>
                <div className={styles.termLine}>
                  <span className={styles.prompt}>$</span> cybertf verify-model
                </div>
                <div className={`${styles.termLine} ${styles.termOk}`}>
                  ● gemma4:latest · localhost:11434 · FIELD AI ONLINE
                </div>
                <div className={styles.termLine}>
                  <span className={styles.prompt}>$</span> cybertf run sprint_signal_lost
                </div>
                <div className={`${styles.termLine} ${styles.termWarn}`}>
                  ▲ timer armed · 10:00 · evidence required
                </div>
                <div className={styles.termLine}>
                  <span className={styles.prompt}>$</span> cybertf ask --file gateway.log
                </div>
                <div className={`${styles.termLine} ${styles.termDim}`}>
                  model hypothesis: storm cell — <span className="amber">unverified</span>
                </div>
                <div className={styles.termLine}>
                  <span className={styles.prompt}>$</span> cybertf submit … answer.json
                </div>
                <div className={`${styles.termLine} ${styles.termOk}`}>
                  ✓ scored 100/100 · AAR written · +375 XP
                </div>
                <div className={`${styles.termLine} ${styles.termCursor}`} aria-hidden>
                  <span className={styles.prompt}>$</span> <span className={styles.block} />
                </div>
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
                <IconTerminal size={16} />
                <div>
                  <span className={`display ${styles.splitName}`}>Cursor — the cockpit</span>
                  <span className={styles.splitSub}>where the mission work happens</span>
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
                  <span className={styles.splitSub}>where the run gets scored</span>
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
            CyberTrack doesn&apos;t replace Cursor — it keeps score around it.
            No cloud AI anywhere in the loop.
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
                Cursor for the missions. Ollama for local Gemma4. This arena for
                the score. Setup takes about five minutes.
              </p>
              <div className={styles.setupLinks}>
                {SETUP_LINKS.map((link) => (
                  <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.label} <IconExternal size={11} />
                  </a>
                ))}
              </div>
              <Link href="/qualification" className={`btn btn-primary ${styles.setupCta}`}>
                Run the Deployment Protocol →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

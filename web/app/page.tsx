import Link from "next/link";
import { MISSIONS } from "@/lib/missions";
import { getAllOperators, getAllSubmissions } from "@/lib/store";
import { getRankForXP } from "@/lib/ranks";
import { difficultyPips, eventTypeLabel, eventTypeColor, formatElapsed } from "@/lib/utils";
import EnlistForm from "./components/EnlistForm";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

async function getTopOperators() {
  const [ops, subs] = await Promise.all([getAllOperators(), getAllSubmissions()]);
  const sorted = ops.sort((a, b) => b.xp - a.xp).slice(0, 5);
  return sorted.map((op) => ({
    ...op,
    rankInfo: getRankForXP(op.xp),
    missionsCompleted: subs.filter(
      (s) => s.callsign === op.callsign && !s.flags.suspicious_fast
    ).length,
  }));
}

export default async function Home() {
  const top5 = await getTopOperators();
  const featuredMissions = MISSIONS.slice(0, 4);

  return (
    <div className={styles.root}>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={`tag tag-signal ${styles.heroBadge}`}>
              <span>●</span> GEMMA4 · LOCAL · OFFLINE · SEASON ZERO
            </div>
            <h1 className={`display ${styles.heroTitle}`}>
              CYBER
              <span className={styles.heroAccent}>TRACK</span>
              <span className={styles.cursor}>█</span>
            </h1>
            <p className={styles.heroTagline}>
              Offline AI operator readiness in Cursor,<br />
              powered by local Gemma4
            </p>
            <p className={styles.heroSubtext}>
              Complete timed missions using only your local Gemma4 field AI.
              Verify the model. Catch the hallucination. Recover from the bad hint.
              Submit scored artifacts. Climb the Season Zero scoreboard.
            </p>
            <div className={styles.heroCTA}>
              <Link href="/qualification" className="btn btn-primary">
                Enlist Now →
              </Link>
              <Link href="/missions" className="btn btn-outline">
                View Missions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className={styles.howSection}>
        <div className="container">
          <div className="section-label">How It Works</div>
          <div className={styles.howGrid}>
            {[
              {
                step: "01",
                title: "Enlist",
                desc: "Choose a callsign. No account required — your callsign is your identity in the arena.",
              },
              {
                step: "02",
                title: "Run missions in Cursor",
                desc: "Open the mission workspace. Your only AI is local Gemma4 via Ollama. No cloud, no cheating.",
              },
              {
                step: "03",
                title: "Submit artifacts, climb the scoreboard",
                desc: "Publish your scored run artifact. Watch your rank and Season Zero position update in real time.",
              },
            ].map((item) => (
              <div key={item.step} className={`panel ${styles.howCard}`}>
                <div className={`mono ${styles.howStep}`}>{item.step}</div>
                <div className={`display ${styles.howTitle}`}>{item.title}</div>
                <p className={styles.howDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Enlist form ──────────────────────────────────────────────────── */}
      <section className={styles.enlistSection}>
        <div className="container">
          <div className={`panel ${styles.enlistPanel}`}>
            <h2 className={`display ${styles.enlistTitle}`}>Enlist · Claim Your Callsign</h2>
            <p className={styles.enlistDesc}>
              Pick a callsign (3-20 chars, A-Z, 0-9, hyphen). This is your identity on the scoreboard.
            </p>
            <EnlistForm />
          </div>
        </div>
      </section>

      {/* ── Mission board preview ────────────────────────────────────────── */}
      <section className={styles.missionsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className="section-label">Mission Board · Season Zero</div>
            <Link href="/missions" className={styles.viewAll}>
              View All →
            </Link>
          </div>
          <div className={styles.missionGrid}>
            {featuredMissions.map((m) => (
              <Link
                key={m.id}
                href={`/missions/${m.id}`}
                className={`panel ${styles.missionCard}`}
              >
                <div className={styles.missionCardTop}>
                  <span className={`tag ${eventTypeColor(m.event_type)}`}>
                    {eventTypeLabel(m.event_type)}
                  </span>
                  <span className={`mono ${styles.diffPips}`}>
                    {difficultyPips(m.difficulty)}
                  </span>
                </div>
                <div className={`display ${styles.missionTitle}`}>{m.title}</div>
                <p className={styles.missionSummary}>{m.summary}</p>
                <div className={styles.missionMeta}>
                  <span className="mono" style={{ color: "var(--amber)", fontSize: "12px" }}>
                    ⏱ {m.timebox_minutes}m
                  </span>
                  <span className="mono" style={{ color: "var(--signal)", fontSize: "12px" }}>
                    +{m.xp_base} XP
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top 5 leaderboard strip ──────────────────────────────────────── */}
      <section className={styles.leaderSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className="section-label">Scoreboard · Top Operators</div>
            <Link href="/leaderboard" className={styles.viewAll}>
              Full Scoreboard →
            </Link>
          </div>
          <div className={`panel ${styles.leaderPanel}`}>
            <table className={styles.leaderTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Callsign</th>
                  <th>Rank</th>
                  <th>XP</th>
                  <th>Missions</th>
                </tr>
              </thead>
              <tbody>
                {top5.map((op, i) => (
                  <tr key={op.callsign}>
                    <td className="mono" style={{ color: "var(--muted)" }}>{i + 1}</td>
                    <td>
                      <Link href={`/operators/${op.callsign}`} className="mono" style={{ color: "var(--ice)" }}>
                        {op.callsign}
                      </Link>
                      {op.seeded && (
                        <span className={`tag tag-muted ${styles.seedTag}`}>seed</span>
                      )}
                    </td>
                    <td>
                      <span style={{ color: "var(--amber)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                        {op.rankInfo.glyph}
                      </span>{" "}
                      <span className="display" style={{ fontSize: "12px", color: "var(--muted)" }}>
                        {op.rank}
                      </span>
                    </td>
                    <td className="mono" style={{ color: "var(--signal)" }}>{op.xp.toLocaleString()}</td>
                    <td className="mono" style={{ color: "var(--muted)" }}>{op.missionsCompleted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

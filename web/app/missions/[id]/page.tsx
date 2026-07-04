import { notFound } from "next/navigation";
import Link from "next/link";
import { MISSIONS } from "@/lib/missions";
import { getSubmissionsForMission, getAllOperators } from "@/lib/store";
import { getRankForXP } from "@/lib/ranks";
import { difficultyPips, eventTypeLabel, eventTypeColor, formatElapsed } from "@/lib/utils";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return MISSIONS.map((m) => ({ id: m.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MissionBriefing({ params }: Props) {
  const { id } = await params;
  const mission = MISSIONS.find((m) => m.id === id);
  if (!mission) notFound();

  const [subs, ops] = await Promise.all([
    getSubmissionsForMission(id),
    getAllOperators(),
  ]);
  const opsMap = new Map(ops.map((o) => [o.callsign, o]));

  const sortedSubs = [...subs].sort((a, b) => {
    if (a.flags.suspicious_fast && !b.flags.suspicious_fast) return 1;
    if (!a.flags.suspicious_fast && b.flags.suspicious_fast) return -1;
    return b.total - a.total || a.elapsed_seconds - b.elapsed_seconds;
  });

  return (
    <div className={styles.root}>
      <div className="container">
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/missions">← Mission Board</Link>
          <span className="muted"> / {mission.title}</span>
        </div>

        <div className={styles.layout}>
          {/* ── Left: briefing ─────────────────────────────────────────── */}
          <div className={styles.main}>
            <div className={styles.missionHeader}>
              <div className={styles.headerTop}>
                <span className={`tag ${eventTypeColor(mission.event_type)}`}>
                  {eventTypeLabel(mission.event_type)}
                </span>
                <span className={`mono ${styles.pips}`}>
                  {difficultyPips(mission.difficulty)}
                </span>
              </div>
              <h1 className={`display ${styles.title}`}>{mission.title}</h1>
              <p className={styles.summary}>{mission.summary}</p>
            </div>

            {/* Meta strip */}
            <div className={`panel-2 ${styles.metaStrip}`}>
              <div className={styles.metaItem}>
                <span className={`display ${styles.metaLabel}`}>Timebox</span>
                <span className={`mono ${styles.metaValue}`} style={{ color: "var(--amber)" }}>
                  {mission.timebox_minutes}m
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={`display ${styles.metaLabel}`}>XP Base</span>
                <span className={`mono ${styles.metaValue}`} style={{ color: "var(--signal)" }}>
                  +{mission.xp_base}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={`display ${styles.metaLabel}`}>Difficulty</span>
                <span className={`mono ${styles.metaValue}`} style={{ color: "var(--amber)" }}>
                  {mission.difficulty} / 5
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={`display ${styles.metaLabel}`}>Season</span>
                <span className={`mono ${styles.metaValue}`} style={{ color: "var(--ice)" }}>
                  ZERO
                </span>
              </div>
            </div>

            {/* Skills */}
            <div className={`panel ${styles.section}`}>
              <div className="section-label">Skills Tested</div>
              <div className={styles.skillList}>
                {mission.skills.map((s) => (
                  <span key={s} className={`tag tag-muted`}>{s}</span>
                ))}
              </div>
            </div>

            {/* Cockpit instructions */}
            <div className={`panel ${styles.section}`}>
              <div className="section-label">Fly It in Cursor</div>
              <p className={styles.cockpitIntro}>
                Open the CyberTrack mission workspace in Cursor. Run these commands in the integrated terminal:
              </p>
              <div className={`panel-2 ${styles.codeBlock}`}>
                <div className={`mono ${styles.codeLine}`}>
                  <span className={styles.prompt}>$</span>{" "}
                  <span style={{ color: "var(--signal)" }}>cybertf run</span>{" "}
                  <span style={{ color: "var(--ice)" }}>{mission.id}</span>
                </div>
                <div className={`mono ${styles.codeLine}`}>
                  <span className={styles.prompt}>$</span>{" "}
                  <span style={{ color: "var(--signal)" }}>cybertf ask</span>{" "}
                  <span style={{ color: "var(--amber)" }}>&quot;What does the log indicate?&quot;</span>
                </div>
                <div className={`mono ${styles.codeLine}`}>
                  <span className={styles.prompt}>$</span>{" "}
                  <span style={{ color: "var(--signal)" }}>cybertf submit</span>{" "}
                  <span style={{ color: "var(--ice)" }}>{mission.id} answer.json</span>
                </div>
                <div className={`mono ${styles.codeLine}`}>
                  <span className={styles.prompt}>$</span>{" "}
                  <span style={{ color: "var(--signal)" }}>cybertf publish</span>{" "}
                  <span style={{ color: "var(--muted)" }}>&lt;run_id&gt;</span>
                </div>
              </div>
              <p className={styles.cockpitNote}>
                Your local Gemma4 model must be running via Ollama at{" "}
                <code className="mono">localhost:11434</code> before you start.
                Run <code className="mono">cybertf verify-model</code> to confirm.
              </p>
            </div>
          </div>

          {/* ── Right: leaderboard ────────────────────────────────────── */}
          <aside className={styles.aside}>
            <div className="section-label">Top Runs · {mission.title}</div>
            <div className={`panel ${styles.leaderPanel}`}>
              {sortedSubs.length === 0 ? (
                <div className={styles.empty}>No submissions yet. Be first.</div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Callsign</th>
                      <th>Score</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSubs.map((sub, i) => {
                      const op = opsMap.get(sub.callsign);
                      const rankInfo = getRankForXP(op?.xp ?? 0);
                      const isSuspicious = sub.flags.suspicious_fast;
                      return (
                        <tr key={sub.run_id} className={isSuspicious ? styles.suspicious : ""}>
                          <td className="mono muted">{isSuspicious ? "—" : i + 1}</td>
                          <td>
                            <Link
                              href={`/operators/${sub.callsign}`}
                              className={`mono ${styles.callsign}`}
                              style={{ color: isSuspicious ? "var(--muted)" : "var(--ice)" }}
                            >
                              {sub.callsign}
                            </Link>
                            {sub.seeded && (
                              <span className="tag tag-muted" style={{ fontSize: "9px", marginLeft: "4px" }}>
                                seed
                              </span>
                            )}
                          </td>
                          <td className="mono" style={{ color: isSuspicious ? "var(--muted)" : "var(--signal)" }}>
                            {sub.total}/{sub.max_total}
                          </td>
                          <td className="mono muted">{formatElapsed(sub.elapsed_seconds)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Suspicious flag explanation */}
            {sortedSubs.some((s) => s.flags.suspicious_fast) && (
              <div className={`tag tag-alert ${styles.flagNote}`}>
                UNVERIFIED · SUSPICIOUS TIME rows are excluded from podium positions.
              </div>
            )}

            <Link href="/leaderboard" className={`btn btn-outline ${styles.fullBoard}`}>
              Full Scoreboard →
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

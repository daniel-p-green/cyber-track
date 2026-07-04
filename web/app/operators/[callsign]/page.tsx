import { notFound } from "next/navigation";
import Link from "next/link";
import { getOperator, getSubmissionsByCallsign, Submission } from "@/lib/store";
import { getRankForXP, getNextRank, RANKS } from "@/lib/ranks";
import { MISSIONS } from "@/lib/missions";
import { formatElapsed } from "@/lib/utils";
import {
  MissionGlyph,
  RankPlate,
  RankChevrons,
  IconGitHub,
  IconX,
  IconSuspicious,
  IconOffline,
  IconTimer,
} from "../../components/svg";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ callsign: string }>;
}

function xpProgressPct(xp: number): number {
  const current = getRankForXP(xp);
  const next = getNextRank(xp);
  if (!next) return 100;
  const range = next.xp_min - current.xp_min;
  const progress = xp - current.xp_min;
  return Math.min(100, Math.round((progress / range) * 100));
}

function getBestDimensions(subs: Submission[]): Record<string, { points: number; max: number }> {
  const best: Record<string, { points: number; max: number }> = {};
  for (const sub of subs) {
    if (sub.flags.suspicious_fast) continue;
    for (const [key, val] of Object.entries(sub.dimensions)) {
      if (!best[key] || val.points / Math.max(val.max, 1) > best[key].points / Math.max(best[key].max, 1)) {
        best[key] = val;
      }
    }
  }
  return best;
}

const DIM_LABELS: Record<string, string> = {
  mission_completion: "Mission Completion",
  evidence_discipline: "Evidence Discipline",
  hallucination_resistance: "Hallucination Resistance",
  tool_reliability: "Tool Reliability",
  prompt_discipline: "Prompt Discipline",
  communication_quality: "Communication Quality",
  recovery_from_bad_ai_guidance: "AI Recovery",
  time_to_signal: "Time to Signal",
  local_offline_compliance: "Offline Compliance",
  terminal_recovery: "Terminal Recovery",
};

export default async function OperatorRecordPage({ params }: Props) {
  const { callsign } = await params;
  const upper = callsign.toUpperCase();
  const [operator, subs] = await Promise.all([
    getOperator(upper),
    getSubmissionsByCallsign(upper),
  ]);

  if (!operator) notFound();

  const rankInfo = getRankForXP(operator.xp);
  const rankTier = RANKS.findIndex((r) => r.name === rankInfo.name) + 1;
  const nextRank = getNextRank(operator.xp);
  const progressPct = xpProgressPct(operator.xp);
  const cleanSubs = subs.filter((s) => !s.flags.suspicious_fast);
  const bestDims = getBestDimensions(subs);

  const completedMissionIds = new Set(cleanSubs.map((s) => s.mission_id));
  const bestClean = [...cleanSubs].sort((a, b) => a.elapsed_seconds - b.elapsed_seconds)[0];
  const localRuns = cleanSubs.filter((s) => s.local_model && !s.local_model.simulated).length;
  const compliancePct =
    cleanSubs.length > 0 ? Math.round((localRuns / cleanSubs.length) * 100) : null;

  const sortedSubs = [...subs].sort(
    (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
  );

  return (
    <div className={styles.root}>
      <div className="container">
        <div className={styles.breadcrumb}>
          <Link href="/leaderboard">← Arena</Link>
        </div>

        <div className={styles.layout}>
          {/* ── Aside: operator plate ─────────────────────────────────── */}
          <aside className={styles.aside}>
            <div className={`panel hud-corners ${styles.profileCard}`}>
              <div className={styles.plateRow}>
                <RankPlate letter={operator.callsign[0]} size={52} />
                <div>
                  <div className={`mono ${styles.callsign}`}>{operator.callsign}</div>
                  <div className={styles.rankRow}>
                    <RankChevrons tier={rankTier} size={9} />
                    <span className={`display ${styles.rankName}`}>{rankInfo.name}</span>
                  </div>
                </div>
              </div>
              {operator.seeded && (
                <span className={`mono ${styles.seedNote}`} title="Demo seed profile">
                  demo seed profile
                </span>
              )}

              <div className={styles.xpRow}>
                <span className={`mono ${styles.xpVal}`}>{operator.xp.toLocaleString()}</span>
                <span className="muted" style={{ fontSize: "12px" }}>XP</span>
              </div>

              <div className={styles.progressWrap}>
                <div
                  className={styles.progressBar}
                  role="progressbar"
                  aria-valuenow={progressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
                </div>
                {nextRank ? (
                  <div className={styles.progressLabel}>
                    <span className="muted">{operator.xp.toLocaleString()} XP</span>
                    <span className={`display ${styles.nextRank}`}>
                      Next: {nextRank.name} at {nextRank.xp_min.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <div className={styles.progressLabel}>
                    <span className={`display ${styles.nextRank}`}>MAX RANK · FIELD MARSHAL</span>
                  </div>
                )}
              </div>

              <hr className="divider" style={{ margin: "14px 0" }} />

              <div className={styles.statGrid}>
                <div className={styles.stat}>
                  <span className={`mono ${styles.statVal}`}>{cleanSubs.length}</span>
                  <span className={`display ${styles.statLabel}`}>Missions</span>
                </div>
                <div className={styles.stat}>
                  <span className={`mono ${styles.statVal}`}>
                    {cleanSubs.length > 0
                      ? `${Math.round(cleanSubs.reduce((a, b) => a + (b.total / b.max_total) * 100, 0) / cleanSubs.length)}%`
                      : "—"}
                  </span>
                  <span className={`display ${styles.statLabel}`}>Avg Score</span>
                </div>
                <div className={styles.stat}>
                  <span className={`mono ${styles.statVal}`}>
                    {bestClean ? (
                      <>
                        <IconTimer size={13} /> {formatElapsed(bestClean.elapsed_seconds)}
                      </>
                    ) : (
                      "—"
                    )}
                  </span>
                  <span className={`display ${styles.statLabel}`}>Best Time</span>
                </div>
                <div className={styles.stat}>
                  <span className={`mono ${styles.statVal}`} style={{ color: compliancePct === 100 ? "var(--signal)" : undefined }}>
                    {compliancePct !== null ? (
                      <>
                        <IconOffline size={13} /> {compliancePct}%
                      </>
                    ) : (
                      "—"
                    )}
                  </span>
                  <span className={`display ${styles.statLabel}`}>Local Compliance</span>
                </div>
              </div>

              {(operator.github_url || operator.x_url) && (
                <div className={styles.socialRow}>
                  {operator.github_url && (
                    <a
                      href={operator.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      aria-label={`${operator.callsign} GitHub profile`}
                    >
                      <IconGitHub size={14} />
                      GitHub
                    </a>
                  )}
                  {operator.x_url && (
                    <a
                      href={operator.x_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      aria-label={`${operator.callsign} X profile`}
                    >
                      <IconX size={14} />
                      X
                    </a>
                  )}
                </div>
              )}

              <div className={styles.sinceDate}>
                In the arena since{" "}
                {new Date(operator.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>

            {/* Mission badges */}
            <div className={`panel ${styles.badgesCard}`}>
              <div className="section-label">Mission Badges · Season Zero</div>
              <div className={styles.badgeGrid}>
                {MISSIONS.map((m, i) => {
                  const earned = completedMissionIds.has(m.id);
                  return (
                    <Link
                      key={m.id}
                      href={`/missions/${m.id}`}
                      className={`${styles.badge} ${earned ? styles.badgeEarned : ""}`}
                      title={`${m.title}${earned ? " — completed" : " — not yet completed"}`}
                    >
                      <MissionGlyph eventType={m.event_type} missionId={m.id} size={18} />
                      <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* AAR highlights */}
            {Object.keys(bestDims).length > 0 && (
              <div className={`panel ${styles.dimsCard}`}>
                <div className="section-label">AAR Highlights</div>
                {Object.entries(bestDims)
                  .filter(([, v]) => v.max > 0)
                  .sort(([, a], [, b]) => b.points / b.max - a.points / a.max)
                  .slice(0, 6)
                  .map(([key, val]) => {
                    const pct = Math.round((val.points / val.max) * 100);
                    return (
                      <div key={key} className={styles.dimRow}>
                        <div className={styles.dimLabel}>
                          {DIM_LABELS[key] ?? key.replace(/_/g, " ")}
                        </div>
                        <div className={styles.dimBar}>
                          <div
                            className={styles.dimFill}
                            style={{
                              width: `${pct}%`,
                              background: pct >= 80 ? "var(--signal)" : pct >= 50 ? "var(--amber)" : "var(--alert)",
                            }}
                          />
                        </div>
                        <div className={`mono ${styles.dimPct}`}>{pct}%</div>
                      </div>
                    );
                  })}
              </div>
            )}
          </aside>

          {/* ── Main: mission record ──────────────────────────────────── */}
          <div className={styles.main}>
            <h1 className={`display ${styles.title}`}>Mission Record</h1>
            <p className="muted" style={{ fontSize: "13px", marginBottom: "24px" }}>
              Training history for {operator.callsign}. Flagged runs earn no XP and
              are excluded from podium positions.
            </p>

            {sortedSubs.length === 0 ? (
              <div className={`panel ${styles.empty}`}>
                <p>No missions on record yet.</p>
                <Link href="/missions" className="btn btn-primary" style={{ marginTop: "16px" }}>
                  Start a Mission →
                </Link>
              </div>
            ) : (
              <div className={`panel ${styles.tableWrap}`}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Mission</th>
                      <th>Score</th>
                      <th>Time</th>
                      <th>XP</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSubs.map((sub) => {
                      const mission = MISSIONS.find((m) => m.id === sub.mission_id);
                      const isSuspicious = sub.flags.suspicious_fast;
                      return (
                        <tr key={sub.run_id} className={isSuspicious ? styles.suspicious : ""}>
                          <td>
                            <Link
                              href={`/missions/${sub.mission_id}`}
                              className={`display ${styles.missionLink}`}
                              style={{ color: isSuspicious ? "var(--muted)" : "var(--ice)" }}
                            >
                              {mission?.title ?? sub.mission_id}
                            </Link>
                          </td>
                          <td className="mono" style={{ color: isSuspicious ? "var(--muted)" : "var(--signal)" }}>
                            {sub.total}/{sub.max_total}
                          </td>
                          <td className="mono muted">{formatElapsed(sub.elapsed_seconds)}</td>
                          <td className="mono" style={{ color: isSuspicious ? "var(--muted)" : "var(--amber)" }}>
                            {isSuspicious ? "—" : `+${sub.xp_awarded}`}
                          </td>
                          <td>
                            {isSuspicious ? (
                              <span className="tag tag-amber">
                                <IconSuspicious size={11} /> Suspicious time
                              </span>
                            ) : sub.flags.missing_telemetry ? (
                              <span className="tag tag-muted">No telemetry</span>
                            ) : (
                              <span className="tag tag-signal">Verified</span>
                            )}
                          </td>
                          <td className="mono muted" style={{ fontSize: "12px" }}>
                            {new Date(sub.submitted_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

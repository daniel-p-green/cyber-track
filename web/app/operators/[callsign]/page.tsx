import { notFound } from "next/navigation";
import Link from "next/link";
import { getOperator, getSubmissionsByCallsign, Submission } from "@/lib/store";
import { getRankForXP, getNextRank, RANKS } from "@/lib/ranks";
import { MISSIONS } from "@/lib/missions";
import { formatElapsed, slopeForDifficulty } from "@/lib/utils";
import {
  MissionGlyph,
  RankPlate,
  RankChevrons,
  HexBadge,
  ScoreRing,
  SlopeBadge,
  IconGitHub,
  IconX,
  IconSuspicious,
  IconOffline,
  IconTimer,
  IconEvidence,
  IconChat,
  IconTerminal,
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
  return Math.min(100, Math.round(((xp - current.xp_min) / range) * 100));
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

/* Metric icon per scoring dimension — falls back to the evidence mark */
function DimIcon({ dim, size = 13 }: { dim: string; size?: number }) {
  switch (dim) {
    case "time_to_signal": return <IconTimer size={size} />;
    case "local_offline_compliance": return <IconOffline size={size} />;
    case "terminal_recovery": return <IconTerminal size={size} />;
    case "communication_quality":
    case "prompt_discipline": return <IconChat size={size} />;
    default: return <IconEvidence size={size} checked={false} />;
  }
}

const DIM_LABELS: Record<string, string> = {
  mission_completion: "Mission Completion",
  evidence_discipline: "Evidence Discipline",
  hallucination_resistance: "Model Skepticism",
  tool_reliability: "Tool Reliability",
  prompt_discipline: "Prompt Discipline",
  communication_quality: "Communication Quality",
  recovery_from_bad_ai_guidance: "Recovery From Bad Guidance",
  time_to_signal: "Time to Signal",
  local_offline_compliance: "Local/Offline Compliance",
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
  const avgScore =
    cleanSubs.length > 0
      ? Math.round(cleanSubs.reduce((a, b) => a + (b.total / b.max_total) * 100, 0) / cleanSubs.length)
      : null;

  const sortedSubs = [...subs].sort(
    (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
  );

  return (
    <div className={styles.root}>
      <div className="container">
        <div className={styles.breadcrumb}>
          <Link href="/leaderboard">← Arena</Link>
        </div>

        {/* ── Operator banner ─────────────────────────────────────────── */}
        <header className={`panel hud-corners ${styles.banner}`}>
          <div className={styles.bannerMain}>
            <RankPlate letter={operator.callsign[0]} size={58} />
            <div className={styles.bannerId}>
              <div className={styles.callsignRow}>
                <span className={`mono ${styles.callsign}`}>{operator.callsign}</span>
                {operator.seeded && (
                  <span className={`display ${styles.seedTag}`} title="Sample data for the demo">
                    demo
                  </span>
                )}
              </div>
              <div className={styles.rankRow}>
                <RankChevrons tier={rankTier} size={10} />
                <span className={`display ${styles.rankName}`}>{rankInfo.name}</span>
              </div>
              <div className={styles.sinceRow}>
                In the arena since{" "}
                {new Date(operator.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>

            <div className={styles.bannerRight}>
              {(operator.github_url || operator.x_url) && (
                <div className={styles.socialRow}>
                  {operator.github_url && (
                    <a
                      href={operator.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialBtn}
                      aria-label={`${operator.callsign} on GitHub (opens in new tab)`}
                    >
                      <IconGitHub size={13} /> GitHub
                    </a>
                  )}
                  {operator.x_url && (
                    <a
                      href={operator.x_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialBtn}
                      aria-label={`${operator.callsign} on X (opens in new tab)`}
                    >
                      <IconX size={13} /> X
                    </a>
                  )}
                </div>
              )}
              <div className={styles.xpBlock}>
                <span className={`mono ${styles.xpVal}`}>{operator.xp.toLocaleString()}</span>
                <span className={`display ${styles.xpLabel}`}>XP</span>
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
                <span className={`display ${styles.nextRank}`}>
                  {nextRank
                    ? `Next: ${nextRank.name} at ${nextRank.xp_min.toLocaleString()}`
                    : "Max rank"}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.statStrip}>
            <div className={styles.stat}>
              <span className={`mono ${styles.statVal}`}>{cleanSubs.length}</span>
              <span className={`display ${styles.statLabel}`}>Missions</span>
            </div>
            <div className={styles.stat}>
              <span className={`mono ${styles.statVal}`}>
                {avgScore !== null ? `${avgScore}%` : "—"}
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
              <span
                className={`mono ${styles.statVal}`}
                style={{ color: compliancePct === 100 ? "var(--signal)" : undefined }}
              >
                {compliancePct !== null ? (
                  <>
                    <IconOffline size={13} /> {compliancePct}%
                  </>
                ) : (
                  "—"
                )}
              </span>
              <span className={`display ${styles.statLabel}`}>Local Gemma</span>
            </div>
          </div>
        </header>

        {/* ── Record + intel ──────────────────────────────────────────── */}
        <div className={styles.layout}>
          <div className={styles.main}>
            <h1 className={`display ${styles.title}`}>Mission Record</h1>
            <p className={styles.subline}>Flagged runs earn no XP.</p>

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
                      <th className={styles.right}>Score</th>
                      <th className={styles.right}>Time</th>
                      <th className={styles.right}>XP</th>
                      <th>Status</th>
                      <th className={styles.hideSm}>Date</th>
                      <th className={styles.right}>AAR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSubs.map((sub) => {
                      const mission = MISSIONS.find((m) => m.id === sub.mission_id);
                      const isSuspicious = sub.flags.suspicious_fast;
                      const slope = mission ? slopeForDifficulty(mission.difficulty) : null;
                      return (
                        <tr key={sub.run_id} className={isSuspicious ? styles.suspicious : ""}>
                          <td>
                            <span className={styles.missionCell}>
                              {slope && (
                                <SlopeBadge slope={slope.id} label={slope.label} withLabel={false} size={12} />
                              )}
                              <Link
                                href={`/missions/${sub.mission_id}`}
                                className={`display ${styles.missionLink}`}
                                style={{ color: isSuspicious ? "var(--muted)" : "var(--ice)" }}
                              >
                                {mission?.title.replace(/^(Relay|Marathon): /, "") ?? sub.mission_id}
                              </Link>
                            </span>
                          </td>
                          <td
                            className={`mono ${styles.right}`}
                            style={{ color: isSuspicious ? "var(--muted)" : "var(--signal)" }}
                          >
                            {sub.total}/{sub.max_total}
                          </td>
                          <td className={`mono muted ${styles.right}`}>
                            {formatElapsed(sub.elapsed_seconds)}
                          </td>
                          <td
                            className={`mono ${styles.right}`}
                            style={{ color: isSuspicious ? "var(--muted)" : "var(--amber)" }}
                          >
                            {isSuspicious ? "—" : `+${sub.xp_awarded}`}
                          </td>
                          <td>
                            {isSuspicious ? (
                              <span className="tag tag-amber">
                                <IconSuspicious size={11} /> Flagged
                              </span>
                            ) : sub.flags.missing_telemetry ? (
                              <span className="tag tag-muted">No telemetry</span>
                            ) : (
                              <span className="tag tag-signal">Verified</span>
                            )}
                          </td>
                          <td className={`mono muted ${styles.hideSm}`} style={{ fontSize: "12px" }}>
                            {new Date(sub.submitted_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className={styles.right}>
                            <Link
                              href={`/runs/${sub.run_id}`}
                              className={`display ${styles.aarLink}`}
                            >
                              View →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <aside className={styles.aside}>
            <div className={`panel ${styles.sideCard}`}>
              <div className="section-label">Season Zero Badges</div>
              <div className={styles.badgeGrid}>
                {MISSIONS.map((m, i) => {
                  const earned = completedMissionIds.has(m.id);
                  return (
                    <Link
                      key={m.id}
                      href={`/missions/${m.id}`}
                      className={`${styles.badge} ${earned ? styles.badgeEarned : ""}`}
                      title={`${m.title}${earned ? " (completed)" : ""}`}
                    >
                      <HexBadge size={44} tone={earned ? "signal" : "muted"}>
                        <MissionGlyph eventType={m.event_type} missionId={m.id} size={18} />
                      </HexBadge>
                      <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {Object.keys(bestDims).length > 0 && (
              <div className={`panel ${styles.sideCard}`}>
                <div className="section-label">Best Scores by Dimension</div>
                {avgScore !== null && (
                  <div className={styles.aarRing}>
                    <ScoreRing score={avgScore} size={96} label="avg score" />
                  </div>
                )}
                {Object.entries(bestDims)
                  .filter(([, v]) => v.max > 0)
                  .sort(([, a], [, b]) => b.points / b.max - a.points / a.max)
                  .slice(0, 6)
                  .map(([key, val]) => {
                    const pct = Math.round((val.points / val.max) * 100);
                    return (
                      <div key={key} className={styles.dimRow}>
                        <div className={styles.dimHead}>
                          <span className={styles.dimLabel}>
                            <DimIcon dim={key} />
                            {DIM_LABELS[key] ?? key.replace(/_/g, " ")}
                          </span>
                          <span className={`mono ${styles.dimPct}`}>
                            {pct}<span className={styles.dimMax}> /100</span>
                          </span>
                        </div>
                        <div className={styles.dimBar}>
                          <div
                            className={styles.dimFill}
                            style={{
                              width: `${pct}%`,
                              background:
                                pct >= 80 ? "var(--signal)" : pct >= 50 ? "var(--amber)" : "var(--alert)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { getSubmissionByRunId } from "@/lib/store";
import { getMissionById } from "@/lib/missions";
import { formatElapsed, slopeForDifficulty, eventTypeLabel, eventTypeColor } from "@/lib/utils";
import {
  ScoreRing,
  SlopeBadge,
  IconSuspicious,
  IconOffline,
  IconTimer,
  IconChat,
} from "../../components/svg";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ runId: string }>;
}

const DIM_LABELS: Record<string, string> = {
  mission_completion: "Mission completion",
  evidence_discipline: "Evidence discipline",
  hallucination_resistance: "Model skepticism",
  tool_reliability: "Tool reliability",
  prompt_discipline: "Prompt discipline",
  communication_quality: "Communication quality",
  recovery_from_bad_ai_guidance: "Recovery from bad guidance",
  time_to_signal: "Time to signal",
  local_offline_compliance: "Local/offline compliance",
  terminal_recovery: "Terminal recovery",
};

export default async function RunAARPage({ params }: Props) {
  const { runId } = await params;
  const sub = await getSubmissionByRunId(runId);
  if (!sub) notFound();

  const mission = getMissionById(sub.mission_id);
  const slope = mission ? slopeForDifficulty(mission.difficulty) : null;
  const pct = Math.round((sub.total / Math.max(sub.max_total, 1)) * 100);
  const isSuspicious = sub.flags.suspicious_fast;

  const dims = Object.entries(sub.dimensions)
    .filter(([, v]) => v.max > 0)
    .sort(([, a], [, b]) => b.max - a.max);

  const caught = sub.checks?.filter((c) => c.passed) ?? [];
  const missed = sub.checks?.filter((c) => !c.passed) ?? [];

  return (
    <div className={styles.root}>
      <div className="container">
        <div className={styles.breadcrumb}>
          <Link href={`/operators/${sub.callsign}`}>← {sub.callsign}</Link>
          {mission && (
            <>
              <span className="muted">/</span>
              <Link href={`/missions/${sub.mission_id}`}>{mission.title}</Link>
            </>
          )}
        </div>

        {/* AAR head */}
        <header className={`panel hud-corners ${styles.head}`}>
          <div className={styles.headMain}>
            <div className={styles.headTags}>
              <span className={`display ${styles.aarKicker}`}>
                After-Action Report
              </span>
              {mission && (
                <>
                  <span className={`tag ${eventTypeColor(mission.event_type)}`}>
                    {eventTypeLabel(mission.event_type)}
                  </span>
                  {slope && <SlopeBadge slope={slope.id} label={slope.label} size={13} />}
                </>
              )}
            </div>
            <h1 className={`display ${styles.title}`}>
              {mission?.title ?? sub.mission_id}
            </h1>
            <div className={`mono ${styles.runMeta}`}>
              <span>{sub.callsign}</span>
              <span>·</span>
              <span>{sub.run_id}</span>
              <span>·</span>
              <span>
                {new Date(sub.submitted_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            {isSuspicious && (
              <div className={styles.flagBanner}>
                <IconSuspicious size={15} />
                <span>
                  Completion time was below this mission&apos;s realistic floor.
                  This run is unverified and earned no XP.
                </span>
              </div>
            )}
          </div>
          <div className={styles.headScore}>
            <ScoreRing score={sub.total} max={sub.max_total} size={128} label="score" />
            <div className={styles.headStats}>
              <span className={`mono ${styles.headStat}`}>
                <IconTimer size={12} /> {formatElapsed(sub.elapsed_seconds)}
              </span>
              {typeof sub.ask_count === "number" && (
                <span className={`mono ${styles.headStat}`}>
                  <IconChat size={12} /> {sub.ask_count} model exchange{sub.ask_count === 1 ? "" : "s"}
                </span>
              )}
              <span
                className={`mono ${styles.headStat}`}
                style={{ color: isSuspicious ? "var(--amber)" : "var(--signal)" }}
              >
                {isSuspicious ? "+0 XP (flagged)" : `+${sub.xp_awarded} XP`}
              </span>
            </div>
          </div>
        </header>

        <div className={styles.grid}>
          {/* What held up / what broke */}
          <div className={styles.main}>
            {sub.checks && sub.checks.length > 0 ? (
              <>
                {missed.length > 0 && (
                  <section className={`panel ${styles.zone}`}>
                    <div className={`${styles.zoneHead} ${styles.zoneHeadAlert}`}>
                      <span className="display">Where it broke</span>
                      <span className={`mono ${styles.zoneCount}`}>{missed.length}</span>
                    </div>
                    <ul className={styles.checkList}>
                      {missed.map((c) => (
                        <li key={c.id} className={styles.check}>
                          <span className={`mono ${styles.checkMark}`} style={{ color: "var(--alert)" }}>✕</span>
                          <span className={styles.checkLabel}>{c.label}</span>
                          <span className={`mono ${styles.checkPts}`}>
                            {c.points}/{c.max}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                <section className={`panel ${styles.zone}`}>
                  <div className={styles.zoneHead}>
                    <span className="display">Where it held up</span>
                    <span className={`mono ${styles.zoneCount}`}>{caught.length}</span>
                  </div>
                  <ul className={styles.checkList}>
                    {caught.map((c) => (
                      <li key={c.id} className={styles.check}>
                        <span className={`mono ${styles.checkMark}`} style={{ color: "var(--signal)" }}>✓</span>
                        <span className={styles.checkLabel}>{c.label}</span>
                        <span className={`mono ${styles.checkPts}`}>
                          {c.points}/{c.max}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            ) : (
              <section className={`panel ${styles.zone}`}>
                <div className={styles.zoneHead}>
                  <span className="display">Objective checks</span>
                </div>
                <p className={styles.noChecks}>
                  Per-check detail was not published with this run. The full
                  AAR, including the decision trace, lives in the run folder in
                  the workspace (<code className="mono">runs/{sub.run_id}/aar.md</code>).
                </p>
              </section>
            )}
          </div>

          {/* Dimensions + integrity */}
          <aside className={styles.aside}>
            <section className={`panel ${styles.zone}`}>
              <div className={styles.zoneHead}>
                <span className="display">Readiness dimensions</span>
              </div>
              <div className={styles.dimBody}>
                {dims.map(([key, val]) => {
                  const dimPct = Math.round((val.points / val.max) * 100);
                  return (
                    <div key={key} className={styles.dimRow}>
                      <div className={styles.dimHead}>
                        <span className={styles.dimLabel}>
                          {DIM_LABELS[key] ?? key.replace(/_/g, " ")}
                        </span>
                        <span className={`mono ${styles.dimPts}`}>
                          {val.points}/{val.max}
                        </span>
                      </div>
                      <div className={styles.dimTrack}>
                        <div
                          className={styles.dimFill}
                          style={{
                            width: `${dimPct}%`,
                            background:
                              dimPct >= 80 ? "var(--signal)" : dimPct >= 50 ? "var(--amber)" : "var(--alert)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className={`panel ${styles.zone}`}>
              <div className={styles.zoneHead}>
                <span className="display">Run integrity</span>
              </div>
              <ul className={styles.integrityList}>
                <li>
                  <span className={styles.integrityKey}>
                    <IconOffline size={13} /> Local model
                  </span>
                  <span className={`mono ${styles.integrityVal}`} style={{ color: sub.local_model.simulated ? "var(--amber)" : "var(--signal)" }}>
                    {sub.local_model.simulated
                      ? "simulated"
                      : `${sub.local_model.model} · verified`}
                  </span>
                </li>
                <li>
                  <span className={styles.integrityKey}>
                    <IconTimer size={13} /> Time bounds
                  </span>
                  <span className={`mono ${styles.integrityVal}`} style={{ color: isSuspicious ? "var(--amber)" : "var(--signal)" }}>
                    {isSuspicious ? "below floor · flagged" : "within bounds"}
                  </span>
                </li>
                <li>
                  <span className={styles.integrityKey}>Telemetry</span>
                  <span className={`mono ${styles.integrityVal}`} style={{ color: sub.flags.missing_telemetry ? "var(--amber)" : "var(--signal)" }}>
                    {sub.flags.missing_telemetry ? "missing" : "intact"}
                  </span>
                </li>
                <li>
                  <span className={styles.integrityKey}>Scoring</span>
                  <span className={`mono ${styles.integrityVal}`}>
                    deterministic · {pct}%
                  </span>
                </li>
              </ul>
            </section>

            <p className={styles.ruleNote}>
              Scores are training feedback for this exercise only, never
              hiring signals.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

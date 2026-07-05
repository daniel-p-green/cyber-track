import { notFound } from "next/navigation";
import Link from "next/link";
import { MISSIONS } from "@/lib/missions";
import { getSubmissionsForMission, getAllOperators } from "@/lib/store";
import { eventTypeLabel, eventTypeColor, formatElapsed, slopeForDifficulty } from "@/lib/utils";
import {
  MissionGlyph,
  GemmaStatus,
  HexBadge,
  ScoreRing,
  SlopeBadge,
  IconTimer,
  IconFile,
  IconChat,
  IconSuspicious,
  IconOffline,
  IconBars,
  IconTerminal,
} from "../../components/svg";
import CopyCmd from "../../components/CopyCmd";
import EvidenceChecklist from "../../components/EvidenceChecklist";
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
  const seededOps = new Set(ops.filter((o) => o.seeded).map((o) => o.callsign));

  const sortedSubs = [...subs].sort((a, b) => {
    if (a.flags.suspicious_fast && !b.flags.suspicious_fast) return 1;
    if (!a.flags.suspicious_fast && b.flags.suspicious_fast) return -1;
    return b.total - a.total || a.elapsed_seconds - b.elapsed_seconds;
  });
  const realSubs = sortedSubs.filter(
    (s) => !s.seeded && !seededOps.has(s.callsign)
  );
  const bestReal = realSubs.find((s) => !s.flags.suspicious_fast);

  const slope = slopeForDifficulty(mission.difficulty);

  return (
    <div className={styles.root}>
      <div className="container">
        {/* Status bar */}
        <div className={styles.statusBar}>
          <div className={styles.breadcrumb}>
            <Link href="/missions">← Mission Board</Link>
            <span className="muted">/ {mission.title}</span>
          </div>
          <span className={styles.statusChips}>
            <GemmaStatus compact />
          </span>
        </div>

        {/* Mission head */}
        <header className={styles.missionHead}>
          <HexBadge size={56} tone="muted" className={styles.missionIcon}>
            <MissionGlyph eventType={mission.event_type} missionId={mission.id} size={24} />
          </HexBadge>
          <div className={styles.headText}>
            <div className={styles.headTags}>
              <span className={`tag ${eventTypeColor(mission.event_type)}`}>
                {eventTypeLabel(mission.event_type)}
              </span>
              <SlopeBadge slope={slope.id} label={slope.label} size={14} />
            </div>
            <h1 className={`display ${styles.title}`}>{mission.title}</h1>
            <p className={styles.summary}>{mission.hook}</p>
          </div>
        </header>

        {/* Mission HUD strip */}
        <div className={`panel hud-corners hud-corners-signal ${styles.hud}`}>
          <div className={styles.hudCell}>
            <span className={`display ${styles.hudLabel}`}>Timebox</span>
            <span className={`mono ${styles.hudTimer}`}>
              T-{String(mission.timebox_minutes).padStart(2, "0")}:00
            </span>
          </div>
          <div className={styles.hudCell}>
            <span className={`display ${styles.hudLabel}`}>Status</span>
            <span className={`display ${styles.hudStandby}`}>
              <span className="pulse-dot" /> Standby
            </span>
          </div>
          <div className={styles.hudCell}>
            <span className={`display ${styles.hudLabel}`}>Reward</span>
            <span className="mono signal">+{mission.xp_base} XP</span>
          </div>
          <div className={styles.hudCell}>
            <span className={`display ${styles.hudLabel}`}>AI Allowed</span>
            <span className={`mono ${styles.hudOffline}`}>
              <IconOffline size={12} /> local Gemma only
            </span>
          </div>
          <div className={`${styles.hudCell} ${styles.hudHideSm}`}>
            <span className={`display ${styles.hudLabel}`}>Flag Threshold</span>
            <span className="mono amber">
              &lt; {formatElapsed(mission.expected_seconds.min)}
            </span>
          </div>
        </div>

        <div className={styles.layout}>
          {/* ── Main: the briefing ────────────────────────────────────── */}
          <div className={styles.main}>
            {/* Situation */}
            <section className={`panel ${styles.zone}`}>
              <div className={styles.zoneHead}>
                <IconFile size={15} />
                <span className="display">Situation</span>
                <span className={styles.zoneSub}>HALCYON grid · synthetic</span>
              </div>
              <div className={styles.zoneBody}>
                <p className={styles.prose}>{mission.situation}</p>
                <div className={styles.edgeNote}>
                  <IconOffline size={14} className={styles.edgeIcon} />
                  <p>{mission.edge_condition}</p>
                </div>
              </div>
            </section>

            {/* Evidence */}
            <section className={`panel ${styles.zone}`}>
              <div className={styles.zoneHead}>
                <IconFile size={15} />
                <span className="display">Evidence</span>
                <span className={styles.zoneSub}>
                  {mission.evidence.length} file{mission.evidence.length > 1 ? "s" : ""} in the workspace
                </span>
              </div>
              <div className={styles.zoneBody}>
                <ul className={styles.evidenceList}>
                  {mission.evidence.map((e) => (
                    <li key={e.file}>
                      <code className={`mono ${styles.evidenceFile}`}>{e.file}</code>
                      <span className={styles.evidenceRole}>{e.role}</span>
                    </li>
                  ))}
                </ul>
                <div className={styles.checklistBlock}>
                  <span className={`display ${styles.fieldLabel}`}>
                    Track your review (session only)
                  </span>
                  <EvidenceChecklist
                    missionId={mission.id}
                    files={mission.evidence.map((e) => e.file)}
                  />
                </div>
              </div>
            </section>

            {/* Model hypothesis */}
            <section className={`panel ${styles.zone} ${styles.zoneTrap}`}>
              <div className={styles.zoneHead}>
                <IconChat size={15} />
                <span className="display">The Model Will Get This Wrong</span>
              </div>
              <div className={styles.zoneBody}>
                <p className={styles.prose}>{mission.model_trap}</p>
                <p className={styles.trapNote}>
                  Catching a planted bad claim is scored. Missing it costs you.
                  The model is your field AI, not your judge: deterministic
                  checks grade the run.
                </p>
              </div>
            </section>

            {/* Operator decision */}
            <section className={`panel ${styles.zone}`}>
              <div className={styles.zoneHead}>
                <IconTerminal size={15} />
                <span className="display">Your Decision</span>
              </div>
              <div className={styles.zoneBody}>
                <p className={styles.prose}>{mission.decision}</p>
                <p className={styles.decisionNote}>
                  File it as a finding with the evidence paths that prove it.
                  The answer artifact lives in your run folder; the template is
                  created when the run starts.
                </p>
              </div>
            </section>

            {/* Flight ops — commands demoted to one compact block */}
            <section className={`panel ${styles.supportZone}`}>
              <div className={styles.supportHead}>
                <span className={`display ${styles.supportLabel}`}>
                  Flight ops · terminal
                </span>
                <span className={styles.supportSub}>
                  start and submit bookend the run; everything between happens in the editor
                </span>
              </div>
              <div className={styles.supportBody}>
                <div className={styles.seqCmdRow}>
                  <code className={`mono ${styles.seqCmd}`}>
                    <span className={styles.prompt}>$ </span>
                    cybertf run {mission.id}
                  </code>
                  <span className={styles.cmdNote}>arms the timer</span>
                  <CopyCmd text={`cybertf run ${mission.id}`} />
                </div>
                <div className={styles.seqCmdRow}>
                  <code className={`mono ${styles.seqCmd}`}>
                    <span className={styles.prompt}>$ </span>
                    cybertf ask &quot;...&quot; --file &lt;evidence&gt;
                  </code>
                  <span className={styles.cmdNote}>query local Gemma</span>
                  <CopyCmd text={`cybertf ask "your question" --file <evidence-file>`} />
                </div>
                <div className={styles.seqCmdRow}>
                  <code className={`mono ${styles.seqCmd}`}>
                    <span className={styles.prompt}>$ </span>
                    cybertf submit {mission.id} runs/&lt;run_id&gt;/answer.json
                  </code>
                  <span className={styles.cmdNote}>score + AAR</span>
                  <CopyCmd text={`cybertf submit ${mission.id} runs/<run_id>/answer.json`} />
                </div>
                <div className={styles.seqCmdRow}>
                  <code className={`mono ${styles.seqCmd}`}>
                    <span className={styles.prompt}>$ </span>
                    cybertf publish &lt;run_id&gt;
                  </code>
                  <span className={styles.cmdNote}>post to the arena</span>
                  <CopyCmd text={`cybertf publish <run_id>`} />
                </div>
              </div>
            </section>
          </div>

          {/* ── Aside: scoring + top runs ─────────────────────────────── */}
          <aside className={styles.aside}>
            <section className={`panel ${styles.zone}`}>
              <div className={styles.zoneHead}>
                <IconBars size={15} />
                <span className="display">Scoring</span>
              </div>

              <div className={styles.arenaBody}>
                <div>
                  <span className={`display ${styles.fieldLabel}`}>Scored on</span>
                  <div className={styles.dimChips}>
                    {mission.dimensions.map((d) => (
                      <span key={d} className="tag tag-muted">{d}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className={`display ${styles.fieldLabel}`}>Skills tested</span>
                  <div className={styles.dimChips}>
                    {mission.skills.map((s) => (
                      <span key={s} className="tag tag-ice">{s}</span>
                    ))}
                  </div>
                </div>
                <p className={styles.scoringNote}>
                  Deterministic checks, no model in the grading loop. Speed is
                  worth at most 10%. Under{" "}
                  <span className="mono amber">
                    {formatElapsed(mission.expected_seconds.min)}
                  </span>{" "}
                  is flagged{" "}
                  <span className={styles.flagInline}>
                    <IconSuspicious size={12} /> SUSPICIOUS
                  </span>{" "}
                  and earns no XP.
                </p>
              </div>

              <div className={styles.leaderBlock}>
                <div className="section-label">
                  <IconTimer size={12} /> Top Runs
                </div>
                {realSubs.length === 0 ? (
                  <div className={styles.empty}>
                    No verified runs posted yet. The first clean run takes the
                    board.
                  </div>
                ) : (
                  <>
                    {bestReal && (
                      <div className={styles.bestRun}>
                        <ScoreRing
                          score={bestReal.total}
                          max={bestReal.max_total}
                          size={86}
                        />
                        <div className={styles.bestRunText}>
                          <span className={`display ${styles.bestRunLabel}`}>Best verified run</span>
                          <span className={`mono ${styles.bestRunMeta}`}>
                            {bestReal.callsign} · {formatElapsed(bestReal.elapsed_seconds)}
                          </span>
                        </div>
                      </div>
                    )}
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Callsign</th>
                          <th className={styles.right}>Score</th>
                          <th className={styles.right}>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {realSubs.slice(0, 8).map((sub, i) => {
                          const isSuspicious = sub.flags.suspicious_fast;
                          return (
                            <tr key={sub.run_id} className={isSuspicious ? styles.suspicious : ""}>
                              <td className="mono muted">
                                {isSuspicious ? <IconSuspicious size={12} /> : i + 1}
                              </td>
                              <td className={styles.callsignCell}>
                                <Link
                                  href={`/operators/${sub.callsign}`}
                                  className={`mono ${styles.callsign}`}
                                  style={{ color: isSuspicious ? "var(--muted)" : "var(--ice)" }}
                                >
                                  {sub.callsign}
                                </Link>
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
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </>
                )}
              </div>

              <Link href="/leaderboard" className={`btn btn-outline ${styles.fullBoard}`}>
                <IconBars size={13} /> Full Arena
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

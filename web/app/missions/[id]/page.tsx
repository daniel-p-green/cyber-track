import { notFound } from "next/navigation";
import Link from "next/link";
import { MISSIONS } from "@/lib/missions";
import { getSubmissionsForMission, getAllOperators } from "@/lib/store";
import { eventTypeLabel, eventTypeColor, formatElapsed, slopeForDifficulty } from "@/lib/utils";
import {
  MissionGlyph,
  GemmaStatus,
  SlopeBadge,
  IconTimer,
  IconTerminal,
  IconSuspicious,
  IconOffline,
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

export default async function MissionCockpit({ params }: Props) {
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

  const slope = slopeForDifficulty(mission.difficulty);

  const sequence = [
    {
      cmd: `cybertf run ${mission.id}`,
      note: "Arms the mission timer and creates your run directory.",
    },
    {
      cmd: `cybertf brief ${mission.id}`,
      note: "Prints the full brief; evidence lives in the challenges folder.",
    },
    {
      cmd: `cybertf ask "your question" --file <evidence-file>`,
      note: "Queries local Gemma4 — it only knows what you show it.",
    },
    {
      cmd: `cybertf submit ${mission.id} runs/<run_id>/answer.json`,
      note: "Stops the timer, scores deterministically, writes your AAR.",
    },
    {
      cmd: `cybertf publish <run_id>`,
      note: "Posts the scored run to this arena.",
    },
  ];

  return (
    <div className={styles.root}>
      <div className="container">
        {/* Status bar */}
        <div className={styles.statusBar}>
          <div className={styles.breadcrumb}>
            <Link href="/missions">← Mission Board</Link>
            <span className="muted">/ {mission.title}</span>
          </div>
          <GemmaStatus compact />
        </div>

        {/* Mission head */}
        <header className={styles.missionHead}>
          <span className={styles.missionIcon}>
            <MissionGlyph eventType={mission.event_type} missionId={mission.id} size={26} />
          </span>
          <div className={styles.headText}>
            <div className={styles.headTags}>
              <span className={`tag ${eventTypeColor(mission.event_type)}`}>
                {eventTypeLabel(mission.event_type)}
              </span>
              <SlopeBadge slope={slope.id} label={slope.label} size={14} />
            </div>
            <h1 className={`display ${styles.title}`}>{mission.title}</h1>
            <p className={styles.summary}>{mission.summary}</p>
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
            <span className={`display ${styles.hudLabel}`}>Field AI</span>
            <span className={`mono ${styles.hudOffline}`}>
              <IconOffline size={12} /> local Gemma4
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
          {/* ── Zone A: the cockpit ───────────────────────────────────── */}
          <div className={styles.main}>
            <section className={`panel ${styles.zone}`}>
              <div className={styles.zoneHead}>
                <IconTerminal size={15} />
                <span className="display">In your cockpit — Cursor</span>
                <span className={styles.zoneSub}>the mission work happens here</span>
              </div>

              <ol className={styles.sequence}>
                {sequence.map((step, i) => (
                  <li key={i} className={styles.seqStep}>
                    <span className={`mono ${styles.seqNum}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className={styles.seqBody}>
                      <div className={styles.seqCmdRow}>
                        <code className={`mono ${styles.seqCmd}`}>
                          <span className={styles.prompt}>$ </span>
                          {step.cmd}
                        </code>
                        <CopyCmd text={step.cmd} />
                      </div>
                      <span className={styles.seqNote}>{step.note}</span>
                    </div>
                  </li>
                ))}
              </ol>

              <div className={styles.evidenceBlock}>
                <div className="section-label">Evidence Checklist</div>
                <EvidenceChecklist missionId={mission.id} files={mission.evidence} />
                <p className={styles.evidenceNote}>
                  Citing your evidence is scored — list the paths in{" "}
                  <code className={`mono ${styles.inline}`}>answer.json</code>.
                </p>
              </div>
            </section>
          </div>

          {/* ── Zone B: the arena ─────────────────────────────────────── */}
          <aside className={styles.aside}>
            <section className={`panel ${styles.zone}`}>
              <div className={styles.zoneHead}>
                <IconOffline size={15} />
                <span className="display">In the arena — scored here</span>
              </div>

              <div className={styles.arenaBody}>
                <div>
                  <span className={`display ${styles.fieldLabel}`}>Scored On</span>
                  <div className={styles.dimChips}>
                    {mission.dimensions.map((d) => (
                      <span key={d} className="tag tag-muted">{d}</span>
                    ))}
                  </div>
                </div>
                <p className={styles.scoringNote}>
                  Deterministic scoring — no model grades you. Speed is worth at
                  most 10%. Under{" "}
                  <span className="mono amber">
                    {formatElapsed(mission.expected_seconds.min)}
                  </span>{" "}
                  gets flagged{" "}
                  <span className={styles.flagInline}>
                    <IconSuspicious size={12} /> SUSPICIOUS
                  </span>
                  : no XP.
                </p>
              </div>

              <div className={styles.leaderBlock}>
                <div className="section-label">
                  <IconTimer size={12} /> Top Runs
                </div>
                {sortedSubs.length === 0 ? (
                  <div className={styles.empty}>No runs posted yet. Be first on the board.</div>
                ) : (
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
                      {sortedSubs.slice(0, 8).map((sub, i) => {
                        const isSuspicious = sub.flags.suspicious_fast;
                        const isSeed = sub.seeded || seededOps.has(sub.callsign);
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
                              {isSeed && (
                                <span className={`display ${styles.seedTag}`} title="Demo seed data">
                                  demo
                                </span>
                              )}
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
                )}
              </div>

              <Link href="/leaderboard" className={`btn btn-outline ${styles.fullBoard}`}>
                Full Arena →
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

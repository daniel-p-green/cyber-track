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
  IconChat,
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

  // The mission loop: Cursor is the cockpit, commands only bookend the run.
  const loop: {
    title: string;
    note: string;
    cmds?: string[];
  }[] = [
    {
      title: "Start the run",
      note: "Arms the timer and creates your run directory.",
      cmds: [`cybertf run ${mission.id}`],
    },
    {
      title: "Read the evidence in Cursor",
      note: `Open challenges/${mission.id}/data/ in the editor and work through each file.`,
    },
    {
      title: "Ask Cursor Chat (local Gemma)",
      note: "Give it the right files and context. It only knows what you show it.",
    },
    {
      title: "Verify or reject the model's claims",
      note: "Check every hypothesis against the evidence. Catching a wrong one is scored.",
    },
    {
      title: "Edit answer.json in the editor",
      note: "Your finding, plus the evidence paths that prove it.",
    },
    {
      title: "Submit and publish",
      note: "Stops the timer, scores deterministically, writes your AAR, posts it here.",
      cmds: [
        `cybertf submit ${mission.id} runs/<run_id>/answer.json`,
        `cybertf publish <run_id>`,
      ],
    },
  ];

  const supportCmds = [
    { cmd: `cybertf brief ${mission.id}`, note: "print the brief in the terminal" },
    { cmd: `cybertf ask "your question" --file <evidence-file>`, note: "terminal fallback for model queries" },
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
          {/* ── Zone A: the cockpit ───────────────────────────────────── */}
          <div className={styles.main}>
            <section className={`panel ${styles.zone}`}>
              <div className={styles.zoneHead}>
                <IconChat size={15} />
                <span className="display">In your cockpit: Cursor</span>
                <span className={styles.zoneSub}>editor + chat + evidence</span>
              </div>

              <ol className={styles.sequence}>
                {loop.map((step, i) => (
                  <li key={i} className={styles.seqStep}>
                    <span className={`mono ${styles.seqNum}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className={styles.seqBody}>
                      <span className={`display ${styles.seqTitle}`}>{step.title}</span>
                      <span className={styles.seqNote}>{step.note}</span>
                      {step.cmds?.map((cmd) => (
                        <div key={cmd} className={styles.seqCmdRow}>
                          <code className={`mono ${styles.seqCmd}`}>
                            <span className={styles.prompt}>$ </span>
                            {cmd}
                          </code>
                          <CopyCmd text={cmd} />
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>

              <div className={styles.evidenceBlock}>
                <div className="section-label">Evidence Checklist</div>
                <EvidenceChecklist missionId={mission.id} files={mission.evidence} />
                <p className={styles.evidenceNote}>
                  Citing your evidence is scored. List the paths in{" "}
                  <code className={`mono ${styles.inline}`}>answer.json</code>.
                </p>
              </div>

              <div className={styles.supportBlock}>
                <span className={`display ${styles.supportLabel}`}>
                  Support commands (optional scaffolding)
                </span>
                {supportCmds.map((item) => (
                  <div key={item.cmd} className={styles.seqCmdRow}>
                    <code className={`mono ${styles.seqCmd} ${styles.supportCmd}`}>
                      <span className={styles.prompt}>$ </span>
                      {item.cmd}
                    </code>
                    <span className={styles.supportNote}>{item.note}</span>
                    <CopyCmd text={item.cmd} />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Zone B: the arena ─────────────────────────────────────── */}
          <aside className={styles.aside}>
            <section className={`panel ${styles.zone}`}>
              <div className={styles.zoneHead}>
                <IconOffline size={15} />
                <span className="display">In the arena: scored here</span>
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
                  Deterministic scoring. No model grades you. Speed is worth at
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

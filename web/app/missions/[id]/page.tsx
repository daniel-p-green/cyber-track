import { notFound } from "next/navigation";
import Link from "next/link";
import { MISSIONS } from "@/lib/missions";
import { getSubmissionsForMission, getAllOperators } from "@/lib/store";
import { difficultyPips, eventTypeLabel, eventTypeColor, formatElapsed } from "@/lib/utils";
import {
  MissionGlyph,
  GemmaStatus,
  IconEvidence,
  IconTimer,
  IconTerminal,
  IconSuspicious,
  IconOffline,
} from "../../components/svg";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return MISSIONS.map((m) => ({ id: m.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

interface SequenceStep {
  cmd: React.ReactNode;
  note: string;
}

export default async function MissionCockpit({ params }: Props) {
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

  const sequence: SequenceStep[] = [
    {
      cmd: (
        <>
          <span className="signal">cybertf run</span> {mission.id}
        </>
      ),
      note: "Arms the mission timer and creates your run directory.",
    },
    {
      cmd: (
        <>
          <span className="signal">cybertf brief</span> {mission.id}
        </>
      ),
      note: "Prints the full brief. Evidence files live in the challenges folder.",
    },
    {
      cmd: (
        <>
          <span className="signal">cybertf ask</span>{" "}
          <span className="amber">&quot;your question&quot;</span> --file{" "}
          <span className="ice">&lt;evidence-file&gt;</span>
        </>
      ),
      note: "Queries local Gemma4. It only knows what you show it — verify before you trust.",
    },
    {
      cmd: (
        <>
          <span className="muted"># edit</span> runs/&lt;run_id&gt;/answer.json{" "}
          <span className="muted">in Cursor</span>
        </>
      ),
      note: "Fill in your findings and cite the evidence paths you used.",
    },
    {
      cmd: (
        <>
          <span className="signal">cybertf submit</span> {mission.id}{" "}
          runs/&lt;run_id&gt;/answer.json
        </>
      ),
      note: "Stops the timer, scores deterministically, writes your after-action report.",
    },
    {
      cmd: (
        <>
          <span className="signal">cybertf publish</span>{" "}&lt;run_id&gt;
        </>
      ),
      note: "Posts the scored run to this arena. Optional — the local scorecard works offline.",
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

        <div className={styles.layout}>
          {/* ── Main: cockpit ─────────────────────────────────────────── */}
          <div className={styles.main}>
            <header className={styles.missionHead}>
              <span className={styles.missionIcon}>
                <MissionGlyph eventType={mission.event_type} missionId={mission.id} size={26} />
              </span>
              <div>
                <div className={styles.headTags}>
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
            </header>

            {/* Cockpit sequence */}
            <section className={`panel hud-corners ${styles.section}`}>
              <div className="section-label">
                <IconTerminal size={13} /> Cockpit Sequence — Cursor Integrated Terminal
              </div>
              <ol className={styles.sequence}>
                {sequence.map((step, i) => (
                  <li key={i} className={styles.seqStep}>
                    <span className={`mono ${styles.seqNum}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className={styles.seqBody}>
                      <code className={`mono ${styles.seqCmd}`}>
                        <span className={styles.prompt}>$</span> {step.cmd}
                      </code>
                      <span className={styles.seqNote}>{step.note}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Evidence checklist */}
            <section className={`panel ${styles.section}`}>
              <div className="section-label">Evidence Checklist</div>
              <p className={styles.evidenceIntro}>
                Citing the evidence you actually used is scored. These files ship in{" "}
                <code className={`mono ${styles.inline}`}>
                  challenges/{mission.id}/data/
                </code>
                :
              </p>
              <ul className={styles.evidenceList}>
                {mission.evidence.map((f) => (
                  <li key={f}>
                    <IconEvidence size={15} checked />
                    <code className="mono">{f}</code>
                  </li>
                ))}
              </ul>
            </section>

            {/* Scoring */}
            <section className={`panel ${styles.section}`}>
              <div className="section-label">Scored On</div>
              <div className={styles.dimChips}>
                {mission.dimensions.map((d) => (
                  <span key={d} className="tag tag-muted">{d}</span>
                ))}
              </div>
              <p className={styles.scoringNote}>
                Deterministic scoring — no model in the grading loop. Speed is worth
                at most 10%; finishing under{" "}
                <span className="mono amber">
                  {formatElapsed(mission.expected_seconds.min)}
                </span>{" "}
                flags the run{" "}
                <span className={styles.flagInline}>
                  <IconSuspicious size={12} /> UNVERIFIED · SUSPICIOUS TIME
                </span>{" "}
                and awards no XP.
              </p>
            </section>
          </div>

          {/* ── Aside: mission status + top runs ──────────────────────── */}
          <aside className={styles.aside}>
            <div className={`panel hud-corners-signal hud-corners ${styles.statusPanel}`}>
              <div className="section-label">Mission Status</div>
              <div className={styles.statusRows}>
                <div>
                  <span className={`display ${styles.statusLabel}`}>Timebox</span>
                  <span className="mono amber">
                    <IconTimer size={12} /> {mission.timebox_minutes}:00
                  </span>
                </div>
                <div>
                  <span className={`display ${styles.statusLabel}`}>Reward</span>
                  <span className="mono signal">+{mission.xp_base} XP base</span>
                </div>
                <div>
                  <span className={`display ${styles.statusLabel}`}>Difficulty</span>
                  <span className={`mono ${styles.pips}`}>
                    {difficultyPips(mission.difficulty)}
                  </span>
                </div>
                <div>
                  <span className={`display ${styles.statusLabel}`}>Constraint</span>
                  <span className={`mono ${styles.offlineVal}`}>
                    <IconOffline size={12} /> local Gemma4 only
                  </span>
                </div>
              </div>
            </div>

            <div className="section-label" style={{ marginTop: 8 }}>
              Top Runs
            </div>
            <div className={`panel ${styles.leaderPanel}`}>
              {sortedSubs.length === 0 ? (
                <div className={styles.empty}>No runs posted yet. Be first on the board.</div>
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
                      const isSuspicious = sub.flags.suspicious_fast;
                      const op = opsMap.get(sub.callsign);
                      return (
                        <tr key={sub.run_id} className={isSuspicious ? styles.suspicious : ""}>
                          <td className="mono muted">
                            {isSuspicious ? <IconSuspicious size={12} /> : i + 1}
                          </td>
                          <td>
                            <Link
                              href={`/operators/${sub.callsign}`}
                              className={`mono ${styles.callsign}`}
                              style={{ color: isSuspicious ? "var(--muted)" : "var(--ice)" }}
                            >
                              {sub.callsign}
                            </Link>
                            {(sub.seeded || op?.seeded) && sub.seeded && (
                              <span className={styles.seedMark} title="demo seed data">·s</span>
                            )}
                          </td>
                          <td
                            className="mono"
                            style={{ color: isSuspicious ? "var(--muted)" : "var(--signal)" }}
                          >
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

            {sortedSubs.some((s) => s.flags.suspicious_fast) && (
              <p className={styles.flagNote}>
                <IconSuspicious size={12} /> Flagged rows are excluded from podium
                positions.
              </p>
            )}

            <Link href="/leaderboard" className={`btn btn-outline ${styles.fullBoard}`}>
              Full Arena →
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { MISSIONS } from "@/lib/missions";
import { difficultyPips, eventTypeLabel, eventTypeColor } from "@/lib/utils";
import {
  MissionGlyph,
  RailNode,
  GemmaStatus,
  IconFile,
  IconTimer,
  type NodeState,
} from "../components/svg";
import styles from "./page.module.css";

const EVENT_ORDER = ["qualification", "sprint", "field", "relay", "marathon"] as const;

function nodeState(index: number): NodeState {
  return index === 0 ? "active" : "available";
}

export default function MissionsPage() {
  const groups = EVENT_ORDER.map((type) => ({
    type,
    missions: MISSIONS.filter((m) => m.event_type === type),
  })).filter((g) => g.missions.length > 0);

  return (
    <div className={`${styles.root} ops-grid-bg`}>
      <div className="container">
        {/* Header + edge status */}
        <div className={styles.header}>
          <div>
            <div className={styles.kicker}>
              <span className="pulse-dot" />
              Season Zero
            </div>
            <h1 className={`display ${styles.title}`}>Mission Board</h1>
            <p className={styles.subtitle}>
              Every mission runs inside a Cursor workspace with local Gemma4 as
              your only AI. Correctness first — speed is worth at most 10%.
            </p>
          </div>
          <div className={styles.edgeStatus}>
            <GemmaStatus />
            <span className={`mono ${styles.edgeNote}`}>edge mode · offline inference</span>
          </div>
        </div>

        {/* Progression rail */}
        <div className={`panel ${styles.railPanel}`}>
          <div className={styles.rail}>
            {MISSIONS.map((m, i) => (
              <Link key={m.id} href={`/missions/${m.id}`} className={styles.railStop}>
                {i > 0 && <span className={styles.railLine} aria-hidden />}
                <RailNode state={nodeState(i)} size={38}>
                  <MissionGlyph eventType={m.event_type} missionId={m.id} size={19} />
                </RailNode>
                <span className={`display ${styles.railLabel}`}>
                  {m.title.replace(/^(Relay|Marathon): /, "")}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Dossier groups */}
        {groups.map(({ type, missions }) => (
          <section key={type} className={styles.group}>
            <div className="section-label">{eventTypeLabel(type)}</div>
            <div className={styles.missionGrid}>
              {missions.map((m) => {
                return (
                  <article key={m.id} className={`panel hud-corners ${styles.dossier}`}>
                    <header className={styles.dossierHead}>
                      <span className={styles.dossierIcon}>
                        <MissionGlyph eventType={m.event_type} missionId={m.id} size={22} />
                      </span>
                      <div className={styles.dossierId}>
                        <span className={`tag ${eventTypeColor(m.event_type)}`}>
                          {eventTypeLabel(m.event_type)}
                        </span>
                        <span className={`mono ${styles.pips}`}>
                          {difficultyPips(m.difficulty)}
                        </span>
                      </div>
                    </header>

                    <h2 className={`display ${styles.dossierTitle}`}>{m.title}</h2>

                    <div className={styles.objective}>
                      <span className={`display ${styles.fieldLabel}`}>Objective</span>
                      <p>{m.summary}</p>
                    </div>

                    <div className={styles.metaGrid}>
                      <div>
                        <span className={`display ${styles.fieldLabel}`}>Timebox</span>
                        <span className="mono amber">
                          <IconTimer size={11} /> {m.timebox_minutes}m
                        </span>
                      </div>
                      <div>
                        <span className={`display ${styles.fieldLabel}`}>Reward</span>
                        <span className="mono signal">+{m.xp_base} XP</span>
                      </div>
                      <div>
                        <span className={`display ${styles.fieldLabel}`}>Constraint</span>
                        <span className={`mono ${styles.constraintVal}`}>local Gemma4</span>
                      </div>
                    </div>

                    <div className={styles.evidence}>
                      <span className={`display ${styles.fieldLabel}`}>Evidence Required</span>
                      <ul>
                        {m.evidence.map((f) => (
                          <li key={f} className="mono">
                            <IconFile size={11} /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={styles.dims}>
                      <span className={`display ${styles.fieldLabel}`}>Scored On</span>
                      <div className={styles.dimChips}>
                        {m.dimensions.map((d) => (
                          <span key={d} className="tag tag-muted">{d}</span>
                        ))}
                      </div>
                    </div>

                    <footer className={styles.dossierFoot}>
                      <Link href={`/missions/${m.id}`} className="btn btn-primary">
                        Start Mission →
                      </Link>
                      <Link
                        href={`/leaderboard?scope=mission&mission_id=${m.id}`}
                        className={styles.boardLink}
                      >
                        Mission board
                      </Link>
                    </footer>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

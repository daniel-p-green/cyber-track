import Link from "next/link";
import { MISSIONS } from "@/lib/missions";
import { eventTypeLabel, eventTypeColor, slopeForDifficulty } from "@/lib/utils";
import {
  MissionGlyph,
  RailNode,
  GemmaStatus,
  LocalChip,
  HexBadge,
  SlopeBadge,
  IconFile,
  IconTimer,
  type NodeState,
} from "../components/svg";
import styles from "./page.module.css";

function nodeState(index: number): NodeState {
  return index === 0 ? "active" : "available";
}

function lineClass(state: NodeState): string {
  if (state === "completed") return styles.lineCompleted;
  if (state === "active") return styles.lineActive;
  if (state === "locked") return styles.lineLocked;
  return styles.lineAvailable;
}

export default function MissionsPage() {
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
              Pick a mission here. Fly it in Cursor with Cursor Chat and local
              Gemma. Submit back here for score, AAR, and rank.
            </p>
          </div>
          <div className={styles.edgeStatus}>
            <span className={styles.chipRow}>
              <GemmaStatus />
              <LocalChip />
            </span>
            <span className={`mono ${styles.edgeNote}`}>edge mode · offline inference</span>
          </div>
        </div>

        {/* Progression rail */}
        <div className={`panel ${styles.railPanel}`}>
          <div className={styles.rail}>
            {MISSIONS.map((m, i) => {
              const slope = slopeForDifficulty(m.difficulty);
              return (
                <Link key={m.id} href={`/missions/${m.id}`} className={styles.railStop}>
                  {i > 0 && (
                    <span
                      className={`${styles.railLine} ${lineClass(nodeState(i))}`}
                      aria-hidden
                    />
                  )}
                  <RailNode state={nodeState(i)} size={38}>
                    <MissionGlyph eventType={m.event_type} missionId={m.id} size={19} />
                  </RailNode>
                  <span className={`display ${styles.railLabel}`}>
                    {m.title.replace(/^(Relay|Marathon): /, "")}
                  </span>
                  <SlopeBadge slope={slope.id} label={slope.label} withLabel={false} size={11} />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Route + slope keys */}
        <div className={styles.routeKey} aria-label="Route line key">
          <span className={styles.routeKeyItem}>
            <i className={`${styles.routeSample} ${styles.lineCompleted}`} /> Completed
          </span>
          <span className={styles.routeKeyItem}>
            <i className={`${styles.routeSample} ${styles.lineActive}`} /> Active
          </span>
          <span className={styles.routeKeyItem}>
            <i className={`${styles.routeSample} ${styles.lineAvailable}`} /> Available
          </span>
          <span className={styles.routeKeyItem}>
            <i className={`${styles.routeSample} ${styles.lineLocked}`} /> Locked
          </span>
        </div>
        <div className={styles.slopeKey}>
          <SlopeBadge slope="green" label="Green: qualification" size={12} />
          <SlopeBadge slope="blue" label="Blue: sprint" size={12} />
          <SlopeBadge slope="black" label="Black: advanced field" size={12} />
          <SlopeBadge slope="double-black" label="Double black: marathon" size={12} />
        </div>

        {/* Campaign grid — one continuous board, campaign order */}
        <div className={styles.missionGrid}>
          {MISSIONS.map((m, i) => {
            const slope = slopeForDifficulty(m.difficulty);
            return (
              <article key={m.id} className={`panel hud-corners ${styles.dossier}`}>
                <header className={styles.dossierHead}>
                  <HexBadge size={46} tone="muted" className={styles.dossierIcon}>
                    <MissionGlyph eventType={m.event_type} missionId={m.id} size={21} />
                  </HexBadge>
                  <div className={styles.dossierId}>
                    <span className={`mono ${styles.dossierNum}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={`tag ${eventTypeColor(m.event_type)}`}>
                      {eventTypeLabel(m.event_type)}
                    </span>
                  </div>
                  <SlopeBadge
                    slope={slope.id}
                    label={slope.shortLabel}
                    size={14}
                    className={styles.dossierSlope}
                  />
                </header>

                <h2 className={`display ${styles.dossierTitle}`}>{m.title}</h2>

                <p className={styles.objective}>{m.summary}</p>

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
                    <span className={`display ${styles.fieldLabel}`}>AI Allowed</span>
                    <span className={`mono ${styles.constraintVal}`}>local Gemma only</span>
                  </div>
                </div>

                <div className={styles.scoredOn}>
                  <span className={`display ${styles.fieldLabel}`}>Scored On</span>
                  <div className={styles.dimChips}>
                    {m.dimensions.slice(0, 3).map((d) => (
                      <span key={d} className="tag tag-muted">{d}</span>
                    ))}
                    {m.dimensions.length > 3 && (
                      <span className={`mono ${styles.dimMore}`}>
                        +{m.dimensions.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.evidence}>
                  <span className={`display ${styles.fieldLabel}`}>
                    Evidence · {m.evidence.length} file{m.evidence.length > 1 ? "s" : ""}
                  </span>
                  <ul>
                    {m.evidence.slice(0, 3).map((f) => (
                      <li key={f} className="mono">
                        <IconFile size={11} /> {f}
                      </li>
                    ))}
                    {m.evidence.length > 3 && (
                      <li className={`mono ${styles.evidenceMore}`}>
                        +{m.evidence.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>

                <footer className={styles.dossierFoot}>
                  <Link href={`/missions/${m.id}`} className="btn btn-primary">
                    Start Mission →
                  </Link>
                  <Link
                    href={`/leaderboard?scope=mission&mission_id=${m.id}`}
                    className={styles.boardLink}
                  >
                    Top runs
                  </Link>
                </footer>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

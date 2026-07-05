import Link from "next/link";
import { MISSIONS } from "@/lib/missions";
import { eventTypeLabel, eventTypeColor, slopeForDifficulty } from "@/lib/utils";
import {
  MissionGlyph,
  RailNode,
  GemmaStatus,
  HexBadge,
  SlopeBadge,
  IconTimer,
  type NodeState,
} from "../components/svg";
import VoiceBriefing from "../components/VoiceBriefing";
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
              Season One
            </div>
            <h1 className={`display ${styles.title}`}>Mission Board</h1>
            <p className={styles.subtitle}>
              Six incidents on the HALCYON grid, a synthetic training
              environment. Each one plants at least one confident model claim
              the evidence disproves. The mission is flown in Cursor; the
              score posts here.
            </p>
          </div>
          <div className={styles.edgeStatus}>
            <span className={styles.chipRow}>
              <GemmaStatus />
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
                  <span className={`display ${styles.railLabel}`}>{m.title}</span>
                  <SlopeBadge slope={slope.id} label={slope.label} withLabel={false} size={11} />
                </Link>
              );
            })}
          </div>
        </div>

        <div className={styles.slopeKey}>
          <SlopeBadge slope="green" label="Green: qualification" size={12} />
          <SlopeBadge slope="blue" label="Blue: sprint" size={12} />
          <SlopeBadge slope="black" label="Black: field" size={12} />
          <SlopeBadge slope="double-black" label="Double black: marathon" size={12} />
        </div>

        {/* Mission dossiers — scenario first */}
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

                <p className={styles.hook}>{m.hook}</p>

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
                    <span className={`display ${styles.fieldLabel}`}>Evidence</span>
                    <span className="mono">
                      {m.evidence.length} file{m.evidence.length > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className={styles.scoredOn}>
                  <span className={`display ${styles.fieldLabel}`}>Skills tested</span>
                  <div className={styles.dimChips}>
                    {m.skills.map((s) => (
                      <span key={s} className="tag tag-muted">{s}</span>
                    ))}
                  </div>
                </div>

                <footer className={styles.dossierFoot}>
                  <Link href={`/missions/${m.id}`} className="btn btn-primary">
                    Open Briefing →
                  </Link>
                  <VoiceBriefing briefingId={m.id} text={m.briefing} label="Voice" compact />
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

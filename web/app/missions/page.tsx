import Link from "next/link";
import { MISSIONS } from "@/lib/missions";
import { difficultyPips, eventTypeLabel, eventTypeColor } from "@/lib/utils";
import styles from "./page.module.css";

const EVENT_ORDER = ["qualification", "sprint", "field", "relay", "marathon"] as const;

export default function MissionsPage() {
  const groups = EVENT_ORDER.map((type) => ({
    type,
    missions: MISSIONS.filter((m) => m.event_type === type),
  })).filter((g) => g.missions.length > 0);

  return (
    <div className={styles.root}>
      <div className="container">
        <div className={styles.header}>
          <div className={`tag tag-signal`} style={{ marginBottom: "12px" }}>Season Zero</div>
          <h1 className={`display ${styles.title}`}>Mission Board</h1>
          <p className={styles.subtitle}>
            All missions run inside a Cursor workspace with local Gemma4 only.
            Pick your entry point and deploy.
          </p>
        </div>

        {groups.map(({ type, missions }) => (
          <section key={type} className={styles.group}>
            <div className="section-label">{eventTypeLabel(type)}</div>
            <div className={styles.missionGrid}>
              {missions.map((m) => (
                <Link
                  key={m.id}
                  href={`/missions/${m.id}`}
                  className={`panel ${styles.card}`}
                >
                  <div className={styles.cardTop}>
                    <span className={`tag ${eventTypeColor(m.event_type)}`}>
                      {eventTypeLabel(m.event_type)}
                    </span>
                    <span className={`mono ${styles.pips}`}>
                      {difficultyPips(m.difficulty)}
                    </span>
                  </div>

                  <h2 className={`display ${styles.cardTitle}`}>{m.title}</h2>
                  <p className={styles.cardSummary}>{m.summary}</p>

                  <div className={styles.skills}>
                    {m.skills.map((s) => (
                      <span key={s} className={`tag tag-muted ${styles.skill}`}>{s}</span>
                    ))}
                  </div>

                  <div className={styles.cardMeta}>
                    <span className="mono" style={{ color: "var(--amber)", fontSize: "12px" }}>
                      ⏱ {m.timebox_minutes}m timebox
                    </span>
                    <span className="mono" style={{ color: "var(--signal)", fontSize: "12px" }}>
                      +{m.xp_base} XP
                    </span>
                    <span className={styles.flyLink}>Deploy →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

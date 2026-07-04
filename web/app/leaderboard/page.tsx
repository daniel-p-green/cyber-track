import Link from "next/link";
import { getAllOperators, getAllSubmissions, Submission, Operator } from "@/lib/store";
import { getRankForXP } from "@/lib/ranks";
import { MISSIONS } from "@/lib/missions";
import { formatElapsed } from "@/lib/utils";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

function buildGlobalEntries(ops: Operator[], subs: Submission[]) {
  return ops
    .sort((a, b) => b.xp - a.xp)
    .map((op, i) => ({
      pos: i + 1,
      callsign: op.callsign,
      rank: op.rank,
      glyph: getRankForXP(op.xp).glyph,
      xp: op.xp,
      missions: subs.filter((s) => s.callsign === op.callsign && !s.flags.suspicious_fast).length,
      seeded: op.seeded,
      flags: { suspicious_fast: false, missing_telemetry: false },
    }));
}

function buildSeasonEntries(ops: Operator[], subs: Submission[]) {
  const seasonSubs = subs.filter((s) => s.season === "season-zero");
  const xpMap = new Map<string, number>();
  const countMap = new Map<string, number>();
  for (const s of seasonSubs) {
    if (!s.flags.suspicious_fast) {
      xpMap.set(s.callsign, (xpMap.get(s.callsign) ?? 0) + s.xp_awarded);
      countMap.set(s.callsign, (countMap.get(s.callsign) ?? 0) + 1);
    }
  }
  const opsMap = new Map(ops.map((o) => [o.callsign, o]));
  return Array.from(xpMap.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([callsign, xp], i) => {
      const op = opsMap.get(callsign);
      return {
        pos: i + 1,
        callsign,
        rank: op?.rank ?? "Recruit",
        glyph: getRankForXP(op?.xp ?? 0).glyph,
        xp,
        missions: countMap.get(callsign) ?? 0,
        seeded: op?.seeded,
        flags: { suspicious_fast: false, missing_telemetry: false },
      };
    });
}

function buildMissionEntries(missionId: string, ops: Operator[], subs: Submission[]) {
  const opsMap = new Map(ops.map((o) => [o.callsign, o]));
  return subs
    .filter((s) => s.mission_id === missionId)
    .sort((a, b) => {
      if (a.flags.suspicious_fast && !b.flags.suspicious_fast) return 1;
      if (!a.flags.suspicious_fast && b.flags.suspicious_fast) return -1;
      return b.total - a.total || a.elapsed_seconds - b.elapsed_seconds;
    })
    .map((sub, i) => {
      const op = opsMap.get(sub.callsign);
      return {
        pos: sub.flags.suspicious_fast ? null : i + 1,
        callsign: sub.callsign,
        rank: op?.rank ?? "Recruit",
        glyph: getRankForXP(op?.xp ?? 0).glyph,
        score: sub.total,
        maxScore: sub.max_total,
        elapsed: sub.elapsed_seconds,
        runId: sub.run_id,
        seeded: sub.seeded,
        flags: sub.flags,
      };
    });
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string; mission_id?: string }>;
}) {
  const sp = await searchParams;
  const scope = sp.scope ?? "global";
  const missionId = sp.mission_id ?? MISSIONS[0].id;

  const [ops, subs] = await Promise.all([getAllOperators(), getAllSubmissions()]);

  const globalEntries = buildGlobalEntries([...ops], subs);
  const seasonEntries = buildSeasonEntries([...ops], subs);
  const missionEntries = buildMissionEntries(missionId, ops, subs);

  const activeMission = MISSIONS.find((m) => m.id === missionId) ?? MISSIONS[0];

  return (
    <div className={styles.root}>
      <div className="container">
        <h1 className={`display ${styles.title}`}>Scoreboard</h1>
        <p className={styles.subtitle}>Season Zero · Offline AI Operator Readiness</p>

        {/* Scope tabs */}
        <div className={styles.tabs}>
          <Link
            href="/leaderboard?scope=global"
            className={`${styles.tab} ${scope === "global" ? styles.tabActive : ""}`}
          >
            Global
          </Link>
          <Link
            href="/leaderboard?scope=season"
            className={`${styles.tab} ${scope === "season" ? styles.tabActive : ""}`}
          >
            Season Zero
          </Link>
          <div className={styles.tabSep} />
          {MISSIONS.map((m) => (
            <Link
              key={m.id}
              href={`/leaderboard?scope=mission&mission_id=${m.id}`}
              className={`${styles.tab} ${scope === "mission" && missionId === m.id ? styles.tabActive : ""}`}
            >
              {m.title}
            </Link>
          ))}
        </div>

        {/* Global / Season table */}
        {(scope === "global" || scope === "season") && (
          <div className={`panel ${styles.tableWrap}`}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Callsign</th>
                  <th>Rank</th>
                  <th>XP</th>
                  <th>Missions</th>
                </tr>
              </thead>
              <tbody>
                {(scope === "global" ? globalEntries : seasonEntries).map((entry) => (
                  <tr key={entry.callsign}>
                    <td className={`mono ${styles.pos}`}>{entry.pos}</td>
                    <td>
                      <Link href={`/operators/${entry.callsign}`} className={`mono ${styles.callsign}`}>
                        {entry.callsign}
                      </Link>
                      {entry.seeded && (
                        <span className="tag tag-muted" style={{ fontSize: "9px", marginLeft: "8px" }}>demo seed</span>
                      )}
                    </td>
                    <td>
                      <span className={styles.glyph}>{entry.glyph}</span>{" "}
                      <span className={`display ${styles.rankName}`}>{entry.rank}</span>
                    </td>
                    <td className={`mono ${styles.xp}`}>{entry.xp.toLocaleString()}</td>
                    <td className={`mono ${styles.missions}`}>{entry.missions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mission scope table */}
        {scope === "mission" && (
          <>
            <div className={styles.missionHeader}>
              <span className="display" style={{ fontSize: "20px", color: "var(--text)" }}>
                {activeMission.title}
              </span>
              <span className="muted" style={{ fontSize: "13px" }}>
                {activeMission.timebox_minutes}m · +{activeMission.xp_base} XP base
              </span>
            </div>
            <div className={`panel ${styles.tableWrap}`}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Callsign</th>
                    <th>Rank</th>
                    <th>Score</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {missionEntries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={styles.empty}>No submissions yet.</td>
                    </tr>
                  ) : (
                    missionEntries.map((entry) => (
                      <tr key={entry.runId} className={entry.flags.suspicious_fast ? styles.suspiciousRow : ""}>
                        <td className={`mono ${styles.pos}`} style={{ color: "var(--muted)" }}>
                          {entry.pos ?? "—"}
                        </td>
                        <td>
                          <Link
                            href={`/operators/${entry.callsign}`}
                            className={`mono ${styles.callsign}`}
                            style={{ color: entry.flags.suspicious_fast ? "var(--muted)" : undefined }}
                          >
                            {entry.callsign}
                          </Link>
                          {entry.seeded && (
                            <span className="tag tag-muted" style={{ fontSize: "9px", marginLeft: "8px" }}>demo seed</span>
                          )}
                        </td>
                        <td>
                          <span className={styles.glyph}>{entry.glyph}</span>{" "}
                          <span className={`display ${styles.rankName}`}>{entry.rank}</span>
                        </td>
                        <td className="mono" style={{ color: entry.flags.suspicious_fast ? "var(--muted)" : "var(--signal)" }}>
                          {entry.score}/{entry.maxScore}
                        </td>
                        <td className="mono muted">
                          {formatElapsed(entry.elapsed ?? 0)}
                        </td>
                        <td>
                          {entry.flags.suspicious_fast ? (
                            <span className="tag tag-alert" style={{ fontSize: "10px" }}>
                              UNVERIFIED · SUSPICIOUS TIME
                            </span>
                          ) : entry.flags.missing_telemetry ? (
                            <span className="tag tag-amber" style={{ fontSize: "10px" }}>
                              NO TELEMETRY
                            </span>
                          ) : (
                            <span className="tag tag-signal" style={{ fontSize: "10px" }}>
                              VERIFIED
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        <p className={styles.disclaimer}>
          Suspicious runs are excluded from podium positions. Speed contributes ≤10% of score; impossible times are flagged, not rewarded.
        </p>
      </div>
    </div>
  );
}

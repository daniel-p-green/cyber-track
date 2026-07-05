import Link from "next/link";
import { getAllOperators, getAllSubmissions, Submission, Operator } from "@/lib/store";
import { getRankForXP, RANKS } from "@/lib/ranks";
import { MISSIONS } from "@/lib/missions";
import { formatElapsed, slopeForDifficulty } from "@/lib/utils";
import {
  GemmaStatus,
  RankChevrons,
  RankPlate,
  SlopeBadge,
  IconSuspicious,
  IconOffline,
} from "../components/svg";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

function rankTier(xp: number): number {
  return RANKS.findIndex((r) => r.name === getRankForXP(xp).name) + 1;
}

function buildGlobalEntries(ops: Operator[], subs: Submission[]) {
  return ops
    .sort((a, b) => b.xp - a.xp)
    .map((op, i) => ({
      pos: i + 1,
      callsign: op.callsign,
      rank: op.rank,
      tier: rankTier(op.xp),
      xp: op.xp,
      missions: subs.filter((s) => s.callsign === op.callsign && !s.flags.suspicious_fast).length,
      seeded: op.seeded,
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
        tier: rankTier(op?.xp ?? 0),
        xp,
        missions: countMap.get(callsign) ?? 0,
        seeded: op?.seeded,
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
        tier: rankTier(op?.xp ?? 0),
        score: sub.total,
        maxScore: sub.max_total,
        elapsed: sub.elapsed_seconds,
        runId: sub.run_id,
        seeded: sub.seeded || op?.seeded,
        flags: sub.flags,
        local: sub.local_model?.simulated === false,
      };
    });
}

function SeedMark({ seeded }: { seeded?: boolean }) {
  if (!seeded) return null;
  return (
    <span
      className={`display ${styles.seedMark}`}
      title="Demo seed row: sample data, not a real run"
      aria-label="demo seed data"
    >
      demo
    </span>
  );
}

function withPos<T extends { seeded?: boolean }>(entries: T[]): (T & { pos: number })[] {
  return entries.map((e, i) => ({ ...e, pos: i + 1 }));
}

export default async function ArenaPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string; mission_id?: string; demo?: string }>;
}) {
  const sp = await searchParams;
  const scope = sp.scope ?? "global";
  const missionId = sp.mission_id ?? MISSIONS[0].id;
  // A populated field by default; `demo=0` strips seed rows to real runs only.
  const showDemo = sp.demo !== "0";

  const [ops, subs] = await Promise.all([getAllOperators(), getAllSubmissions()]);

  const globalAll = buildGlobalEntries([...ops], subs);
  const seasonAll = buildSeasonEntries([...ops], subs);
  const missionAll = buildMissionEntries(missionId, ops, subs);
  const activeMission = MISSIONS.find((m) => m.id === missionId) ?? MISSIONS[0];

  // Real runs lead. Demo seed rows are reference data, hidden by default.
  const globalEntries = showDemo ? globalAll : withPos(globalAll.filter((e) => !e.seeded));
  const seasonEntries = showDemo ? seasonAll : withPos(seasonAll.filter((e) => !e.seeded));
  const missionEntries = showDemo
    ? missionAll
    : missionAll
        .filter((e) => !e.seeded)
        .map((e, i) => ({ ...e, pos: e.flags.suspicious_fast ? null : i + 1 }));

  const demoCount =
    scope === "mission"
      ? missionAll.filter((e) => e.seeded).length
      : (scope === "global" ? globalAll : seasonAll).filter((e) => e.seeded).length;

  const podium = globalEntries.slice(0, 3);

  const demoToggleHref = (() => {
    const params = new URLSearchParams();
    params.set("scope", scope);
    if (scope === "mission") params.set("mission_id", missionId);
    if (showDemo) params.set("demo", "0");
    return `/leaderboard?${params.toString()}`;
  })();

  return (
    <div className={styles.root}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.kicker}>
              <span className="pulse-dot" />
              Season One Arena
            </div>
            <h1 className={`display ${styles.title}`}>Leaderboard</h1>
          </div>
          <span className={styles.headerChips}>
            <GemmaStatus />
          </span>
        </div>

        {/* Podium — global standings */}
        {scope === "global" && podium.length >= 3 && (
          <div className={styles.podium}>
            {[podium[1], podium[0], podium[2]].map((entry, visualIdx) => {
              const isFirst = visualIdx === 1;
              return (
                <Link
                  key={entry.callsign}
                  href={`/operators/${entry.callsign}`}
                  className={`panel ${styles.podiumCard} ${isFirst ? `hud-corners hud-corners-signal ${styles.podiumFirst}` : ""}`}
                >
                  {entry.seeded && (
                    <span
                      className={`display ${styles.podiumSeed}`}
                      title="Demo reference row: sample data, not a real run"
                      aria-label="demo reference data"
                    >
                      demo
                    </span>
                  )}
                  <span className={`mono ${styles.podiumPos}`}>
                    {String(entry.pos).padStart(2, "0")}
                  </span>
                  <RankPlate letter={entry.callsign[0]} size={isFirst ? 52 : 42} />
                  <span className={`mono ${styles.podiumCallsign}`}>
                    {entry.callsign}
                  </span>
                  <RankChevrons tier={entry.tier} size={9} />
                  <span className={`display ${styles.podiumRank}`}>{entry.rank}</span>
                  <span className={`mono ${styles.podiumXp}`}>
                    {entry.xp.toLocaleString()} XP
                  </span>
                </Link>
              );
            })}
          </div>
        )}

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
            Season One
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
            {(scope === "global" ? globalEntries : seasonEntries).length === 0 ? (
              <div className={styles.emptyBoard}>
                <p>No verified runs on the board yet.</p>
                <p className={styles.emptySub}>
                  Fly a mission in Cursor and publish the run to claim the top
                  spot.
                </p>
                <Link href="/qualification" className="btn btn-primary">
                  Start Setup →
                </Link>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Callsign</th>
                    <th>Rank</th>
                    <th className={styles.right}>XP</th>
                    <th className={styles.right}>Missions</th>
                  </tr>
                </thead>
                <tbody>
                  {(scope === "global" ? globalEntries : seasonEntries).map((entry) => (
                    <tr key={entry.callsign} className={entry.seeded ? styles.seedRow : ""}>
                      <td className={`mono ${styles.pos}`}>{entry.pos}</td>
                      <td>
                        <Link href={`/operators/${entry.callsign}`} className={`mono ${styles.callsign}`}>
                          {entry.callsign}
                        </Link>
                        <SeedMark seeded={entry.seeded} />
                      </td>
                      <td>
                        <span className={styles.rankCell}>
                          <RankChevrons tier={entry.tier} size={8} />
                          <span className={`display ${styles.rankName}`}>{entry.rank}</span>
                        </span>
                      </td>
                      <td className={`mono ${styles.xp} ${styles.right}`}>{entry.xp.toLocaleString()}</td>
                      <td className={`mono ${styles.missions} ${styles.right}`}>{entry.missions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Mission scope table */}
        {scope === "mission" && (
          <>
            <div className={styles.missionHeader}>
              <span className={`display ${styles.missionTitle}`}>{activeMission.title}</span>
              <SlopeBadge
                slope={slopeForDifficulty(activeMission.difficulty).id}
                label={slopeForDifficulty(activeMission.difficulty).label}
                size={13}
              />
              <span className="muted">
                {activeMission.timebox_minutes}m timebox · +{activeMission.xp_base} XP base
              </span>
            </div>
            <div className={`panel ${styles.tableWrap}`}>
              {missionEntries.length === 0 ? (
                <div className={styles.emptyBoard}>
                  <p>No verified runs posted for this mission yet.</p>
                  <Link href={`/missions/${missionId}`} className="btn btn-primary">
                    Open the Briefing →
                  </Link>
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Callsign</th>
                      <th>Rank</th>
                      <th className={styles.right}>Score</th>
                      <th className={styles.right}>Time</th>
                      <th>Status</th>
                      <th className={styles.right}>AAR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {missionEntries.map((entry) => (
                      <tr
                        key={entry.runId}
                        className={`${entry.flags.suspicious_fast ? styles.suspiciousRow : ""} ${entry.seeded ? styles.seedRow : ""}`}
                      >
                        <td className={`mono ${styles.pos}`}>
                          {entry.pos ?? <IconSuspicious size={13} />}
                        </td>
                        <td>
                          <Link
                            href={`/operators/${entry.callsign}`}
                            className={`mono ${styles.callsign}`}
                            style={{ color: entry.flags.suspicious_fast ? "var(--muted)" : undefined }}
                          >
                            {entry.callsign}
                          </Link>
                          <SeedMark seeded={entry.seeded} />
                        </td>
                        <td>
                          <span className={styles.rankCell}>
                            <RankChevrons tier={entry.tier} size={8} />
                            <span className={`display ${styles.rankName}`}>{entry.rank}</span>
                          </span>
                        </td>
                        <td
                          className={`mono ${styles.right}`}
                          style={{ color: entry.flags.suspicious_fast ? "var(--muted)" : "var(--signal)" }}
                        >
                          {entry.score}/{entry.maxScore}
                        </td>
                        <td className={`mono muted ${styles.right}`}>
                          {formatElapsed(entry.elapsed ?? 0)}
                        </td>
                        <td>
                          {entry.flags.suspicious_fast ? (
                            <span className="tag tag-amber">
                              <IconSuspicious size={11} /> Suspicious time
                            </span>
                          ) : entry.flags.missing_telemetry ? (
                            <span className="tag tag-muted">No telemetry</span>
                          ) : (
                            <span className="tag tag-signal">Verified</span>
                          )}
                        </td>
                        <td className={styles.right}>
                          <Link href={`/runs/${entry.runId}`} className={styles.aarLink}>
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* Demo data toggle — reference rows stay out of the way */}
        {demoCount > 0 && (
          <div className={styles.demoNote}>
            <Link href={demoToggleHref} className={styles.demoToggle}>
              {showDemo
                ? "Show real runs only"
                : `Show the full field (${demoCount} reference row${demoCount === 1 ? "" : "s"})`}
            </Link>
            <span>Reference rows carry a demo tag and never outrank a verified run for podium credit.</span>
          </div>
        )}

        {/* Legend */}
        <div className={`panel-2 ${styles.legend}`}>
          <div className={styles.legendItem}>
            <span className={`display ${styles.legendKey}`}>XP</span>
            <span>Mission score × difficulty. XP sets your rank tier.</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendIcon}><IconSuspicious size={13} /></span>
            <span>Impossibly fast run: flagged, zero XP, no podium.</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendIcon} style={{ color: "var(--ice)" }}>
              <IconOffline size={13} />
            </span>
            <span>Every verified run used a local model, checked before the mission.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

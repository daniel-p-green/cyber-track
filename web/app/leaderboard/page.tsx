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
        seeded: sub.seeded,
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

export default async function ArenaPage({
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

  const podium = globalEntries.slice(0, 3);

  return (
    <div className={styles.root}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.kicker}>
              <span className="pulse-dot" />
              Season Zero Arena
            </div>
            <h1 className={`display ${styles.title}`}>Scoreboard</h1>
          </div>
          <GemmaStatus />
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
                      title="Demo seed row: sample data, not a real run"
                      aria-label="demo seed data"
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
            Season Zero
          </Link>
          <div className={styles.tabSep} />
          {MISSIONS.map((m) => (
            <Link
              key={m.id}
              href={`/leaderboard?scope=mission&mission_id=${m.id}`}
              className={`${styles.tab} ${scope === "mission" && missionId === m.id ? styles.tabActive : ""}`}
            >
              {m.title.replace(/^(Relay|Marathon): /, "")}
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
                  <th className={styles.right}>XP</th>
                  <th className={styles.right}>Missions</th>
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
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Callsign</th>
                    <th>Rank</th>
                    <th className={styles.right}>Score</th>
                    <th className={styles.right}>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {missionEntries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={styles.empty}>
                        No runs posted yet. Be first on the board.
                      </td>
                    </tr>
                  ) : (
                    missionEntries.map((entry) => (
                      <tr
                        key={entry.runId}
                        className={entry.flags.suspicious_fast ? styles.suspiciousRow : ""}
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Legend */}
        <div className={`panel-2 ${styles.legend}`}>
          <div className={styles.legendItem}>
            <span className={`display ${styles.legendKey}`}>XP</span>
            <span>Mission score × difficulty. XP sets your rank tier.</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`display ${styles.legendKey}`}>Rank</span>
            <span>{RANKS.map((r) => r.name).join(" → ")}.</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendIcon}><IconSuspicious size={13} /></span>
            <span>Impossibly fast run: flagged, zero XP, no podium.</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendIcon} style={{ color: "var(--ice)" }}>
              <IconOffline size={13} />
            </span>
            <span>Every scored run used local Gemma4, verified before the mission.</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`display ${styles.legendSeed}`}>demo</span>
            <span>Sample data for the demo.</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendSlopes}>
              <SlopeBadge slope="green" withLabel={false} size={11} />
              <SlopeBadge slope="blue" withLabel={false} size={11} />
              <SlopeBadge slope="black" withLabel={false} size={11} />
              <SlopeBadge slope="double-black" withLabel={false} size={11} />
            </span>
            <span>
              Difficulty: green qualification, blue sprint, black advanced,
              double-black marathon.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

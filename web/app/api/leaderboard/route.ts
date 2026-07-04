import { NextRequest, NextResponse } from "next/server";
import { getAllOperators, getAllSubmissions, Operator } from "@/lib/store";
import { getRankForXP } from "@/lib/ranks";
import { MISSIONS } from "@/lib/missions";

interface LeaderboardEntry {
  rank_position: number;
  callsign: string;
  rank: string;
  rank_glyph: string;
  xp?: number;
  missions_completed?: number;
  total?: number;
  max_total?: number;
  elapsed_seconds?: number;
  mission_id?: string;
  run_id?: string;
  submitted_at?: string;
  flags: { suspicious_fast: boolean; missing_telemetry: boolean };
  seeded?: boolean;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") ?? "global";
  const mission_id = searchParams.get("mission_id") ?? "";

  const [allOps, allSubs] = await Promise.all([getAllOperators(), getAllSubmissions()]);

  const opsMap = new Map<string, Operator>(allOps.map((o) => [o.callsign, o]));

  if (scope === "global") {
    const sorted = [...allOps].sort((a, b) => b.xp - a.xp);
    const entries: LeaderboardEntry[] = sorted.map((op, i) => {
      const subCount = allSubs.filter(
        (s) => s.callsign === op.callsign && !s.flags.suspicious_fast
      ).length;
      const rankInfo = getRankForXP(op.xp);
      return {
        rank_position: i + 1,
        callsign: op.callsign,
        rank: op.rank,
        rank_glyph: rankInfo.glyph,
        xp: op.xp,
        missions_completed: subCount,
        flags: { suspicious_fast: false, missing_telemetry: false },
        seeded: op.seeded,
      };
    });
    return NextResponse.json({ scope: "global", entries });
  }

  if (scope === "season") {
    const seasonSubs = allSubs.filter((s) => s.season === "season-zero");
    const xpBySeason = new Map<string, number>();
    for (const sub of seasonSubs) {
      if (!sub.flags.suspicious_fast) {
        xpBySeason.set(sub.callsign, (xpBySeason.get(sub.callsign) ?? 0) + sub.xp_awarded);
      }
    }
    const entries: LeaderboardEntry[] = Array.from(xpBySeason.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([callsign, xp], i) => {
        const op = opsMap.get(callsign);
        const rankInfo = getRankForXP(op?.xp ?? 0);
        return {
          rank_position: i + 1,
          callsign,
          rank: op?.rank ?? "Recruit",
          rank_glyph: rankInfo.glyph,
          xp,
          missions_completed: seasonSubs.filter(
            (s) => s.callsign === callsign && !s.flags.suspicious_fast
          ).length,
          flags: { suspicious_fast: false, missing_telemetry: false },
          seeded: op?.seeded,
        };
      });
    return NextResponse.json({ scope: "season", season: "season-zero", entries });
  }

  if (scope === "mission") {
    if (!mission_id) {
      return NextResponse.json({ error: "mission_id is required for scope=mission" }, { status: 400 });
    }
    const mission = MISSIONS.find((m) => m.id === mission_id);
    if (!mission) {
      return NextResponse.json({ error: `Unknown mission_id: ${mission_id}` }, { status: 404 });
    }
    const missionSubs = allSubs
      .filter((s) => s.mission_id === mission_id)
      .sort((a, b) => {
        // Suspicious entries go to the bottom
        if (a.flags.suspicious_fast && !b.flags.suspicious_fast) return 1;
        if (!a.flags.suspicious_fast && b.flags.suspicious_fast) return -1;
        return b.total - a.total || a.elapsed_seconds - b.elapsed_seconds;
      });

    const entries: LeaderboardEntry[] = missionSubs.map((sub, i) => {
      const op = opsMap.get(sub.callsign);
      const rankInfo = getRankForXP(op?.xp ?? 0);
      return {
        rank_position: i + 1,
        callsign: sub.callsign,
        rank: op?.rank ?? "Recruit",
        rank_glyph: rankInfo.glyph,
        total: sub.total,
        max_total: sub.max_total,
        elapsed_seconds: sub.elapsed_seconds,
        mission_id: sub.mission_id,
        run_id: sub.run_id,
        submitted_at: sub.submitted_at,
        flags: sub.flags,
        seeded: sub.seeded,
      };
    });
    return NextResponse.json({ scope: "mission", mission_id, mission_title: mission.title, entries });
  }

  return NextResponse.json({ error: "scope must be global, season, or mission" }, { status: 400 });
}

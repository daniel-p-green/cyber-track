import { NextRequest, NextResponse } from "next/server";
import {
  addSubmission,
  getAllSubmissions,
  getAllOperators,
  getSubmissionByRunId,
  upsertOperator,
  Submission,
} from "@/lib/store";
import { getMissionById } from "@/lib/missions";

const CALLSIGN_RE = /^[A-Z0-9-]{3,20}$/;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Required fields
  const {
    run_id,
    mission_id,
    season,
    callsign: rawCallsign,
    total,
    max_total,
    elapsed_seconds,
    dimensions,
    local_model,
    telemetry_digest,
    schema: bodySchema,
  } = body as Record<string, unknown>;

  if (bodySchema !== "cybertrack.submission.v1") {
    return NextResponse.json(
      { error: "schema must be 'cybertrack.submission.v1'" },
      { status: 400 }
    );
  }

  if (!run_id || typeof run_id !== "string") {
    return NextResponse.json({ error: "run_id is required" }, { status: 400 });
  }
  if (!mission_id || typeof mission_id !== "string") {
    return NextResponse.json({ error: "mission_id is required" }, { status: 400 });
  }
  if (!rawCallsign || typeof rawCallsign !== "string") {
    return NextResponse.json({ error: "callsign is required" }, { status: 400 });
  }

  const callsign = (rawCallsign as string).toUpperCase();
  if (!CALLSIGN_RE.test(callsign)) {
    return NextResponse.json({ error: "Invalid callsign format" }, { status: 400 });
  }

  // Validate mission
  const mission = getMissionById(mission_id);
  if (!mission) {
    return NextResponse.json({ error: `Unknown mission_id: ${mission_id}` }, { status: 400 });
  }

  // Reject duplicate run_id
  const existing = await getSubmissionByRunId(run_id);
  if (existing) {
    return NextResponse.json(
      { error: `Duplicate run_id: ${run_id}` },
      { status: 409 }
    );
  }

  // Auto-create operator
  await upsertOperator(callsign);

  // Server-side flag computation
  const elapsedSec = typeof elapsed_seconds === "number" ? elapsed_seconds : 0;
  const suspicious_fast = elapsedSec < mission.expected_seconds.min;
  const missing_telemetry = !telemetry_digest || typeof telemetry_digest !== "string";

  const totalPoints = typeof total === "number" ? total : 0;
  const maxPoints = typeof max_total === "number" ? max_total : 100;

  // XP: only awarded for non-suspicious runs
  const diffMultiplier = 1 + (mission.difficulty - 1) * 0.25;
  const xp_awarded = suspicious_fast
    ? 0
    : Math.round((totalPoints / Math.max(maxPoints, 1)) * mission.xp_base * diffMultiplier);

  const submission: Submission = {
    run_id,
    mission_id,
    season: (season as "season-zero") ?? "season-zero",
    callsign,
    total: totalPoints,
    max_total: maxPoints,
    elapsed_seconds: elapsedSec,
    submitted_at: new Date().toISOString(),
    dimensions: (dimensions as Submission["dimensions"]) ?? {},
    flags: { suspicious_fast, missing_telemetry },
    local_model: (local_model as Submission["local_model"]) ?? {
      provider: "ollama",
      model: "gemma4:latest",
      simulated: false,
    },
    xp_awarded,
  };

  const { promoted, previousRank, newRank } = await addSubmission(submission, xp_awarded);

  // Leaderboard position (global by XP)
  const allOps = await getAllOperators();
  allOps.sort((a, b) => b.xp - a.xp);
  const leaderboard_position = allOps.findIndex((o) => o.callsign === callsign) + 1;

  const allSubs = await getAllSubmissions();
  const missionSubs = allSubs
    .filter((s) => s.mission_id === mission_id && !s.flags.suspicious_fast)
    .sort((a, b) => b.total - a.total || a.elapsed_seconds - b.elapsed_seconds);
  const missionPosition = missionSubs.findIndex((s) => s.run_id === run_id) + 1;

  return NextResponse.json({
    accepted: true,
    operator: allOps.find((o) => o.callsign === callsign),
    promoted,
    previous_rank: previousRank,
    new_rank: newRank,
    leaderboard_position,
    mission_position: missionPosition,
    flags: submission.flags,
  });
}

import { getRankForXP } from "./ranks";

// ── Data model ─────────────────────────────────────────────────────────────

export interface Operator {
  callsign: string;
  github_url?: string;
  x_url?: string;
  xp: number;
  rank: string;
  created_at: string;
  seeded?: boolean;
}

export interface SubmissionDimension {
  points: number;
  max: number;
}

/** Per-check detail from the deterministic scorer (cybertrack.score.v1). */
export interface SubmissionCheck {
  id: string;
  label: string;
  passed: boolean;
  points: number;
  max: number;
  dimension: string;
}

export interface Submission {
  run_id: string;
  mission_id: string;
  season: "season-zero";
  callsign: string;
  total: number;
  max_total: number;
  elapsed_seconds: number;
  submitted_at: string;
  dimensions: Record<string, SubmissionDimension>;
  checks?: SubmissionCheck[];
  ask_count?: number;
  flags: {
    suspicious_fast: boolean;
    missing_telemetry: boolean;
  };
  local_model: {
    provider: string;
    model: string;
    simulated: boolean;
  };
  xp_awarded: number;
  seeded?: boolean;
}

export interface StoreData {
  operators: Operator[];
  submissions: Submission[];
}

// ── Seed data ──────────────────────────────────────────────────────────────

function buildSeedData(): StoreData {
  const operators: Operator[] = [
    { callsign: "HELIX-9", github_url: "https://github.com/example", x_url: "https://x.com/example", xp: 4210, rank: "Commander", created_at: "2026-06-01T09:00:00Z", seeded: true },
    { callsign: "KESTREL", github_url: "https://github.com/example", xp: 2850, rank: "Warden", created_at: "2026-06-02T10:00:00Z", seeded: true },
    { callsign: "RIDGELINE", xp: 1650, rank: "Sentinel", created_at: "2026-06-03T11:00:00Z", seeded: true },
    { callsign: "VECTOR-6", xp: 920, rank: "Specialist", created_at: "2026-06-04T12:00:00Z", seeded: true },
    { callsign: "LOWLIGHT", xp: 410, rank: "Operator", created_at: "2026-06-05T13:00:00Z", seeded: true },
    { callsign: "MERIDIAN", xp: 80, rank: "Recruit", created_at: "2026-06-06T14:00:00Z", seeded: true },
    { callsign: "APEX-7", xp: 1280, rank: "Sentinel", created_at: "2026-06-07T08:00:00Z", seeded: true },
    { callsign: "IRONCLAD", xp: 3100, rank: "Commander", created_at: "2026-06-08T07:00:00Z", seeded: true },
  ];

  const dims = (mc: number, mm: number, ed: number, em: number, hal: number, ham: number) => ({
    mission_completion: { points: mc, max: mm },
    evidence_discipline: { points: ed, max: em },
    hallucination_resistance: { points: hal, max: ham },
    tool_reliability: { points: 5, max: 5 },
    prompt_discipline: { points: 4, max: 5 },
    communication_quality: { points: 4, max: 5 },
  });

  const submissions: Submission[] = [
    // HELIX-9 – marathon (top score)
    {
      run_id: "seed-helix9-marathon-01",
      mission_id: "marathon_degraded_comms",
      season: "season-zero",
      callsign: "HELIX-9",
      total: 91,
      max_total: 100,
      elapsed_seconds: 1240,
      submitted_at: "2026-06-10T14:30:00Z",
      dimensions: dims(42, 45, 13, 15, 9, 10),
      flags: { suspicious_fast: false, missing_telemetry: false },
      local_model: { provider: "ollama", model: "gemma4:latest", simulated: false },
      xp_awarded: 798,
      seeded: true,
    },
    // HELIX-9 – field sprint
    {
      run_id: "seed-helix9-sprint-01",
      mission_id: "sprint_signal_lost",
      season: "season-zero",
      callsign: "HELIX-9",
      total: 88,
      max_total: 100,
      elapsed_seconds: 390,
      submitted_at: "2026-06-09T10:15:00Z",
      dimensions: dims(38, 45, 12, 15, 9, 10),
      flags: { suspicious_fast: false, missing_telemetry: false },
      local_model: { provider: "ollama", model: "gemma4:latest", simulated: false },
      xp_awarded: 330,
      seeded: true,
    },
    // KESTREL – field patch
    {
      run_id: "seed-kestrel-field-01",
      mission_id: "field_patch_edge_agent",
      season: "season-zero",
      callsign: "KESTREL",
      total: 84,
      max_total: 100,
      elapsed_seconds: 820,
      submitted_at: "2026-06-11T16:00:00Z",
      dimensions: dims(37, 45, 12, 15, 8, 10),
      flags: { suspicious_fast: false, missing_telemetry: false },
      local_model: { provider: "ollama", model: "gemma4:latest", simulated: false },
      xp_awarded: 420,
      seeded: true,
    },
    // KESTREL – relay
    {
      run_id: "seed-kestrel-relay-01",
      mission_id: "relay_gemma_handoff",
      season: "season-zero",
      callsign: "KESTREL",
      total: 77,
      max_total: 100,
      elapsed_seconds: 1100,
      submitted_at: "2026-06-12T09:00:00Z",
      dimensions: dims(33, 45, 11, 15, 7, 10),
      flags: { suspicious_fast: false, missing_telemetry: true },
      local_model: { provider: "ollama", model: "gemma4:latest", simulated: false },
      xp_awarded: 385,
      seeded: true,
    },
    // RIDGELINE – qualification
    {
      run_id: "seed-ridgeline-qual-01",
      mission_id: "basic_qualification",
      season: "season-zero",
      callsign: "RIDGELINE",
      total: 95,
      max_total: 100,
      elapsed_seconds: 620,
      submitted_at: "2026-06-13T11:30:00Z",
      dimensions: dims(43, 45, 14, 15, 10, 10),
      flags: { suspicious_fast: false, missing_telemetry: false },
      local_model: { provider: "ollama", model: "gemma4:latest", simulated: false },
      xp_awarded: 190,
      seeded: true,
    },
    // VECTOR-6 – sprint (SUSPICIOUS: 12 seconds, impossible)
    {
      run_id: "seed-vector6-sprint-sus",
      mission_id: "sprint_signal_lost",
      season: "season-zero",
      callsign: "VECTOR-6",
      total: 100,
      max_total: 100,
      elapsed_seconds: 12,
      submitted_at: "2026-06-14T08:00:00Z",
      dimensions: dims(45, 45, 15, 15, 10, 10),
      flags: { suspicious_fast: true, missing_telemetry: true },
      local_model: { provider: "ollama", model: "gemma4:latest", simulated: false },
      xp_awarded: 0,
      seeded: true,
    },
    // LOWLIGHT – prompt under fire
    {
      run_id: "seed-lowlight-field-01",
      mission_id: "field_prompt_under_fire",
      season: "season-zero",
      callsign: "LOWLIGHT",
      total: 72,
      max_total: 100,
      elapsed_seconds: 560,
      submitted_at: "2026-06-15T13:00:00Z",
      dimensions: dims(30, 45, 11, 15, 7, 10),
      flags: { suspicious_fast: false, missing_telemetry: false },
      local_model: { provider: "ollama", model: "gemma4:latest", simulated: false },
      xp_awarded: 270,
      seeded: true,
    },
    // MERIDIAN – qualification (low score, just starting out)
    {
      run_id: "seed-meridian-qual-01",
      mission_id: "basic_qualification",
      season: "season-zero",
      callsign: "MERIDIAN",
      total: 55,
      max_total: 100,
      elapsed_seconds: 1820,
      submitted_at: "2026-06-16T15:00:00Z",
      dimensions: dims(22, 45, 8, 15, 5, 10),
      flags: { suspicious_fast: false, missing_telemetry: false },
      local_model: { provider: "ollama", model: "gemma4:latest", simulated: false },
      xp_awarded: 80,
      seeded: true,
    },
    // APEX-7 – field prompt
    {
      run_id: "seed-apex7-field-01",
      mission_id: "field_prompt_under_fire",
      season: "season-zero",
      callsign: "APEX-7",
      total: 89,
      max_total: 100,
      elapsed_seconds: 430,
      submitted_at: "2026-06-17T10:00:00Z",
      dimensions: dims(40, 45, 13, 15, 9, 10),
      flags: { suspicious_fast: false, missing_telemetry: false },
      local_model: { provider: "ollama", model: "gemma4:latest", simulated: false },
      xp_awarded: 356,
      seeded: true,
    },
    // IRONCLAD – marathon
    {
      run_id: "seed-ironclad-marathon-01",
      mission_id: "marathon_degraded_comms",
      season: "season-zero",
      callsign: "IRONCLAD",
      total: 86,
      max_total: 100,
      elapsed_seconds: 1680,
      submitted_at: "2026-06-18T14:00:00Z",
      dimensions: dims(39, 45, 12, 15, 9, 10),
      flags: { suspicious_fast: false, missing_telemetry: false },
      local_model: { provider: "ollama", model: "gemma4:latest", simulated: false },
      xp_awarded: 756,
      seeded: true,
    },
    // IRONCLAD – relay
    {
      run_id: "seed-ironclad-relay-01",
      mission_id: "relay_gemma_handoff",
      season: "season-zero",
      callsign: "IRONCLAD",
      total: 80,
      max_total: 100,
      elapsed_seconds: 900,
      submitted_at: "2026-06-19T09:00:00Z",
      dimensions: dims(35, 45, 12, 15, 8, 10),
      flags: { suspicious_fast: false, missing_telemetry: false },
      local_model: { provider: "ollama", model: "gemma4:latest", simulated: false },
      xp_awarded: 400,
      seeded: true,
    },
    // VECTOR-6 – field patch
    {
      run_id: "seed-vector6-field-01",
      mission_id: "field_patch_edge_agent",
      season: "season-zero",
      callsign: "VECTOR-6",
      total: 78,
      max_total: 100,
      elapsed_seconds: 760,
      submitted_at: "2026-06-20T11:00:00Z",
      dimensions: dims(34, 45, 11, 15, 8, 10),
      flags: { suspicious_fast: false, missing_telemetry: false },
      local_model: { provider: "ollama", model: "gemma4:latest", simulated: false },
      xp_awarded: 390,
      seeded: true,
    },
  ];

  return { operators, submissions };
}

// ── Persistence ────────────────────────────────────────────────────────────

function isVercel(): boolean {
  return !!process.env.VERCEL;
}

let _memoryStore: StoreData | null = null;

async function getMemoryStore(): Promise<StoreData> {
  if (!_memoryStore) {
    _memoryStore = buildSeedData();
  }
  return _memoryStore;
}

async function readStore(): Promise<StoreData> {
  if (isVercel()) {
    return getMemoryStore();
  }
  // Local file store
  const { promises: fs } = await import("fs");
  const path = await import("path");
  const dataDir = path.join(process.cwd(), ".data");
  const storePath = path.join(dataDir, "store.json");
  try {
    const raw = await fs.readFile(storePath, "utf-8");
    return JSON.parse(raw) as StoreData;
  } catch {
    // First run – seed it
    const seed = buildSeedData();
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(storePath, JSON.stringify(seed, null, 2));
    return seed;
  }
}

async function writeStore(data: StoreData): Promise<void> {
  if (isVercel()) {
    _memoryStore = data;
    return;
  }
  const { promises: fs } = await import("fs");
  const path = await import("path");
  const dataDir = path.join(process.cwd(), ".data");
  const storePath = path.join(dataDir, "store.json");
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(data, null, 2));
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function getOperator(callsign: string): Promise<Operator | null> {
  const store = await readStore();
  return store.operators.find((o) => o.callsign === callsign.toUpperCase()) ?? null;
}

export async function upsertOperator(callsign: string, github_url?: string, x_url?: string): Promise<Operator> {
  const store = await readStore();
  const upper = callsign.toUpperCase();
  const existing = store.operators.find((o) => o.callsign === upper);
  if (existing) {
    if (github_url) existing.github_url = github_url;
    if (x_url) existing.x_url = x_url;
    await writeStore(store);
    return existing;
  }

  const op: Operator = {
    callsign: upper,
    github_url,
    x_url,
    xp: 0,
    rank: getRankForXP(0).name,
    created_at: new Date().toISOString(),
  };
  store.operators.push(op);
  await writeStore(store);
  return op;
}

export async function getSubmissionsByCallsign(callsign: string): Promise<Submission[]> {
  const store = await readStore();
  return store.submissions.filter(
    (s) => s.callsign === callsign.toUpperCase()
  );
}

export async function getSubmissionByRunId(runId: string): Promise<Submission | null> {
  const store = await readStore();
  return store.submissions.find((s) => s.run_id === runId) ?? null;
}

export async function addSubmission(
  sub: Submission,
  xpDelta: number
): Promise<{ promoted: boolean; previousRank: string; newRank: string }> {
  const store = await readStore();
  store.submissions.push(sub);

  const opIdx = store.operators.findIndex((o) => o.callsign === sub.callsign);
  let promoted = false;
  let previousRank = "Recruit";
  let newRank = "Recruit";

  if (opIdx !== -1) {
    previousRank = store.operators[opIdx].rank;
    store.operators[opIdx].xp += xpDelta;
    newRank = getRankForXP(store.operators[opIdx].xp).name;
    store.operators[opIdx].rank = newRank;
    promoted = newRank !== previousRank;
  }

  await writeStore(store);
  return { promoted, previousRank, newRank };
}

export async function getAllOperators(): Promise<Operator[]> {
  const store = await readStore();
  return store.operators;
}

export async function getAllSubmissions(): Promise<Submission[]> {
  const store = await readStore();
  return store.submissions;
}

export async function getSubmissionsForMission(missionId: string): Promise<Submission[]> {
  const store = await readStore();
  return store.submissions.filter((s) => s.mission_id === missionId);
}

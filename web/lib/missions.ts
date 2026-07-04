export interface Mission {
  id: string;
  title: string;
  event_type: "qualification" | "sprint" | "field" | "relay" | "marathon";
  difficulty: 1 | 2 | 3 | 4 | 5;
  timebox_minutes: number;
  expected_seconds: { min: number; max: number };
  xp_base: number;
  summary: string;
  skills: string[];
  season: "season-zero";
  /** Workspace evidence files the operator is expected to consult. */
  evidence: string[];
  /** Scoring dimensions this mission emphasizes (mirrors mission.json checks). */
  dimensions: string[];
}

export const MISSIONS: Mission[] = [
  {
    id: "basic_qualification",
    title: "Basic Qualification",
    event_type: "qualification",
    difficulty: 1,
    timebox_minutes: 15,
    expected_seconds: { min: 180, max: 2700 },
    xp_base: 200,
    summary:
      "Verify your local Gemma4 field AI, catch one bad model claim, and file your first mission artifact.",
    skills: ["Cursor cockpit basics", "local model verification", "submission workflow"],
    season: "season-zero",
    evidence: ["relay_roster.txt", "field_ai_advisory.txt"],
    dimensions: ["mission completion", "evidence discipline", "prompt discipline"],
  },
  {
    id: "sprint_signal_lost",
    title: "Signal Lost",
    event_type: "sprint",
    difficulty: 2,
    timebox_minutes: 10,
    expected_seconds: { min: 120, max: 2400 },
    xp_base: 300,
    summary:
      "An edge sensor grid is dropping packets after a config push. Find the real root cause before you trust the model's first guess.",
    skills: ["log triage", "evidence discipline", "model verification"],
    season: "season-zero",
    evidence: ["gateway.log", "node_17.log", "uplink.conf", "maintenance_note.md"],
    dimensions: [
      "mission completion",
      "evidence discipline",
      "recovery from bad AI guidance",
      "communication quality",
    ],
  },
  {
    id: "field_prompt_under_fire",
    title: "Prompt Under Fire",
    event_type: "field",
    difficulty: 2,
    timebox_minutes: 10,
    expected_seconds: { min: 120, max: 2400 },
    xp_base: 300,
    summary:
      "Three AI-drafted action plans. Two contain subtle operational errors. Approve only what you can verify.",
    skills: ["plan critique", "hallucination resistance", "prompt discipline"],
    season: "season-zero",
    evidence: ["proposed_plans.md", "ops_policy.md", "toolkit_manifest.txt"],
    dimensions: ["hallucination resistance", "evidence discipline", "prompt discipline"],
  },
  {
    id: "field_patch_edge_agent",
    title: "Patch the Edge Agent",
    event_type: "field",
    difficulty: 3,
    timebox_minutes: 15,
    expected_seconds: { min: 180, max: 3600 },
    xp_base: 400,
    summary:
      "A field agent misclassifies event severity. Ship the minimal patch that makes the tests pass.",
    skills: ["debugging under constraint", "minimal patching", "test-driven recovery"],
    season: "season-zero",
    evidence: ["edge_agent.py", "severity_spec.md", "test_edge_agent.py"],
    dimensions: ["mission completion", "evidence discipline", "communication quality"],
  },
  {
    id: "relay_gemma_handoff",
    title: "Relay: Human + Gemma Handoff",
    event_type: "relay",
    difficulty: 3,
    timebox_minutes: 15,
    expected_seconds: { min: 240, max: 3600 },
    xp_base: 400,
    summary:
      "Write a handoff brief good enough that your local Gemma4 can finish the job. Then grade its continuation.",
    skills: ["handoff clarity", "constrained AI collaboration", "operational communication"],
    season: "season-zero",
    evidence: ["incident_context.md"],
    dimensions: ["communication quality", "prompt discipline", "mission completion"],
  },
  {
    id: "marathon_degraded_comms",
    title: "Marathon: Degraded Comms Incident",
    event_type: "marathon",
    difficulty: 4,
    timebox_minutes: 25,
    expected_seconds: { min: 600, max: 7200 },
    xp_base: 700,
    summary:
      "Conflicting telemetry, delayed logs, and a confident model recommendation. Reconcile the evidence and write the memo that holds up.",
    skills: [
      "multi-step investigation",
      "uncertainty communication",
      "decision quality",
    ],
    season: "season-zero",
    evidence: [
      "telemetry_snapshot.csv",
      "delayed_logs.log",
      "situation_reports.md",
      "model_recommendation.md",
    ],
    dimensions: [
      "mission completion",
      "evidence discipline",
      "hallucination resistance",
      "communication quality",
    ],
  },
];

export function getMissionById(id: string): Mission | undefined {
  return MISSIONS.find((m) => m.id === id);
}

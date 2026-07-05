export interface Mission {
  id: string;
  title: string;
  event_type: "qualification" | "sprint" | "field" | "relay" | "marathon";
  difficulty: 1 | 2 | 3 | 4 | 5;
  timebox_minutes: number;
  expected_seconds: { min: number; max: number };
  xp_base: number;
  /** One-line scenario hook for cards and lists. */
  hook: string;
  /** The stakes and setting, condensed from the mission brief. */
  situation: string;
  /** Why cloud AI is out of the picture for this mission. */
  edge_condition: string;
  /** The bad model guidance the mission plants, phrased as a warning. */
  model_trap: string;
  /** The call the operator has to make and defend. */
  decision: string;
  /** Radio-operator voice briefing, 8 to 15 seconds spoken. */
  briefing: string;
  skills: string[];
  season: "season-one";
  /** Workspace evidence files with a short role note. */
  evidence: { file: string; role: string }[];
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
    hook: "An archived AI advisory doesn't match the relay roster. Find the claim that breaks.",
    situation:
      "You are reporting to the HALCYON training annex, a sealed replica of the relay grid built for AI operations readiness. A previous shift left an archived model advisory in the workspace, and part of it does not match the relay roster.",
    edge_condition:
      "Air-gapped annex. No cloud AI. Only local Gemma on your machine.",
    model_trap:
      "The advisory includes a confident claim the roster disproves. Check before you repeat it.",
    decision:
      "Which claims in the advisory survive contact with the evidence, and which do not.",
    briefing:
      "Operator, HALCYON control. Welcome to the training annex. A prior shift archived a model advisory, and part of it does not match the relay roster. No cloud on this grid. Verify before you trust. Clock starts on your mark.",
    skills: ["evidence discipline", "model verification", "submission workflow"],
    season: "season-one",
    evidence: [
      { file: "relay_roster.txt", role: "ground truth for the relay grid" },
      { file: "field_ai_advisory.txt", role: "the archived AI advisory to verify" },
    ],
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
    hook: "Sensors went dark after a 02:10 config push. The previous shift blamed the weather.",
    situation:
      "A routine configuration push went out to the uplink gateway at HALCYON's coastal sensor line, the ring of field nodes that feeds early storm warnings to three downstream stations. Since then, sensors are dropping packets and telemetry arrives in fragments. It is storm season, node 17's antenna has been noisy for weeks, and the previous shift's hunch was \"weather.\"",
    edge_condition:
      "The degraded uplink is your only backhaul. With the link flapping there is no cloud AI to call, only the Gemma model on the gateway's maintenance laptop.",
    model_trap:
      "The model's first instinct tends to match the previous shift's: blame the storm or the noisy antenna. The config diff says otherwise.",
    decision:
      "The real root cause, and the config patch that brings the warning feed back before the next front.",
    briefing:
      "Operator, HALCYON control. A config push broke the coastal uplink. Sensors are dropping packets ahead of the storm front. No cloud on this link, just you and the local model. The last shift blamed the weather. Verify before you trust. Clock is running.",
    skills: ["log triage", "config diffing", "recovery from bad guidance"],
    season: "season-one",
    evidence: [
      { file: "gateway.log", role: "uplink gateway events" },
      { file: "node_17.log", role: "field node radio log (the tempting red herring)" },
      { file: "uplink.conf", role: "live config as pushed at 02:10" },
      { file: "uplink.conf.prev", role: "config before the push" },
      { file: "maintenance_note.md", role: "shift maintenance notes" },
    ],
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
    hook: "Three AI-drafted plans. One is safe. One breaks policy. One invents a tool.",
    situation:
      "Relay R-7 on the HALCYON grid is degraded. A prior shift queried the local model and archived three draft restoration plans. Nobody has reviewed them. If the wrong plan executes, R-7 goes from degraded to down.",
    edge_condition:
      "The exercise assumes a contested environment: outbound traffic cannot be trusted, so all cloud AI is off the table and every plan must be checked against documents you hold locally.",
    model_trap:
      "One plan calls for a tool the grid does not have, a detail the model invented. Ask it naively and it will repeat the plans' errors back to you.",
    decision:
      "Which plan an operator can act on, and why the other two cannot leave the queue.",
    briefing:
      "Operator, HALCYON control. Relay R seven is degraded and three A I drafted restoration plans are sitting in the queue, unreviewed. One is safe. One breaks policy. One cites a tool this grid has never carried. Approve only what you can verify.",
    skills: ["plan critique", "hallucination detection", "policy verification"],
    season: "season-one",
    evidence: [
      { file: "proposed_plans.md", role: "the three AI-drafted plans to review" },
      { file: "ops_policy.md", role: "standing maintenance policy" },
      { file: "toolkit_manifest.txt", role: "the approved tool list" },
    ],
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
    hook: "Boundary events are mislabeled. Forward-line warnings escalate late.",
    situation:
      "The severity classifier deployed on HALCYON's forward sensor nodes has a bug. Events at a specific boundary score are mislabeled, so real warnings escalate late. The fix ships tonight with the next maintenance window, and multiple tests are failing right now.",
    edge_condition:
      "These nodes are solar-powered field hardware with no route to the cloud. The classifier runs on the device, and so does your only AI. An edge agent that phones home fails when the link does.",
    model_trap:
      "The model will suggest plausible fixes from intuition. The severity spec is the ground truth, and only one minimal change satisfies it.",
    decision:
      "The minimal correct change, backed by the spec, that turns the test suite green without a rewrite.",
    briefing:
      "Operator, HALCYON control. The severity classifier on the forward line is mislabeling boundary events, and warnings are escalating late. The fix ships tonight. Minimal change only, and the spec is the ground truth, not the model's intuition.",
    skills: ["debugging under constraint", "minimal patching", "spec discipline"],
    season: "season-one",
    evidence: [
      { file: "severity_spec.md", role: "authoritative threshold specification" },
      { file: "edge_agent.py", role: "the buggy classifier" },
      { file: "test_edge_agent.py", role: "the failing test suite" },
    ],
    dimensions: ["mission completion", "evidence discipline", "communication quality"],
  },
  {
    id: "relay_gemma_handoff",
    title: "Gemma Handoff",
    event_type: "relay",
    difficulty: 3,
    timebox_minutes: 15,
    expected_seconds: { min: 240, max: 3600 },
    xp_base: 400,
    hook: "Your shift is ending mid-incident. The next operator gets only your brief and a local model.",
    situation:
      "You are the Shift 1 operator at HALCYON Sector 4. An active calibration incident has five nodes reading drifted values; you have corrected three, and your shift is ending. If your handoff is vague, the wrong nodes get recalibrated and the validation deadline is missed.",
    edge_condition:
      "Sector 4 handles positional data classified grid-internal. Incident details never leave the local network: no cloud AI sees this traffic, by policy, ever.",
    model_trap:
      "The local model only knows what you tell it. A vague handoff produces a confident but wrong continuation, and grading that continuation is part of the mission.",
    decision:
      "What the handoff brief must contain so the model can actually continue the work, then whether its continuation holds up.",
    briefing:
      "Operator, HALCYON control. Your shift ends mid incident. Two nodes still read drifted values and the next operator inherits only your brief and the local model. If the handoff is vague, the wrong nodes get recalibrated. Write it tight, then test it.",
    skills: ["handoff clarity", "context engineering", "output grading"],
    season: "season-one",
    evidence: [
      { file: "incident_context.md", role: "what Shift 1 did and what remains" },
    ],
    dimensions: ["communication quality", "prompt discipline", "mission completion"],
  },
  {
    id: "marathon_degraded_comms",
    title: "Degraded Comms Incident",
    event_type: "marathon",
    difficulty: 4,
    timebox_minutes: 25,
    expected_seconds: { min: 600, max: 7200 },
    xp_base: 700,
    hook: "Three sensors dark, logs out of order, two sitreps that disagree, and a model that's sure of itself.",
    situation:
      "Forward cluster FWD-7 sits two relay hops past the last hardened station on a degraded satellite backhaul. Three sensors went unresponsive around 03:42 UTC. The evidence reaching you is fragmented: a clean telemetry dropout, a delayed log batch that arrived out of order, and two human sitreps that partially contradict each other.",
    edge_condition:
      "Cloud AI is out of reach and would be too slow anyway. Round trips over the degraded backhaul take longer than the decisions do.",
    model_trap:
      "The local model has already filed a high-confidence recommendation. Acting on it could restart the wrong subsystem and extend the outage. Confidence is not correctness.",
    decision:
      "What actually failed, when the power event began, and whether the model's recommendation is safe to execute. Then the memo that holds up.",
    briefing:
      "Operator, HALCYON control. Forward cluster F W D seven went dark at oh three forty two. The logs arrived out of order, the sitreps disagree, and the local model has already filed a confident recommendation. Confidence is not correctness. Take the time to be right.",
    skills: ["multi-source correlation", "uncertainty communication", "decision quality"],
    season: "season-one",
    evidence: [
      { file: "telemetry_snapshot.csv", role: "sensor readings showing the outage pattern" },
      { file: "delayed_logs.log", role: "log batch that arrived out of order" },
      { file: "situation_reports.md", role: "two conflicting human sitreps" },
      { file: "model_recommendation.md", role: "the local model's confident recommendation" },
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

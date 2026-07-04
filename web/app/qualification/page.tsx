import Link from "next/link";
import EnlistForm from "../components/EnlistForm";
import styles from "./page.module.css";

const STEPS = [
  {
    id: "01",
    title: "Enlist — Claim Your Callsign",
    status: "start",
    content: (
      <>
        <p>
          Choose a callsign: 3–20 characters, uppercase letters, digits, or hyphens.
          This is your permanent identity on the Season Zero scoreboard.
        </p>
        <p>
          No email. No password. Your callsign is your handle.
          Use something memorable — you can't change it once you've submitted a run.
        </p>
      </>
    ),
    action: "enlist",
  },
  {
    id: "02",
    title: "Open the Cursor Workspace",
    status: "cursor",
    content: (
      <>
        <p>
          Clone the CyberTrack mission workspace and open it in Cursor.
          Everything you need for every mission is already there.
        </p>
        <div className="panel-2" style={{ padding: "16px", borderRadius: "6px", margin: "12px 0" }}>
          <code className="mono" style={{ fontSize: "13px", color: "var(--signal)" }}>
            git clone https://github.com/cybertrack-labs/missions.git
          </code>
        </div>
        <p>
          Do not use a cloud AI inside this workspace. Your only field AI is the local Gemma4
          model running on your machine via Ollama. That constraint is the whole point.
        </p>
      </>
    ),
  },
  {
    id: "03",
    title: "Verify Your Local Gemma4",
    status: "verify",
    content: (
      <>
        <p>
          Before your first mission, confirm your local AI is running and connected.
          Open the integrated terminal in Cursor and run:
        </p>
        <div className="panel-2" style={{ padding: "16px", borderRadius: "6px", margin: "12px 0" }}>
          <code className="mono" style={{ fontSize: "13px", color: "var(--signal)" }}>
            cybertf verify-model
          </code>
        </div>
        <p>
          You should see your Gemma4 model listed, a latency reading, and confirmation that
          it is running at <code className="mono">localhost:11434</code>.
          If not, start Ollama and pull the model:
        </p>
        <div className="panel-2" style={{ padding: "16px", borderRadius: "6px", margin: "12px 0" }}>
          <div className="mono" style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div><span style={{ color: "var(--line)" }}>$</span> <span style={{ color: "var(--signal)" }}>ollama pull</span> <span style={{ color: "var(--ice)" }}>gemma4:latest</span></div>
            <div><span style={{ color: "var(--line)" }}>$</span> <span style={{ color: "var(--signal)" }}>ollama serve</span></div>
          </div>
        </div>
      </>
    ),
  },
  {
    id: "04",
    title: "Run the Basic Qualification Mission",
    status: "run",
    content: (
      <>
        <p>
          Start the qualification mission. The timer starts now.
          You have 15 minutes.
        </p>
        <div className="panel-2" style={{ padding: "16px", borderRadius: "6px", margin: "12px 0" }}>
          <code className="mono" style={{ fontSize: "13px", color: "var(--signal)" }}>
            cybertf run basic_qualification
          </code>
        </div>
        <p>
          Read the brief inside the workspace. Follow the instructions.
          Your field AI is waiting at the <code className="mono">cybertf ask</code> command.
        </p>
      </>
    ),
  },
  {
    id: "05",
    title: "Ask Gemma — Then Verify",
    status: "ask",
    content: (
      <>
        <p>
          Use your local Gemma4 to help — but verify everything it says before you write it in your answer.
        </p>
        <div className="panel-2" style={{ padding: "16px", borderRadius: "6px", margin: "12px 0" }}>
          <code className="mono" style={{ fontSize: "13px" }}>
            <span style={{ color: "var(--signal)" }}>cybertf ask</span>{" "}
            <span style={{ color: "var(--amber)" }}>&quot;What does the model claim about the sensor error?&quot;</span>
          </code>
        </div>
        <p>
          The qualification mission includes one bad claim from the model.
          Your job is to catch it using the evidence in the workspace — not to trust
          the model and copy its answer.
        </p>
        <p>
          <strong style={{ color: "var(--amber)" }}>This is the core skill CyberTrack measures:</strong>{" "}
          knowing when to trust your AI, and when to override it.
        </p>
      </>
    ),
  },
  {
    id: "06",
    title: "Submit Your Answers",
    status: "submit",
    content: (
      <>
        <p>
          When you have completed the mission, submit your answer file:
        </p>
        <div className="panel-2" style={{ padding: "16px", borderRadius: "6px", margin: "12px 0" }}>
          <div className="mono" style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div><span style={{ color: "var(--signal)" }}>cybertf submit</span> <span style={{ color: "var(--ice)" }}>basic_qualification answer.json</span></div>
            <div><span style={{ color: "var(--signal)" }}>cybertf report</span> <span style={{ color: "var(--muted)" }}>&lt;run_id&gt;</span></div>
          </div>
        </div>
        <p>
          The <code className="mono">submit</code> command scores your run deterministically.
          The <code className="mono">report</code> command writes your after-action review.
          Read it carefully — the AAR is how you improve.
        </p>
      </>
    ),
  },
  {
    id: "07",
    title: "Read Your AAR — Then Publish",
    status: "aar",
    content: (
      <>
        <p>
          Your after-action report (AAR) shows exactly what you got right and wrong, dimension by dimension.
          Scores are <strong>training feedback</strong>, not rankings of your worth.
        </p>
        <p>
          When you are ready to post your score to the arena scoreboard, publish it:
        </p>
        <div className="panel-2" style={{ padding: "16px", borderRadius: "6px", margin: "12px 0" }}>
          <code className="mono" style={{ fontSize: "13px" }}>
            <span style={{ color: "var(--signal)" }}>cybertf publish</span>{" "}
            <span style={{ color: "var(--muted)" }}>&lt;run_id&gt;</span>
          </code>
        </div>
        <p>
          Your score will appear on the scoreboard. If you are promoted, you will see it here.
        </p>
      </>
    ),
  },
  {
    id: "08",
    title: "Check Your Promotion + Climb Season Zero",
    status: "promoted",
    content: (
      <>
        <p>
          Visit your service record to see your rank, XP total, and mission history.
          Then take on the Sprint, Field, Relay, and Marathon missions to climb Season Zero.
        </p>
        <p>
          The rank ladder:
          {" "}<strong style={{ color: "var(--signal)" }}>Recruit → Operator → Specialist → Sentinel → Warden → Commander → Field Marshal</strong>.
        </p>
        <p>
          Speed matters a little. Correctness matters a lot. Suspicious times get flagged and
          excluded from podium positions. The arena is watching.
        </p>
      </>
    ),
  },
];

export default function QualificationPage() {
  return (
    <div className={styles.root}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div className={`tag tag-signal`} style={{ marginBottom: "12px" }}>
            Season Zero · Qualification
          </div>
          <h1 className={`display ${styles.title}`}>
            Basic Qualification
          </h1>
          <p className={styles.subtitle}>
            Your entry point into Season Zero. Complete this mission and you are
            on the board. Everything you need is below.
          </p>
          <div className={styles.missionMeta}>
            <span className={`tag tag-signal`}>Qualification</span>
            <span className="mono" style={{ color: "var(--amber)", fontSize: "13px" }}>⏱ 15m timebox</span>
            <span className="mono" style={{ color: "var(--signal)", fontSize: "13px" }}>+200 XP base</span>
            <span className="mono" style={{ color: "var(--ice)", fontSize: "13px" }}>Difficulty ▮▯▯▯▯</span>
          </div>
        </div>

        {/* Steps */}
        <div className={styles.stepsLayout}>
          <div className={styles.stepsList}>
            {STEPS.map((step, i) => (
              <div key={step.id} className={`panel ${styles.step}`}>
                <div className={styles.stepHeader}>
                  <div className={`mono ${styles.stepNum}`}>{step.id}</div>
                  <h2 className={`display ${styles.stepTitle}`}>{step.title}</h2>
                </div>
                <div className={styles.stepContent}>{step.content}</div>
                {step.action === "enlist" && (
                  <div className={styles.stepAction}>
                    <EnlistForm />
                  </div>
                )}
                {i < STEPS.length - 1 && (
                  <div className={styles.stepConnector}>│</div>
                )}
              </div>
            ))}
          </div>

          {/* Right: quick reference */}
          <aside className={styles.quickRef}>
            <div className={`panel ${styles.refCard}`}>
              <div className="section-label">Quick Reference</div>
              <div className={styles.refList}>
                {[
                  { cmd: "cybertf run <id>", desc: "Start a mission" },
                  { cmd: "cybertf ask \"...\"", desc: "Ask local Gemma4" },
                  { cmd: "cybertf submit <id> answer.json", desc: "Score your run" },
                  { cmd: "cybertf report <run_id>", desc: "Generate AAR" },
                  { cmd: "cybertf publish <run_id>", desc: "Post to arena" },
                  { cmd: "cybertf verify-model", desc: "Check Gemma4 status" },
                ].map((item) => (
                  <div key={item.cmd} className={styles.refItem}>
                    <code className={`mono ${styles.refCmd}`}>{item.cmd}</code>
                    <span className={`muted ${styles.refDesc}`}>{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`panel ${styles.refCard}`}>
              <div className="section-label">Rank Ladder</div>
              {[
                { name: "Recruit", xp: "0", glyph: "△" },
                { name: "Operator", xp: "250", glyph: "▲" },
                { name: "Specialist", xp: "700", glyph: "▲▲" },
                { name: "Sentinel", xp: "1,400", glyph: "◆▲" },
                { name: "Warden", xp: "2,400", glyph: "◆▲▲" },
                { name: "Commander", xp: "3,800", glyph: "◆◆▲▲" },
                { name: "Field Marshal", xp: "5,600", glyph: "◆◆◆▲▲" },
              ].map((r) => (
                <div key={r.name} className={styles.rankRow}>
                  <span className={`mono ${styles.rankGlyph}`}>{r.glyph}</span>
                  <span className={`display ${styles.rankName}`}>{r.name}</span>
                  <span className={`mono ${styles.rankXp}`}>{r.xp} XP</span>
                </div>
              ))}
            </div>

            <div className={styles.ruleNote}>
              <p>Scores are <strong>training and readiness feedback only</strong> —
              never job suitability signals, never hiring criteria.</p>
            </div>

            <Link href="/missions/basic_qualification" className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }}>
              Full Mission Brief →
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

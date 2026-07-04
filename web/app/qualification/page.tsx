import Link from "next/link";
import EnlistForm from "../components/EnlistForm";
import { RANKS } from "@/lib/ranks";
import {
  IconOffline,
  IconTerminal,
  IconExternal,
  RankChevrons,
} from "../components/svg";
import styles from "./page.module.css";

interface WizardStep {
  id: string;
  title: string;
  body: React.ReactNode;
  action?: "callsign";
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <div className={`panel-2 mono ${styles.code}`}>
      {children}
    </div>
  );
}

const STEPS: WizardStep[] = [
  {
    id: "01",
    title: "Install Cursor — the cockpit",
    body: (
      <>
        <p>
          Every CyberTrack mission is completed inside a Cursor workspace: reading
          evidence, patching configs, talking to your field AI from the integrated
          terminal. If you already use Cursor, you already have the cockpit.
        </p>
        <div className={styles.linkRow}>
          <a href="https://cursor.com?ref=CyberTrack" target="_blank" rel="noopener noreferrer">
            Download Cursor <IconExternal size={11} />
          </a>
          <a href="https://cursor.com/students?ref=CyberTrack" target="_blank" rel="noopener noreferrer">
            Cursor for Students <IconExternal size={11} />
          </a>
        </div>
      </>
    ),
  },
  {
    id: "02",
    title: "Install Ollama — the local model runtime",
    body: (
      <>
        <p>
          Ollama runs Gemma4 entirely on your machine. No API key, no account,
          no cloud dependency — which is the point.
        </p>
        <div className={styles.linkRow}>
          <a href="https://ollama.com/download" target="_blank" rel="noopener noreferrer">
            Install Ollama <IconExternal size={11} />
          </a>
        </div>
      </>
    ),
  },
  {
    id: "03",
    title: "Pull and verify local Gemma4",
    body: (
      <>
        <p>Pull the model, then prove the local path works before any mission:</p>
        <Code>
          <div><span className={styles.prompt}>$</span> <span className="signal">ollama pull</span> gemma4</div>
          <div><span className={styles.prompt}>$</span> <span className="signal">cybertf verify-model</span></div>
        </Code>
        <p>
          You should see your model listed, a latency reading, and{" "}
          <code className={`mono ${styles.inline}`}>FIELD AI ONLINE</code> at{" "}
          <code className={`mono ${styles.inline}`}>localhost:11434</code>. If that
          badge is green, you are mission-capable offline.
        </p>
      </>
    ),
  },
  {
    id: "04",
    title: "Open the CyberTrack workspace in Cursor",
    body: (
      <>
        <p>
          Clone the mission workspace and open the folder in Cursor. Every Season
          Zero mission — briefs, synthetic evidence, the{" "}
          <code className={`mono ${styles.inline}`}>cybertf</code> CLI — ships in
          the repo.
        </p>
        <Code>
          <div><span className={styles.prompt}>$</span> <span className="signal">git clone</span> https://github.com/daniel-p-green/cyber-track.git</div>
          <div><span className={styles.prompt}>$</span> <span className="signal">cursor</span> cyber-track</div>
        </Code>
      </>
    ),
  },
  {
    id: "05",
    title: "Claim your callsign",
    body: (
      <p>
        Your callsign is your arena identity — 3 to 20 characters, no email, no
        password. GitHub and X links are optional and appear on your operator
        record.
      </p>
    ),
    action: "callsign",
  },
  {
    id: "06",
    title: "Fly Basic Qualification and submit evidence",
    body: (
      <>
        <p>
          Start the first mission. The timer arms immediately — 15 minutes. The
          brief includes one deliberately bad model claim; your job is to catch it
          with evidence, not to copy the model&apos;s answer.
        </p>
        <Code>
          <div><span className={styles.prompt}>$</span> <span className="signal">cybertf run</span> basic_qualification</div>
          <div><span className={styles.prompt}>$</span> <span className="signal">cybertf ask</span> <span className="amber">&quot;What does the advisory claim?&quot;</span></div>
          <div><span className={styles.prompt}>$</span> <span className="signal">cybertf submit</span> basic_qualification answer.json</div>
          <div><span className={styles.prompt}>$</span> <span className="signal">cybertf publish</span> &lt;run_id&gt;</div>
        </Code>
        <p>
          <code className={`mono ${styles.inline}`}>submit</code> scores your run
          deterministically and writes your after-action report.{" "}
          <code className={`mono ${styles.inline}`}>publish</code> posts the score
          to this arena. Read the AAR — that is how you improve.
        </p>
      </>
    ),
  },
];

const QUICK_REF = [
  { cmd: "cybertf verify-model", desc: "Prove local Gemma4 is online" },
  { cmd: "cybertf run <id>", desc: "Start a mission (arms timer)" },
  { cmd: "cybertf ask \"...\"", desc: "Query the local field AI" },
  { cmd: "cybertf submit <id> answer.json", desc: "Score the run" },
  { cmd: "cybertf report <run_id>", desc: "Generate the AAR" },
  { cmd: "cybertf publish <run_id>", desc: "Post score to the arena" },
];

export default function QualificationPage() {
  return (
    <div className={styles.root}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.kicker}>
            <span className="pulse-dot" />
            Season Zero · Start Here
          </div>
          <h1 className={`display ${styles.title}`}>Basic Qualification</h1>
          <p className={styles.subtitle}>
            Six steps from zero to your first scored mission. Fifteen minutes on
            the clock once you start.
          </p>
        </div>

        {/* Constraint banner — impossible to miss */}
        <div className={`hud-corners hud-corners-signal ${styles.constraint}`}>
          <IconOffline size={26} className={styles.constraintIcon} />
          <div>
            <div className={`display ${styles.constraintTitle}`}>
              Mission constraint: local Gemma4 only
            </div>
            <p>
              Every mission runs offline. Cloud AI is out of bounds inside the
              workspace — your only field AI is the Gemma4 model running on your own
              machine. That constraint is the training.
            </p>
          </div>
        </div>

        {/* Wizard + aside */}
        <div className={styles.layout}>
          <ol className={styles.steps}>
            {STEPS.map((step, i) => (
              <li key={step.id} className={`panel ${styles.step}`}>
                <div className={styles.stepMarker} aria-hidden>
                  <span className={`mono ${styles.stepNum}`}>{step.id}</span>
                  {i < STEPS.length - 1 && <span className={styles.stepLine} />}
                </div>
                <div className={styles.stepBody}>
                  <h2 className={`display ${styles.stepTitle}`}>{step.title}</h2>
                  <div className={styles.stepContent}>{step.body}</div>
                  {step.action === "callsign" && (
                    <div className={styles.stepAction}>
                      <EnlistForm />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <aside className={styles.aside}>
            <div className={`panel ${styles.refCard}`}>
              <div className="section-label">
                <IconTerminal size={13} /> Command Reference
              </div>
              <div className={styles.refList}>
                {QUICK_REF.map((item) => (
                  <div key={item.cmd} className={styles.refItem}>
                    <code className={`mono ${styles.refCmd}`}>{item.cmd}</code>
                    <span className={styles.refDesc}>{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`panel ${styles.refCard}`}>
              <div className="section-label">Rank Ladder</div>
              {RANKS.map((r, i) => (
                <div key={r.name} className={styles.rankRow}>
                  <RankChevrons tier={i + 1} max={7} size={9} />
                  <span className={`display ${styles.rankName}`}>{r.name}</span>
                  <span className={`mono ${styles.rankXp}`}>
                    {r.xp_min.toLocaleString()} XP
                  </span>
                </div>
              ))}
            </div>

            <div className={`panel ${styles.originCard}`}>
              <div className="section-label">Roadmap</div>
              <div className={`display ${styles.originTitle}`}>Cursor Origin</div>
              <p>
                One-tap operator identity through Cursor is on the Season One
                roadmap. Callsigns are all you need today.
              </p>
              <a
                href="https://cursor.com/origin?ref=CyberTrack"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.originLink}
              >
                About Cursor Origin <IconExternal size={11} />
              </a>
            </div>

            <div className={styles.ruleNote}>
              Scores are <strong>training and readiness feedback only</strong> —
              never hiring criteria or job-suitability signals.
            </div>

            <Link
              href="/missions/basic_qualification"
              className="btn btn-outline"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Full Mission Brief →
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

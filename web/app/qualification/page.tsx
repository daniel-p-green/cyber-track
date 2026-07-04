import Link from "next/link";
import EnlistForm from "../components/EnlistForm";
import DeploymentProtocol, { ProtocolStep } from "../components/DeploymentProtocol";
import { RANKS } from "@/lib/ranks";
import {
  IconOffline,
  IconTerminal,
  IconExternal,
  RankChevrons,
  SlopeBadge,
} from "../components/svg";
import styles from "./page.module.css";

function Code({ children }: { children: React.ReactNode }) {
  return <div className={`panel-2 mono ${styles.code}`}>{children}</div>;
}

const STEPS: ProtocolStep[] = [
  {
    id: "cursor",
    title: "Install Cursor — your cockpit",
    body: (
      <>
        <p>
          Missions are flown inside a Cursor workspace. Already use Cursor?
          This step is done.
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
    id: "ollama",
    title: "Install Ollama — the local model runtime",
    body: (
      <>
        <p>Ollama runs Gemma4 on your machine. No API key, no account, no cloud.</p>
        <div className={styles.linkRow}>
          <a href="https://ollama.com/download" target="_blank" rel="noopener noreferrer">
            Install Ollama <IconExternal size={11} />
          </a>
        </div>
      </>
    ),
  },
  {
    id: "gemma",
    title: "Pull and verify local Gemma4",
    body: (
      <>
        <p>Pull the model, then prove the local path works before any mission:</p>
        <Code>
          <div><span className={styles.prompt}>$</span> <span className="signal">ollama pull</span> gemma4</div>
          <div><span className={styles.prompt}>$</span> <span className="signal">cybertf verify-model</span></div>
        </Code>
        <p>
          Green <code className={`mono ${styles.inline}`}>FIELD AI ONLINE</code>{" "}
          means you&apos;re mission-capable offline.
        </p>
      </>
    ),
  },
  {
    id: "workspace",
    title: "Open the mission workspace in Cursor",
    body: (
      <>
        <p>
          Every mission ships in the repo — briefs, evidence, the{" "}
          <code className={`mono ${styles.inline}`}>cybertf</code> CLI.
        </p>
        <Code>
          <div><span className={styles.prompt}>$</span> <span className="signal">git clone</span> https://github.com/daniel-p-green/cyber-track.git</div>
          <div><span className={styles.prompt}>$</span> <span className="signal">cursor</span> cyber-track</div>
        </Code>
      </>
    ),
  },
  {
    id: "callsign",
    title: "Claim your callsign — join the arena",
    body: (
      <>
        <p>
          Your arena identity. No email, no password. GitHub and X links
          optional.
        </p>
        <EnlistForm />
      </>
    ),
  },
  {
    id: "first-mission",
    title: "Fly Basic Qualification — submit for scoring",
    body: (
      <>
        <p>
          The brief hides one bad model claim. Catch it with evidence.
          15 minutes on the clock.
        </p>
        <Code>
          <div><span className={styles.prompt}>$</span> <span className="signal">cybertf run</span> basic_qualification</div>
          <div><span className={styles.prompt}>$</span> <span className="signal">cybertf ask</span> <span className="amber">&quot;What does the advisory claim?&quot;</span></div>
          <div><span className={styles.prompt}>$</span> <span className="signal">cybertf submit</span> basic_qualification answer.json</div>
          <div><span className={styles.prompt}>$</span> <span className="signal">cybertf publish</span> &lt;run_id&gt;</div>
        </Code>
        <p>
          <code className={`mono ${styles.inline}`}>submit</code> scores the run
          and writes your AAR.{" "}
          <code className={`mono ${styles.inline}`}>publish</code> posts it here.
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
            Season Zero · Deployment Protocol
          </div>
          <h1 className={`display ${styles.title}`}>Get Mission-Capable</h1>
          <p className={styles.subtitle}>
            Six steps from zero to your first scored run. Do the work in Cursor;
            the arena keeps score.
          </p>
          <div className={styles.slopeRow}>
            <SlopeBadge slope="green" label="Green Circle — Basic Qualification" size={13} />
            <span className="mono muted">15:00 timebox · +200 XP</span>
          </div>
        </div>

        {/* Constraint banner */}
        <div className={`hud-corners hud-corners-signal ${styles.constraint}`}>
          <IconOffline size={26} className={styles.constraintIcon} />
          <div>
            <div className={`display ${styles.constraintTitle}`}>
              Mission constraint: local Gemma4 only
            </div>
            <p>
              Missions run offline. Your only AI is Gemma4 on your own machine.
              That constraint is the training.
            </p>
          </div>
        </div>

        {/* Protocol + aside */}
        <div className={styles.layout}>
          <DeploymentProtocol steps={STEPS} />

          <aside className={styles.aside}>
            <div className={`panel ${styles.refCard}`}>
              <div className="section-label">
                <IconTerminal size={13} /> Cockpit Commands
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
                One-tap Cursor identity, coming in Season One. Callsigns are all
                you need today.
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
              Scores are <strong>training feedback</strong> — never hiring
              signals.
            </div>

            <Link
              href="/missions/basic_qualification"
              className="btn btn-outline"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Open the Mission Cockpit →
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

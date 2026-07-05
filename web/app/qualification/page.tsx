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
    title: "Install Cursor, your cockpit",
    body: (
      <>
        <p>
          Missions are flown inside Cursor: evidence in the editor,{" "}
          <code className={`mono ${styles.inline}`}>cybertf ask</code> as your
          field AI, this arena in the in-app browser. Already use Cursor?
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
    id: "workspace",
    title: "Open the CyberTrack workspace",
    body: (
      <>
        <p>
          Every mission ships in the repo: briefs, evidence files, and the{" "}
          <code className={`mono ${styles.inline}`}>cybertf</code> support CLI.
        </p>
        <Code>
          <div><span className={styles.prompt}>$</span> <span className="signal">git clone</span> https://github.com/daniel-p-green/cyber-track.git</div>
          <div><span className={styles.prompt}>$</span> <span className="signal">cursor</span> cyber-track</div>
        </Code>
        <p>
          Tip: open this arena in Cursor&apos;s in-app browser so missions,
          timers, and scores live next to your editor.
        </p>
      </>
    ),
  },
  {
    id: "ollama",
    title: "Install Ollama, the local model runtime",
    body: (
      <>
        <p>Ollama runs Gemma on your machine. No API key, no account, no cloud.</p>
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
    title: "Pull and verify local Gemma",
    body: (
      <>
        <p>Pull the model, then prove the local path works before any mission:</p>
        <Code>
          <div><span className={styles.prompt}>$</span> <span className="signal">ollama pull</span> gemma4</div>
          <div><span className={styles.prompt}>$</span> <span className="signal">cybertf verify-model</span></div>
        </Code>
        <p>
          Green <code className={`mono ${styles.inline}`}>FIELD AI ONLINE</code>{" "}
          means you&apos;re ready to fly offline. Every model query goes through{" "}
          <code className={`mono ${styles.inline}`}>cybertf ask</code> on the
          same local Gemma4 path.
        </p>
      </>
    ),
  },
  {
    id: "callsign",
    title: "Claim your callsign",
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
    title: "Fly Basic Qualification",
    body: (
      <>
        <p>
          Start the run, then do the real work in Cursor: read the evidence,
          run <code className={`mono ${styles.inline}`}>cybertf ask</code>,
          catch the one bad model claim, and write{" "}
          <code className={`mono ${styles.inline}`}>answer.json</code>.
          15 minutes on the clock.
        </p>
        <Code>
          <div><span className={styles.prompt}>$</span> <span className="signal">cybertf run</span> basic_qualification</div>
          <div><span className={styles.prompt}>$</span> <span className="signal">cybertf submit</span> basic_qualification answer.json</div>
          <div><span className={styles.prompt}>$</span> <span className="signal">cybertf publish</span> &lt;run_id&gt;</div>
        </Code>
        <p>
          <code className={`mono ${styles.inline}`}>run</code> arms the timer,{" "}
          <code className={`mono ${styles.inline}`}>submit</code> scores the run
          and writes your AAR,{" "}
          <code className={`mono ${styles.inline}`}>publish</code> posts it
          here. Everything between those commands happens in Cursor.
        </p>
      </>
    ),
  },
];

const QUICK_REF = [
  { cmd: "cybertf verify-model", desc: "Prove local Gemma is online" },
  { cmd: "cybertf run <id>", desc: "Start a mission (arms timer)" },
  { cmd: "cybertf ask \"...\"", desc: "Terminal fallback for model queries" },
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
            Season One · Setup
          </div>
          <h1 className={`display ${styles.title}`}>Get Mission-Capable</h1>
          <p className={styles.subtitle}>
            Six steps from zero to your first scored run: Cursor as the
            cockpit, Ollama running Gemma locally, a callsign, and one
            qualification mission. About five minutes of setup.
          </p>
          <div className={styles.slopeRow}>
            <SlopeBadge slope="green" label="Green Circle: Basic Qualification" size={13} />
            <span className="mono muted">15:00 timebox · +200 XP</span>
          </div>
        </div>

        {/* Constraint banner */}
        <div className={`hud-corners hud-corners-signal ${styles.constraint}`}>
          <IconOffline size={26} className={styles.constraintIcon} />
          <div>
            <div className={`display ${styles.constraintTitle}`}>
              Mission constraint: local Gemma only
            </div>
            <p>
              Missions run offline and private. Your only AI is a Gemma model
              on your own machine. That constraint is the training: it
              simulates the edge conditions where cloud AI is unavailable,
              untrusted, or inappropriate.
            </p>
          </div>
        </div>

        {/* Protocol + aside */}
        <div className={styles.layout}>
          <DeploymentProtocol steps={STEPS} />

          <aside className={styles.aside}>
            <div className={`panel ${styles.refCard}`}>
              <div className="section-label">
                <IconTerminal size={13} /> Support Commands
              </div>
              <p className={styles.refNote}>
                Scaffolding for timing, scoring, and publishing. The mission
                itself is flown in the editor and via{" "}
                <code className={`mono ${styles.inline}`}>cybertf ask</code>.
              </p>
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
                One-tap Cursor identity, coming in Season Two. Callsigns are all
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
              Scores are <strong>training feedback</strong>, never hiring
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

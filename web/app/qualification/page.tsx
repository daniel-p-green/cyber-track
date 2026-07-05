import Link from "next/link";
import EnlistForm from "../components/EnlistForm";
import DeploymentProtocol, { ProtocolStep } from "../components/DeploymentProtocol";
import { RANKS } from "@/lib/ranks";
import {
  IconExternal,
  IconOffline,
  IconTerminal,
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
    title: "Install Cursor",
    body: (
      <>
        <p>
          Cursor is the workspace: editor, terminal, and in-app browser.
        </p>
        <p>
          The default demo path uses <code className={`mono ${styles.inline}`}>cybertf ask</code>{" "}
          in Cursor&apos;s terminal. Cursor-native model chat is optional.
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
        <p>Ollama runs Gemma on your machine. Keep it running while you run missions.</p>
        <Code>
          <div><span className={styles.prompt}>$</span> <span className="signal">ollama serve</span> <span className="muted"># only if Ollama is not already running</span></div>
        </Code>
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
        <p>Pull Gemma, then prove the local path before any mission:</p>
        <Code>
          <div><span className={styles.prompt}>$</span> <span className="signal">ollama pull</span> gemma4:latest</div>
          <div><span className={styles.prompt}>$</span> <span className="signal">cybertf verify-model</span></div>
        </Code>
        <p>
          Expected result:{" "}
          <code className={`mono ${styles.inline}`}>Local inference ready</code>.
        </p>
        <Code>
          <div><span className={styles.prompt}>$</span> <span className="signal">cybertf ask</span> &quot;What claim should I verify?&quot; --file challenges/basic_qualification/data/field_ai_advisory.txt</div>
        </Code>
      </>
    ),
  },
  {
    id: "model-options",
    title: "Choose the AI access path",
    body: (
      <>
        <p>
          For judging, use the local path. The other options are backups, not
          the default demo flow.
        </p>
        <div className={styles.pathStack}>
          <div className={`${styles.pathBlock} ${styles.pathRecommended}`}>
            <div className={styles.pathHead}>
              <span className={`display ${styles.optionEyebrow}`}>Use this</span>
              <h3>Cursor terminal + cybertf ask</h3>
            </div>
            <p>
              No Cursor model settings. Ask local Gemma from the Cursor
              terminal with the evidence file attached.
            </p>
            <Code>
              <div><span className={styles.prompt}>$</span> <span className="signal">cybertf ask</span> &quot;What should I verify?&quot; --file challenges/basic_qualification/data/field_ai_advisory.txt</div>
            </Code>
          </div>

          <div className={styles.pathBlock}>
            <div className={styles.pathHead}>
              <span className={`display ${styles.optionEyebrow}`}>Advanced</span>
              <h3>Cursor-native chat</h3>
            </div>
            <p>
              Cursor cannot call private localhost directly. Expose Ollama with
              an HTTPS tunnel, then set Cursor&apos;s base URL to the tunnel plus{" "}
              <code className={`mono ${styles.inline}`}>/v1</code>.
            </p>
            <Code>
              <div><span className={styles.prompt}>$</span> <span className="signal">OLLAMA_ORIGINS</span>=&quot;*&quot; ollama serve</div>
              <div><span className={styles.prompt}>$</span> <span className="signal">ngrok http</span> 11434 --host-header=&quot;localhost:11434&quot;</div>
            </Code>
            <ul className={styles.pathFacts}>
              <li><span>Model</span><code className={`mono ${styles.inline}`}>gemma4:latest</code></li>
              <li><span>API key</span><code className={`mono ${styles.inline}`}>Ollama</code></li>
              <li><span>Base URL</span><code className={`mono ${styles.inline}`}>https://your-tunnel.ngrok-free.app/v1</code></li>
            </ul>
          </div>

          <div className={styles.pathBlock}>
            <div className={styles.pathHead}>
              <span className={`display ${styles.optionEyebrow}`}>Fallback</span>
              <h3>OpenRouter free Gemma</h3>
            </div>
            <p>
              Cloud backup only. Useful if local hardware fails, but not valid
              for local/offline compliance.
            </p>
            <Code>
              <div><span className={styles.prompt}>$</span> <span className="signal">export</span> CYBERTF_OPENAI_BASE=&quot;https://openrouter.ai/api/v1&quot;</div>
              <div><span className={styles.prompt}>$</span> <span className="signal">export</span> OPENROUTER_API_KEY=&quot;...&quot;</div>
              <div><span className={styles.prompt}>$</span> <span className="signal">export</span> CYBERTF_MODEL=&quot;google/gemma-4-26b-a4b-it:free&quot;</div>
              <div><span className={styles.prompt}>$</span> <span className="signal">cybertf verify-model</span></div>
            </Code>
          </div>
        </div>
      </>
    ),
  },
  {
    id: "callsign",
    title: "Claim your callsign",
    body: (
      <>
        <p>
          Pick the callsign that will appear on the leaderboard. Profile links
          are optional demo metadata.
        </p>
        <EnlistForm />
      </>
    ),
  },
  {
    id: "first-mission",
    title: "Run Basic Qualification",
    body: (
      <>
        <p>
          Start the run, then do the real work in Cursor: read the evidence,
          run <code className={`mono ${styles.inline}`}>cybertf ask</code>,
          catch the one bad model claim, and write{" "}
          <code className={`mono ${styles.inline}`}>answer.json</code>.
          The clock starts at 15 minutes.
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
  { cmd: "cybertf verify-model", desc: "Prove local inference is online" },
  { cmd: "cybertf run <id>", desc: "Start a mission (arms timer)" },
  { cmd: "cybertf ask \"...\"", desc: "Ask local Ollama/Gemma from Cursor terminal" },
  { cmd: "cybertf submit <id> answer.json", desc: "Score the run" },
  { cmd: "cybertf report <run_id>", desc: "Generate the AAR" },
  { cmd: "cybertf publish <run_id>", desc: "Post score to the leaderboard" },
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
          <h1 className={`display ${styles.title}`}>Set Up CyberTrack</h1>
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
              Gemma runs on your machine. Missions stay offline and private.
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
                itself runs in Cursor and via{" "}
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

            <Link
              href="/missions/basic_qualification"
              className="btn btn-outline"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Open Basic Qualification →
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

import { IconX, IconLinkedIn } from "./svg";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <span className="mono">CYBERTRACK · SEASON ZERO · OFFLINE AI OPERATOR READINESS</span>
          <span>
            Demo build. Scores are training feedback for decision quality — never
            hiring or job-suitability signals.
          </span>
        </div>
        <div className={styles.credit}>
          <span>Created by Daniel Green</span>
          <a
            href="https://x.com/dgrreen"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Daniel Green on X"
          >
            <IconX size={15} />
          </a>
          <a
            href="https://www.linkedin.com/in/danielpgreen"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Daniel Green on LinkedIn"
          >
            <IconLinkedIn size={15} />
          </a>
        </div>
      </div>
    </footer>
  );
}

import { IconX, IconLinkedIn } from "./svg";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <span className="mono">CYBERTRACK · RAISE SUMMIT HACKATHON 2026</span>
          <span>Google DeepMind Remote · Edge / On-Device Track</span>
        </div>
        <div className={styles.credit}>
          <span>Created by Daniel Green</span>
          <a
            href="https://x.com/dgrreen"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Daniel Green on X (opens in new tab)"
          >
            <IconX size={13} />
            <span className={styles.srOnly}>X</span>
          </a>
          <a
            href="https://www.linkedin.com/in/danielpgreen"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Daniel Green on LinkedIn (opens in new tab)"
          >
            <IconLinkedIn size={13} />
            <span className={styles.srOnly}>LinkedIn</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

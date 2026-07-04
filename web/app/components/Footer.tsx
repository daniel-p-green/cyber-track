import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <span className="mono" style={{ color: "var(--muted)", fontSize: "12px" }}>
          CYBERTRACK · Season Zero · Offline AI Operator Readiness
        </span>
        <span style={{ color: "var(--muted)", fontSize: "12px" }}>
          Demo build: submissions are validated in demo mode; scores are training feedback, not job-suitability signals.
        </span>
      </div>
    </footer>
  );
}

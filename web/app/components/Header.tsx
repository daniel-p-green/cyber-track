"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { openWelcomeWizard } from "./WelcomeWizard";
import { Wordmark, GemmaStatus } from "./svg";
import styles from "./Header.module.css";

const NAV = [
  { href: "/", label: "Command" },
  { href: "/missions", label: "Missions" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/qualification", label: "Setup" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label="CyberTrack home">
          <Wordmark height={18} />
          <span className={styles.badge}>
            <GemmaStatus compact />
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${
                (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href))
                  ? styles.active
                  : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            className={styles.briefBtn}
            onClick={openWelcomeWizard}
            aria-label="Replay the welcome briefing"
            title="Replay the welcome briefing"
          >
            ?
          </button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

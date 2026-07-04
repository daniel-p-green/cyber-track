"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

const NAV = [
  { href: "/", label: "Ops Home" },
  { href: "/missions", label: "Missions" },
  { href: "/leaderboard", label: "Scoreboard" },
  { href: "/qualification", label: "Enlist" },
];

export default function Header() {
  const pathname = usePathname();
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand}>
          <span className={`display ${styles.wordmark}`}>CYBERTRACK</span>
          <span className={`tag tag-signal ${styles.badge}`}>
            <span className={styles.dot}>●</span> GEMMA4 · LOCAL · OFFLINE
          </span>
        </Link>
        <nav className={styles.nav}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${pathname === item.href ? styles.active : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

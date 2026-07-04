"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { Wordmark, GemmaStatus } from "./svg";
import styles from "./Header.module.css";

const NAV = [
  { href: "/", label: "Command" },
  { href: "/missions", label: "Missions" },
  { href: "/leaderboard", label: "Arena" },
  { href: "/qualification", label: "Deploy" },
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
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

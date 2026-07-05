"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import styles from "./WelcomeWizard.module.css";

const STORAGE_KEY = "cybertrack-welcome-v1";

const STEPS = ["The Mission", "The Workspace", "Leaderboard", "Get Started"];

/* Module-level open/closed store so the header (or anything else) can
 * summon the briefing without prop drilling or context. */
let isOpen = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function openWelcomeWizard() {
  isOpen = true;
  emit();
}

function closeWelcomeWizard() {
  isOpen = false;
  emit();
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot() {
  return isOpen;
}

function getServerSnapshot() {
  return false;
}

function markSeen() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "done");
  } catch {
    /* private mode */
  }
}

export default function WelcomeWizard() {
  const open = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [step, setStep] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  // First visit: show once. Later visits: only via the header replay button.
  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        openWelcomeWizard();
      }
    } catch {
      /* private mode — skip auto-open rather than nag every visit */
    }
  }, []);

  const close = useCallback(() => {
    markSeen();
    closeWelcomeWizard();
    setStep(0);
    openerRef.current?.focus();
    openerRef.current = null;
  }, []);

  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement as HTMLElement;
    panelRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  if (!open) return null;

  const last = step === STEPS.length - 1;

  return (
    <div className={styles.backdrop} onClick={close}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to CyberTrack: Season One briefing"
        tabIndex={-1}
        className={`panel hud-corners hud-corners-signal ${styles.panel}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Head */}
        <div className={styles.head}>
          <div>
            <div className={`display ${styles.kicker}`}>
              <span className="pulse-dot" /> Season One · Operator Briefing
            </div>
            <div className={`display ${styles.title}`}>{STEPS[step]}</div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={close}
            aria-label="Close briefing"
          >
            ✕
          </button>
        </div>

        {/* Step segments */}
        <div
          className={styles.segments}
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-label={`Briefing step ${step + 1} of ${STEPS.length}`}
        >
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`${styles.segment} ${i <= step ? styles.segmentOn : ""}`}
            />
          ))}
        </div>

        {/* Body */}
        <div className={styles.body}>
          {step === 0 && (
            <>
              <p className={styles.lede}>
                Your job is to verify the answer under pressure.
              </p>
              <p className={styles.text}>
                Pick a mission, read the evidence, question the local model,
                and make a call that survives review.
              </p>
              <div className={styles.briefGrid} aria-label="Mission pressure points">
                <div className={styles.briefTile}>
                  <span className={`mono ${styles.tileIndex}`}>01</span>
                  <strong>Incomplete evidence</strong>
                  <span>Enough signal to decide, never enough to coast.</span>
                </div>
                <div className={styles.briefTile}>
                  <span className={`mono ${styles.tileIndex}`}>02</span>
                  <strong>Imperfect guidance</strong>
                  <span>The model helps, then overreaches.</span>
                </div>
                <div className={styles.briefTile}>
                  <span className={`mono ${styles.tileIndex}`}>03</span>
                  <strong>Defensible call</strong>
                  <span>Score comes from proof, not vibes.</span>
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <p className={styles.lede}>
                Work in Cursor.
              </p>
              <p className={styles.text}>
                Read the evidence, ask local Gemma with{" "}
                <code className="mono">cybertf ask</code>, then edit{" "}
                <code className="mono">answer.json</code>.
              </p>
              <div className={styles.flowCard} aria-label="Cursor workflow">
                <span className={`display ${styles.flowStep}`}>Read files</span>
                <span className={styles.flowArrow}>→</span>
                <span className={`display ${styles.flowStep}`}>Ask local Gemma</span>
                <span className={styles.flowArrow}>→</span>
                <span className={`display ${styles.flowStep}`}>Submit answer</span>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className={styles.lede}>
                Submit the run to see your score.
              </p>
              <ul className={styles.list}>
                <li>
                  <span>
                    Scored on verified evidence, model skepticism, recovery,
                    and decision quality.
                  </span>
                </li>
                <li>
                  <span>
                    Fast runs can be flagged. Proof wins.
                  </span>
                </li>
              </ul>
              <p className={styles.text}>
                You get an after-action report, XP, rank progress, and the
                leaderboard update.
              </p>
              <div className={styles.scoreGrid} aria-label="Scoring dimensions">
                {["Evidence", "Skepticism", "Recovery", "Decision"].map((label) => (
                  <span key={label} className={`display ${styles.scorePill}`}>
                    {label}
                  </span>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className={styles.lede}>
                Start with Basic Qualification.
              </p>
              <p className={styles.text}>
                Setup walks through Cursor, Ollama, local Gemma, and your
                callsign.
              </p>
              <div className={styles.missionTicket}>
                <div>
                  <span className={`mono ${styles.ticketMeta}`}>Green Circle · 15:00</span>
                  <strong>Basic Qualification</strong>
                </div>
                <span className={`mono ${styles.ticketXp}`}>+200 XP</span>
              </div>
              <div className={styles.ctaRow}>
                <Link href="/qualification" className="btn btn-primary" onClick={close}>
                  Start Setup →
                </Link>
                <Link href="/missions" className="btn btn-outline" onClick={close}>
                  Missions
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Foot */}
        <div className={styles.foot}>
          <button type="button" className={styles.skip} onClick={close}>
            {last ? "Close" : "Skip briefing"}
          </button>
          <div className={styles.navBtns}>
            {step > 0 && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setStep((s) => s - 1)}
              >
                ← Back
              </button>
            )}
            {!last && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep((s) => s + 1)}
              >
                Next →
              </button>
            )}
            {last && (
              <button type="button" className="btn btn-primary" onClick={close}>
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

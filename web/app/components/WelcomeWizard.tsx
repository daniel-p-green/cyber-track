"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  IconChat,
  IconFile,
  IconOffline,
  IconSuspicious,
  IconTerminal,
  SlopeBadge,
} from "./svg";
import styles from "./WelcomeWizard.module.css";

const STORAGE_KEY = "cybertrack-welcome-v1";

const STEPS = ["The Mission", "The Cockpit", "The Arena", "Get Started"];

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
        aria-label="Welcome to CyberTrack: Season Zero briefing"
        tabIndex={-1}
        className={`panel hud-corners hud-corners-signal ${styles.panel}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Head */}
        <div className={styles.head}>
          <div>
            <div className={`display ${styles.kicker}`}>
              <span className="pulse-dot" /> Season Zero · Operator Briefing
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
                <strong>CyberTrack is Call of Duty for AI operators.</strong>{" "}
                You solve timed incidents and get scored on judgment, not
                typing speed.
              </p>
              <div className={styles.enemyRow}>
                <span className={`display ${styles.enemyLabel}`}>The enemy</span>
                <span className="tag tag-amber">uncertainty</span>
                <span className="tag tag-amber">bad AI guidance</span>
                <span className="tag tag-amber">incomplete evidence</span>
              </div>
              <p className={styles.text}>
                Every mission runs with <strong>local Gemma only</strong>. It
                simulates edge deployments where cloud AI is unavailable,
                untrusted, or too slow. Offline, private, on your own machine.
              </p>
            </>
          )}

          {step === 1 && (
            <>
              <p className={styles.lede}>
                <strong>Cursor is the cockpit.</strong> The mission work never
                happens on this website.
              </p>
              <ul className={styles.list}>
                <li>
                  <IconFile size={15} />
                  <span>
                    <strong>Workspace.</strong> The repo ships every mission:
                    briefs, evidence files, and the answer file you edit.
                  </span>
                </li>
                <li>
                  <IconChat size={15} />
                  <span>
                    <strong>Cursor Chat.</strong> Your only AI is Gemma running
                    locally. Ask sharp questions, feed it the right evidence,
                    catch it when it&apos;s wrong.
                  </span>
                </li>
                <li>
                  <IconTerminal size={15} />
                  <span>
                    <strong>Support commands.</strong> A small{" "}
                    <code className="mono">cybertf</code> CLI arms timers and
                    scores runs. Scaffolding, not the skill.
                  </span>
                </li>
              </ul>
              <p className={styles.text}>
                Tip: open this arena in Cursor&apos;s in-app browser so the
                mission board lives next to your editor.
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <p className={styles.lede}>
                <strong>This arena keeps score.</strong> Pick a mission, fly it
                in Cursor, submit your evidence back here.
              </p>
              <ul className={styles.list}>
                <li>
                  <IconOffline size={15} />
                  <span>
                    Deterministic scoring on whether you{" "}
                    <strong>verified, challenged, and recovered</strong>. No
                    model grades you.
                  </span>
                </li>
                <li>
                  <IconSuspicious size={15} />
                  <span>
                    Impossibly fast runs get flagged as suspicious: zero XP, no
                    podium. Evidence beats speed.
                  </span>
                </li>
              </ul>
              <p className={styles.text}>
                Every scored run earns XP toward your rank, an after-action
                report, and a spot on the Season Zero leaderboard.
              </p>
            </>
          )}

          {step === 3 && (
            <>
              <p className={styles.lede}>
                <strong>Six missions, ski-slope difficulty.</strong> Start
                green, work toward double black.
              </p>
              <div className={styles.slopes}>
                <SlopeBadge slope="green" label="Green: qualification" size={13} />
                <SlopeBadge slope="blue" label="Blue: sprint" size={13} />
                <SlopeBadge slope="black" label="Black: advanced field" size={13} />
                <SlopeBadge slope="double-black" label="Double black: marathon" size={13} />
              </div>
              <p className={styles.text}>
                Setup takes about five minutes: Cursor, the workspace, Ollama,
                local Gemma, a callsign. Then fly Basic Qualification.
              </p>
              <div className={styles.ctaRow}>
                <Link href="/qualification" className="btn btn-primary" onClick={close}>
                  Start Setup →
                </Link>
                <Link href="/missions" className="btn btn-outline" onClick={close}>
                  Mission Board
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
                Enter the Arena
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

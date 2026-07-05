"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import styles from "./DeploymentProtocol.module.css";

export interface ProtocolStep {
  id: string;
  title: string;
  body: React.ReactNode;
}

const STORAGE_KEY = "cybertrack-protocol-v1";
const CHANGE_EVENT = "cybertrack-protocol-change";

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function getServerSnapshot(): string {
  return "[]";
}

function writeDone(ids: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Interactive setup protocol: expandable steps with persisted completion.
 *  Turns onboarding from a document into an instrument. */
export default function DeploymentProtocol({ steps }: { steps: ProtocolStep[] }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const done = useMemo(() => {
    try {
      const ids: string[] = JSON.parse(raw);
      return new Set(ids.filter((id) => steps.some((s) => s.id === id)));
    } catch {
      return new Set<string>();
    }
  }, [raw, steps]);

  // undefined = "not touched yet" → derive first incomplete step during render.
  const [openState, setOpen] = useState<string | null | undefined>(undefined);
  const open =
    openState === undefined
      ? steps.find((s) => !done.has(s.id))?.id ?? null
      : openState;

  function markComplete(id: string) {
    const next = new Set(done);
    next.add(id);
    writeDone([...next]);
    const idx = steps.findIndex((s) => s.id === id);
    const nextOpen = steps.slice(idx + 1).find((s) => !next.has(s.id));
    setOpen(nextOpen ? nextOpen.id : null);
  }

  function markIncomplete(id: string) {
    const next = new Set(done);
    next.delete(id);
    writeDone([...next]);
    setOpen(id);
  }

  const count = done.size;
  const allDone = count === steps.length;

  return (
    <div className={styles.protocol}>
      {/* Progress header */}
      <div className={styles.progressHead}>
        <span className={`display ${styles.progressLabel}`}>
          {allDone ? "Setup complete. You are ready to run." : "Setup progress"}
        </span>
        <span
          className={`mono ${styles.progressCount}`}
          style={{ color: allDone ? "var(--signal)" : undefined }}
        >
          {count}/{steps.length}
        </span>
      </div>
      <div
        className={styles.segments}
        role="progressbar"
        aria-valuenow={count}
        aria-valuemin={0}
        aria-valuemax={steps.length}
      >
        {steps.map((s) => (
          <span
            key={s.id}
            className={`${styles.segment} ${done.has(s.id) ? styles.segmentDone : ""}`}
          />
        ))}
      </div>

      {/* Steps */}
      <ol className={styles.steps}>
        {steps.map((step, i) => {
          const isDone = done.has(step.id);
          const isOpen = open === step.id;
          return (
            <li key={step.id} className={`${styles.step} ${isDone ? styles.stepDone : ""}`}>
              <button
                type="button"
                className={styles.stepHead}
                onClick={() => setOpen(isOpen ? null : step.id)}
                aria-expanded={isOpen}
              >
                <span className={`${styles.marker} ${isDone ? styles.markerDone : ""}`} aria-hidden>
                  {isDone ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5.5 12.5 4 4 9-9.5" />
                    </svg>
                  ) : (
                    <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                  )}
                </span>
                <span className={`display ${styles.stepTitle}`}>{step.title}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden
                  className={styles.chevron}
                  style={{ transform: isOpen ? "rotate(180deg)" : undefined }}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {isOpen && (
                <div className={styles.stepBody}>
                  {step.body}
                  <div className={styles.stepActions}>
                    {isDone ? (
                      <button type="button" className={styles.undoBtn} onClick={() => markIncomplete(step.id)}>
                        Mark incomplete
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ fontSize: 12, padding: "7px 16px" }}
                        onClick={() => markComplete(step.id)}
                      >
                        Mark step complete ✓
                      </button>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {allDone && (
        <Link href="/missions/basic_qualification" className={`btn btn-primary ${styles.launch}`}>
          Proceed to Basic Qualification →
        </Link>
      )}
    </div>
  );
}

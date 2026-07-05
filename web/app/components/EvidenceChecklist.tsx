"use client";

import { useState } from "react";

interface Props {
  missionId: string;
  files: string[];
}

/** Interactive evidence tracker. Checking files off makes the run feel
 *  live. State is per-session; the CLI is the source of truth for scoring. */
export default function EvidenceChecklist({ missionId, files }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggle(f: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  }

  const done = checked.size;

  return (
    <div>
      <div
        className="mono"
        style={{
          fontSize: 11,
          color: done === files.length ? "var(--signal)" : "var(--muted)",
          marginBottom: 10,
          letterSpacing: "0.04em",
        }}
      >
        {done}/{files.length} REVIEWED
      </div>
      <ul
        style={{
          listStyle: "none",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
          gap: 8,
        }}
      >
        {files.map((f) => {
          const on = checked.has(f);
          const fullPath = `challenges/${missionId}/data/${f}`;
          return (
            <li key={f}>
              <button
                type="button"
                onClick={() => toggle(f)}
                aria-pressed={on}
                title={fullPath}
                style={{
                  width: "100%",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "9px 12px",
                  border: `1px solid ${on ? "color-mix(in srgb, var(--signal) 45%, transparent)" : "var(--line)"}`,
                  borderRadius: 2,
                  background: on
                    ? "color-mix(in srgb, var(--signal) 7%, transparent)"
                    : "var(--panel-2)",
                  color: on ? "var(--text)" : "var(--muted)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12.5,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "border-color 120ms ease-out, background 120ms ease-out",
                  minWidth: 0,
                }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  style={{ flexShrink: 0, color: on ? "var(--signal)" : "var(--line-strong)" }}
                >
                  <rect x="4" y="4" width="16" height="16" rx="1.5" />
                  {on && <path d="m8.5 12.3 2.4 2.5 4.8-5.4" />}
                </svg>
                <span
                  style={{
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {f}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

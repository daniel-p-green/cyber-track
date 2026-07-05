/* CyberTrack SVG system — purposeful interface glyphs, not decoration.
   Every mark maps to a real concept: mission categories, rank plates,
   Gemma status, evidence, suspicious-time flags, progression nodes,
   and the AAR score ring. All inherit currentColor unless stated. */

import type { CSSProperties } from "react";

interface IconProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

function base(size: number) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
}

/* ── Wordmark ──────────────────────────────────────────────────────────── */

export function Wordmark({ height = 22, className }: { height?: number; className?: string }) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 2,
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: height,
        lineHeight: 1,
        letterSpacing: "0.09em",
        color: "var(--text)",
        textTransform: "uppercase",
      }}
    >
      CYBERTRACK
      <span
        aria-hidden
        style={{
          width: Math.max(7, height * 0.5),
          height: Math.max(3, height * 0.16),
          background: "var(--signal)",
          alignSelf: "flex-end",
          marginBottom: 1,
          animation: "caret-blink 1.4s step-end infinite",
        }}
      />
    </span>
  );
}

/* ── Mission category icons (per brand mockup rail) ───────────────────── */

/** 01 Qualification — verified check in a ring */
export function IconQualification({ size = 20, className, style }: IconProps) {
  return (
    <svg {...base(size)} className={className} style={style}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.4 12.2 2.4 2.5 4.8-5.2" />
    </svg>
  );
}

/** 02 Sprint — target reticle (Signal Lost) */
export function IconSprint({ size = 20, className, style }: IconProps) {
  return (
    <svg {...base(size)} className={className} style={style}>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M12 1.8v3.4M12 18.8v3.4M1.8 12h3.4M18.8 12h3.4" />
    </svg>
  );
}

/** 03 Field: Prompt Under Fire — lightning strike */
export function IconField({ size = 20, className, style }: IconProps) {
  return (
    <svg {...base(size)} className={className} style={style}>
      <path d="M13.2 2.5 5.6 13.4h4.9L10.8 21.5l7.6-11h-4.9z" />
    </svg>
  );
}

/** 04 Field: Patch — puzzle piece */
export function IconPatch({ size = 20, className, style }: IconProps) {
  return (
    <svg {...base(size)} className={className} style={style}>
      <path d="M9.5 4.2h4v2.1a1.9 1.9 0 1 0 3.4 1.2 1.6 1.6 0 0 1 0 .1V10h2.9v4h-2.1a1.9 1.9 0 1 0-1.2 3.4h-.1 3.4v2.4h-4.2v-2.1a1.9 1.9 0 1 0-3.4-1.2v.1V19.8H4.2v-4.2h2.1a1.9 1.9 0 1 0 1.2-3.4h-.1H4.2V4.2h5.3Z" />
    </svg>
  );
}

/** 05 Relay — two operator nodes with a handoff link */
export function IconRelay({ size = 20, className, style }: IconProps) {
  return (
    <svg {...base(size)} className={className} style={style}>
      <circle cx="7" cy="8" r="2.6" />
      <circle cx="17" cy="8" r="2.6" />
      <path d="M2.8 19c.5-3 2.2-4.6 4.2-4.6S10.7 16 11.2 19" />
      <path d="M12.8 19c.5-3 2.2-4.6 4.2-4.6s3.7 1.6 4.2 4.6" />
    </svg>
  );
}

/** 06 Marathon — comms antenna (degraded comms) */
export function IconMarathon({ size = 20, className, style }: IconProps) {
  return (
    <svg {...base(size)} className={className} style={style}>
      <path d="M12 9.5V21M8 21h8" />
      <circle cx="12" cy="7.5" r="1.9" />
      <path d="M7.8 3.6a6.4 6.4 0 0 0 0 7.8M16.2 3.6a6.4 6.4 0 0 1 0 7.8" />
    </svg>
  );
}

/** Renders the correct category glyph for a mission without creating
 *  component references at render time (react-hooks/static-components). */
export function MissionGlyph({
  eventType,
  missionId,
  size = 20,
  className,
}: IconProps & { eventType: string; missionId?: string }) {
  if (missionId === "field_patch_edge_agent") return <IconPatch size={size} className={className} />;
  switch (eventType) {
    case "qualification": return <IconQualification size={size} className={className} />;
    case "sprint": return <IconSprint size={size} className={className} />;
    case "field": return <IconField size={size} className={className} />;
    case "relay": return <IconRelay size={size} className={className} />;
    case "marathon": return <IconMarathon size={size} className={className} />;
    default: return <IconSprint size={size} className={className} />;
  }
}

/* ── Slope rating — skiing-style mission difficulty marks ──────────────── */

function SlopeShape({ slope, size }: { slope: string; size: number }) {
  // Black diamonds carry a light outline so they stay iconic on dark panels.
  const s = size;
  if (slope === "green") {
    return (
      <svg width={s} height={s} viewBox="0 0 20 20" aria-hidden>
        <circle cx="10" cy="10" r="7.5" fill="var(--signal)" />
      </svg>
    );
  }
  if (slope === "blue") {
    return (
      <svg width={s} height={s} viewBox="0 0 20 20" aria-hidden>
        <rect x="3.5" y="3.5" width="13" height="13" fill="var(--ice)" />
      </svg>
    );
  }
  if (slope === "black") {
    return (
      <svg width={s} height={s} viewBox="0 0 20 20" aria-hidden>
        <path d="M10 1.5 18 10l-8 8.5L2 10Z" fill="#0B0F14" stroke="var(--text)" strokeWidth="1.4" />
      </svg>
    );
  }
  // double-black
  return (
    <svg width={s * 1.7} height={s} viewBox="0 0 34 20" aria-hidden>
      <path d="M9 1.5 16.5 10 9 18.5 1.5 10Z" fill="#0B0F14" stroke="var(--text)" strokeWidth="1.4" />
      <path d="M25 1.5 32.5 10 25 18.5 17.5 10Z" fill="#0B0F14" stroke="var(--text)" strokeWidth="1.4" />
    </svg>
  );
}

export function SlopeBadge({
  slope,
  label,
  size = 14,
  withLabel = true,
  className,
}: {
  slope: string;
  label?: string;
  size?: number;
  withLabel?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`display ${className ?? ""}`}
      title={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: Math.max(10, size * 0.78),
        fontWeight: 700,
        letterSpacing: "0.07em",
        color: "var(--muted)",
        whiteSpace: "nowrap",
      }}
    >
      <SlopeShape slope={slope} size={size} />
      {withLabel && label}
    </span>
  );
}

/* ── Rank plate — hexagonal callsign/rank mark ─────────────────────────── */

export function RankPlate({
  letter,
  size = 44,
  className,
}: {
  letter: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M24 3 41.3 13v20L24 43 6.7 33V13Z"
        stroke="var(--signal)"
        strokeWidth="2"
        fill="color-mix(in srgb, var(--signal) 8%, transparent)"
      />
      <path
        d="M24 8.5 36.9 16v15L24 38.5 11.1 31V16Z"
        stroke="var(--line-strong)"
        strokeWidth="1"
      />
      <text
        x="24"
        y="30.5"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontWeight="800"
        fontSize="19"
        fill="var(--text)"
      >
        {letter}
      </text>
    </svg>
  );
}

/* Rank mark strip — tiered geometry per the brand sheet: triangles for the
   early tiers, diamonds for the senior ones. Filled count = tier. */
export function RankChevrons({
  tier,
  max = 7,
  size = 11,
  className,
}: {
  tier: number;
  max?: number;
  size?: number;
  className?: string;
}) {
  const w = (size + 3) * max;
  return (
    <svg width={w} height={size + 2} viewBox={`0 0 ${w} ${size + 2}`} aria-hidden className={className}>
      {Array.from({ length: max }).map((_, i) => {
        const cx = i * (size + 3) + size / 2 + 1;
        const cy = size / 2 + 1;
        const r = size / 2;
        const filled = i < tier;
        const isTriangle = i < 3;
        const d = isTriangle
          ? `M${cx} ${cy - r} L${cx + r} ${cy + r} L${cx - r} ${cy + r} Z`
          : `M${cx} ${cy - r} L${cx + r} ${cy} L${cx} ${cy + r} L${cx - r} ${cy} Z`;
        return (
          <path
            key={i}
            d={d}
            fill={filled ? "var(--signal)" : "transparent"}
            stroke={filled ? "var(--signal)" : "var(--line-strong)"}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}

/* ── Hex mission badge — hexagonal outline plate around a glyph ─────────── */

export function HexBadge({
  size = 44,
  tone = "muted",
  children,
  className,
}: {
  size?: number;
  tone?: "muted" | "signal" | "ice";
  children?: React.ReactNode;
  className?: string;
}) {
  const stroke =
    tone === "signal" ? "var(--signal)" : tone === "ice" ? "var(--ice)" : "var(--line-strong)";
  return (
    <span
      className={className}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden
        style={{ position: "absolute", inset: 0 }}
      >
        <path
          d="M24 2.5 42.6 13.25v21.5L24 45.5 5.4 34.75v-21.5Z"
          stroke={stroke}
          strokeWidth="2"
          strokeLinejoin="round"
          fill={
            tone === "signal"
              ? "color-mix(in srgb, var(--signal) 7%, transparent)"
              : "var(--panel-2)"
          }
        />
      </svg>
      <span style={{ position: "relative", display: "inline-flex" }}>{children}</span>
    </span>
  );
}

/* ── Legacy local-runtime badge. Prefer LocalRuntimeStatus for live pages. ─ */

export function GemmaStatus({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      className={`display ${className ?? ""}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: compact ? "3px 10px" : "6px 14px",
        border: "1.4px solid color-mix(in srgb, var(--signal) 55%, transparent)",
        background: "color-mix(in srgb, var(--signal) 5%, transparent)",
        borderRadius: 6,
        fontSize: compact ? 10 : 11,
        fontWeight: 700,
        letterSpacing: "0.11em",
        color: "var(--signal)",
        whiteSpace: "nowrap",
      }}
    >
      OLLAMA {compact ? "" : "LOCAL"}
    </span>
  );
}

/** "100% LOCAL" chip — outlined, no dot, per the brand sheet */
export function LocalChip({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      className={`display ${className ?? ""}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: compact ? "3px 10px" : "6px 14px",
        border: "1.4px solid color-mix(in srgb, var(--signal) 55%, transparent)",
        borderRadius: 6,
        fontSize: compact ? 10 : 11,
        fontWeight: 700,
        letterSpacing: "0.11em",
        color: "var(--signal)",
        whiteSpace: "nowrap",
      }}
    >
      100% LOCAL
    </span>
  );
}

/* ── Model-verification chips — amber warning / green corrected ────────── */

export function VerifyChip({
  kind,
  className,
  compact = false,
}: {
  kind: "warning" | "corrected";
  className?: string;
  compact?: boolean;
}) {
  const isWarn = kind === "warning";
  const tone = isWarn ? "var(--amber)" : "var(--signal)";
  const label = isWarn ? "HYPOTHESIS NEEDS VERIFICATION" : "OPERATOR CORRECTED";
  const iconSize = compact ? 11 : 13;
  return (
    <span
      className={`display ${className ?? ""}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: compact ? "3px 9px" : "5px 12px",
        border: `1.4px solid color-mix(in srgb, ${tone} 55%, transparent)`,
        background: `color-mix(in srgb, ${tone} 5%, transparent)`,
        borderRadius: 6,
        fontSize: compact ? 9.5 : 10.5,
        fontWeight: 700,
        letterSpacing: "0.1em",
        color: tone,
        whiteSpace: "nowrap",
      }}
    >
      {isWarn ? (
        <svg {...base(iconSize)}>
          <path d="M12 3.5 21.5 20h-19Z" />
          <path d="M12 10v4.4" />
          <circle cx="12" cy="17.2" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      ) : (
        <svg {...base(iconSize)}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="m8.4 12.2 2.4 2.5 4.8-5.2" />
        </svg>
      )}
      {label}
    </span>
  );
}

/* ── Evidence / checklist ──────────────────────────────────────────────── */

export function IconEvidence({ size = 15, checked = true, className }: IconProps & { checked?: boolean }) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      {checked && <path d="m8.5 12.3 2.4 2.5 4.8-5.4" stroke="var(--signal)" />}
    </svg>
  );
}

export function IconFile({ size = 15, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
    </svg>
  );
}

export function IconTimer({ size = 15, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="13" r="7.5" />
      <path d="M12 9.5V13l2.5 2M9.5 2.5h5" />
    </svg>
  );
}

export function IconChat({ size = 15, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M4 5h16v11H9l-5 4z" />
      <path d="M8 9.2h8M8 12.2h5" />
    </svg>
  );
}

export function IconTerminal({ size = 15, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="3" y="4.5" width="18" height="15" rx="1.5" />
      <path d="m7 10 3 2.5L7 15M12.5 15.5H17" />
    </svg>
  );
}

export function IconOffline({ size = 15, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M5 12.5a8.4 8.4 0 0 1 14 0" />
      <path d="M8 15.7a4.4 4.4 0 0 1 8 0" />
      <circle cx="12" cy="19" r="1.3" fill="currentColor" stroke="none" />
      <path d="m3.5 3.5 17 17" stroke="var(--alert)" />
    </svg>
  );
}

/* ── Suspicious-time warning mark ──────────────────────────────────────── */

export function IconSuspicious({ size = 15, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} style={{ color: "var(--amber)" }}>
      <path d="M12 3.5 21.5 20h-19Z" />
      <path d="M12 10v4.4" />
      <circle cx="12" cy="17.2" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ── Progression rail node ─────────────────────────────────────────────── */

export type NodeState = "completed" | "active" | "available" | "locked" | "advanced";

/* Five node states per the brand sheet:
   completed = green check ring · active = cyan reticle ring with tick marks
   available = plain dark ring · locked = dashed ring + padlock
   advanced = amber diamond ring */
export function RailNode({
  state,
  size = 40,
  children,
  className,
}: {
  state: NodeState;
  size?: number;
  children?: React.ReactNode;
  className?: string;
}) {
  const ring =
    state === "completed" ? "var(--signal)"
    : state === "active" ? "var(--ice)"
    : state === "advanced" ? "var(--amber)"
    : state === "available" ? "var(--line-strong)"
    : "var(--line-strong)";
  const color =
    state === "completed" ? "var(--signal)"
    : state === "active" ? "var(--ice)"
    : state === "advanced" ? "var(--amber)"
    : state === "available" ? "var(--muted)"
    : "var(--line-strong)";
  return (
    <span
      className={className}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        border: `1.8px ${state === "locked" ? "dashed" : "solid"} ${ring}`,
        background:
          state === "active"
            ? "color-mix(in srgb, var(--ice) 10%, transparent)"
            : state === "completed"
            ? "color-mix(in srgb, var(--signal) 8%, transparent)"
            : state === "advanced"
            ? "color-mix(in srgb, var(--amber) 8%, transparent)"
            : "transparent",
        color,
        flexShrink: 0,
      }}
    >
      {state === "completed" ? (
        <svg {...base(size * 0.5)}>
          <path d="m5.5 12.5 4 4 9-9.5" stroke="var(--signal)" strokeWidth="2.4" />
        </svg>
      ) : state === "locked" ? (
        <svg {...base(size * 0.44)}>
          <rect x="5.5" y="10.5" width="13" height="9.5" rx="1.5" />
          <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
        </svg>
      ) : state === "advanced" && !children ? (
        <svg {...base(size * 0.44)}>
          <path d="M12 4.5 19.5 12 12 19.5 4.5 12Z" />
        </svg>
      ) : (
        children
      )}
      {state === "active" && (
        <>
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: -6,
              borderRadius: "50%",
              border: "1px solid color-mix(in srgb, var(--ice) 40%, transparent)",
            }}
          />
          {/* Reticle tick marks at the compass points */}
          <svg
            aria-hidden
            viewBox="0 0 48 48"
            fill="none"
            stroke="var(--ice)"
            strokeWidth="2.4"
            strokeLinecap="round"
            style={{ position: "absolute", inset: -10, width: size + 20, height: size + 20 }}
          >
            <path d="M24 2v4.5M24 41.5V46M2 24h4.5M41.5 24H46" />
          </svg>
        </>
      )}
      {state === "advanced" && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: -6,
            borderRadius: "50%",
            border: "1px dashed color-mix(in srgb, var(--amber) 45%, transparent)",
          }}
        />
      )}
    </span>
  );
}

/* ── AAR score ring ────────────────────────────────────────────────────── */

export function ScoreRing({
  score,
  max = 100,
  size = 96,
  label,
  className,
}: {
  score: number;
  max?: number;
  size?: number;
  label?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(1, score / Math.max(max, 1)));
  const r = 42;
  const c = 2 * Math.PI * r;
  const tone = pct >= 0.8 ? "var(--signal)" : pct >= 0.5 ? "var(--amber)" : "var(--alert)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Score ${score} of ${max}`}
      className={className}
    >
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--line)" strokeWidth="6" />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke={tone}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${c * pct} ${c}`}
        transform="rotate(-90 50 50)"
      />
      <text
        x="50"
        y="47"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-mono)"
        fontWeight="700"
        fontSize="26"
        fill="var(--text)"
      >
        {score}
      </text>
      <text
        x="50"
        y="64"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="9"
        fill="var(--muted)"
      >
        /{max}
      </text>
      {label && (
        <text
          x="50"
          y="76"
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontSize="8"
          letterSpacing="1"
          fill="var(--muted)"
        >
          {label.toUpperCase()}
        </text>
      )}
    </svg>
  );
}

/* ── Action glyphs — deploy / replay / scoreboard buttons ──────────────── */

export function IconPlay({ size = 12, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M7 4.5 19 12 7 19.5Z" />
    </svg>
  );
}

export function IconReplay({ size = 12, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4 9.4" />
      <path d="M4 4.5v4.9h4.9" />
    </svg>
  );
}

export function IconBars({ size = 12, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M5 20v-5M12 20V9M19 20V4" />
    </svg>
  );
}

/* ── Social marks ──────────────────────────────────────────────────────── */

export function IconX({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M17.6 3h3.1l-6.8 7.8 8 10.2h-6.3l-4.9-6.3L5.1 21H2l7.3-8.4L1.6 3h6.4l4.4 5.7L17.6 3Zm-1.1 16.2h1.7L7.1 4.7H5.3l11.2 14.5Z" />
    </svg>
  );
}

export function IconGitHub({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2.2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.9.6-3.5-1.2-3.5-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 0 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.3-.3-4.7-1.1-4.7-5A3.9 3.9 0 0 1 6.3 9c-.1-.3-.5-1.3.1-2.7 0 0 .9-.3 2.8 1a9.7 9.7 0 0 1 5.1 0c1.9-1.3 2.8-1 2.8-1 .6 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.7 5 .4.3.7.9.7 1.9v2.7c0 .3.2.6.7.5A10 10 0 0 0 12 2.2Z" />
    </svg>
  );
}

export function IconLinkedIn({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M5.2 8.7H2.4V21h2.8V8.7ZM5.4 4.9A1.7 1.7 0 1 0 2 4.9a1.7 1.7 0 0 0 3.4 0ZM21.6 14c0-3.5-1.9-5.2-4.4-5.2-2 0-2.9 1.1-3.4 1.9v-2h-2.8V21h2.8v-6.1c0-1.6.3-3.2 2.3-3.2s2 1.8 2 3.3v6h2.8v-7Z" />
    </svg>
  );
}

export function IconExternal({ size = 12, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M14 4h6v6M20 4 11 13M9 6H5v13h13v-4" />
    </svg>
  );
}

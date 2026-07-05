"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** SSR-safe speech synthesis detection without effect-driven state. */
function useSpeechSupported(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    () => false
  );
}

interface Props {
  /** The text spoken aloud. Keep it briefing-length: 8 to 20 seconds. */
  text: string;
  /** Button label before playback starts. */
  label?: string;
  compact?: boolean;
  className?: string;
}

/** Offline voice briefing via the browser's built-in speech synthesis.
 *  Mirrors the cybertf audio tier: local device voice, no cloud, optional
 *  polish. Renders nothing when the platform has no voice available. */
export default function VoiceBriefing({
  text,
  label = "Play briefing",
  compact = false,
  className,
}: Props) {
  const supported = useSpeechSupported();
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Stop playback when the component unmounts (e.g. page navigation).
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!supported) return null;

  function toggle() {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.04;
    u.pitch = 0.92;
    // Prefer an English local (on-device) voice when one exists.
    const voices = synth.getVoices();
    const local = voices.find((v) => v.localService && v.lang.startsWith("en"));
    if (local) u.voice = local;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utterRef.current = u;
    setSpeaking(true);
    synth.speak(u);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      aria-label={speaking ? "Stop the voice briefing" : label}
      className={`display ${className ?? ""}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: compact ? "4px 11px" : "7px 15px",
        border: `1.4px solid ${
          speaking
            ? "var(--signal)"
            : "color-mix(in srgb, var(--muted) 45%, transparent)"
        }`,
        borderRadius: 6,
        background: speaking
          ? "color-mix(in srgb, var(--signal) 7%, transparent)"
          : "transparent",
        color: speaking ? "var(--signal)" : "var(--muted)",
        fontSize: compact ? 10 : 11.5,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        transition: "color 120ms ease-out, border-color 120ms ease-out",
      }}
    >
      {speaking ? (
        /* stop mark */
        <svg width={compact ? 9 : 11} height={compact ? 9 : 11} viewBox="0 0 12 12" aria-hidden>
          <rect x="1.5" y="1.5" width="9" height="9" fill="currentColor" rx="1" />
        </svg>
      ) : (
        /* speaker mark */
        <svg
          width={compact ? 11 : 13}
          height={compact ? 11 : 13}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M4 9.5v5h4l5 4v-13l-5 4z" />
          <path d="M16.5 8.8a4.6 4.6 0 0 1 0 6.4M19 6.4a8 8 0 0 1 0 11.2" />
        </svg>
      )}
      {speaking ? "Stop" : label}
    </button>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./EnlistForm.module.css";

export default function EnlistForm() {
  const router = useRouter();
  const [callsign, setCallsign] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!callsign.trim()) return;
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/operators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callsign: callsign.trim(),
          github_url: githubUrl.trim() || undefined,
          x_url: xUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Callsign failed.");
        return;
      }
      setStatus("success");
      setMessage(`CALLSIGN CONFIRMED · ${data.operator.callsign} · ${data.operator.rank}`);
      setTimeout(() => {
        router.push(`/operators/${data.operator.callsign}`);
      }, 1200);
    } catch {
      setStatus("error");
      setMessage("Network error. Check connection.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={`display ${styles.label}`} htmlFor="callsign">
            Callsign
          </label>
          <input
            id="callsign"
            type="text"
            className={`mono ${styles.input}`}
            value={callsign}
            onChange={(e) => setCallsign(e.target.value.toUpperCase())}
            placeholder="NIGHTOWL"
            maxLength={20}
            pattern="[A-Z0-9\-]{3,20}"
            required
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className={styles.field}>
          <label className={`display ${styles.label}`} htmlFor="github">
            GitHub URL <span className={styles.optional}>(optional)</span>
          </label>
          <input
            id="github"
            type="url"
            className={`mono ${styles.input}`}
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/handle"
            autoComplete="off"
          />
        </div>
        <div className={styles.field}>
          <label className={`display ${styles.label}`} htmlFor="x-url">
            X URL <span className={styles.optional}>(optional)</span>
          </label>
          <input
            id="x-url"
            type="url"
            className={`mono ${styles.input}`}
            value={xUrl}
            onChange={(e) => setXUrl(e.target.value)}
            placeholder="https://x.com/handle"
            autoComplete="off"
          />
        </div>
      </div>

      <div className={styles.actionRow}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={status === "loading" || !callsign.trim()}
        >
          {status === "loading" ? "Locking…" : "Claim Callsign →"}
        </button>
        <a
          href="https://cursor.com/origin?ref=CyberTrack"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.originLink}
        >
          Cursor Origin · Coming Soon
        </a>
      </div>

      {message && (
        <div
          className={`mono ${styles.statusMsg}`}
          style={{ color: status === "error" ? "var(--alert)" : "var(--signal)" }}
        >
          {status !== "error" && <span>✓ </span>}
          {message}
        </div>
      )}
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";

/** Live UTC clock readout — the ops-room standard. */
export default function ZuluClock({ className }: { className?: string }) {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    function tick() {
      const d = new Date();
      const hh = String(d.getUTCHours()).padStart(2, "0");
      const mm = String(d.getUTCMinutes()).padStart(2, "0");
      const ss = String(d.getUTCSeconds()).padStart(2, "0");
      setNow(`${hh}:${mm}:${ss}Z`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={`mono ${className ?? ""}`} suppressHydrationWarning>
      {now ?? "--:--:--Z"}
    </span>
  );
}

"""Consented exercise telemetry.

Scope is strictly the mission workspace:
- mission start/stop timestamps,
- prompts/responses sent through `cybertf ask`,
- submitted answers and scoring results.

Never captured: keystrokes, mouse activity, browser history, files outside
the workspace, secrets, or credentials. The log is a plain JSONL file inside
the run directory that the operator can open and read at any time.
See docs/TELEMETRY.md.
"""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def log_event(run_dir: Path, event_type: str, payload: dict) -> None:
    record = {"ts": now_iso(), "type": event_type, **payload}
    path = run_dir / "telemetry.jsonl"
    with path.open("a") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


def read_events(run_dir: Path) -> list[dict]:
    path = run_dir / "telemetry.jsonl"
    if not path.is_file():
        return []
    events = []
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            events.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return events


def digest(run_dir: Path) -> str | None:
    """Tamper-evidence digest of the telemetry log."""
    path = run_dir / "telemetry.jsonl"
    if not path.is_file():
        return None
    return "sha256:" + hashlib.sha256(path.read_bytes()).hexdigest()


def ask_count(run_dir: Path) -> int:
    return sum(1 for e in read_events(run_dir) if e.get("type") == "ask")

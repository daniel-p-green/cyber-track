"""Web arena client: publish scored runs to the leaderboard.

Mission play is fully offline. Publishing to the arena is the only network
step, and it is optional — the local season scorecard covers the same data.
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from pathlib import Path

DEFAULT_ARENA = "http://localhost:3000"


def arena_url() -> str:
    return os.environ.get("CYBERTF_ARENA_URL", DEFAULT_ARENA).rstrip("/")


def _post(path: str, payload: dict) -> tuple[int, dict]:
    req = urllib.request.Request(
        f"{arena_url()}{path}",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        try:
            body = json.loads(e.read().decode())
        except Exception:
            body = {"error": str(e)}
        return e.code, body
    except (urllib.error.URLError, OSError) as e:
        raise ConnectionError(
            f"Arena unreachable at {arena_url()} ({e}). Mission scoring still "
            "works offline. See runs/season-zero-scorecard.md."
        ) from e


def register_operator(callsign: str, github_url: str = "") -> dict:
    payload = {"callsign": callsign}
    if github_url:
        payload["github_url"] = github_url
    status, body = _post("/api/operators", payload)
    if status >= 400:
        raise RuntimeError(f"Arena rejected operator ({status}): {body}")
    return body


def publish_run(run_dir: Path) -> dict:
    score_file = run_dir / "score.json"
    if not score_file.is_file():
        raise FileNotFoundError(
            f"No score.json in {run_dir}. Score the run first with `cybertf submit`."
        )
    score = json.loads(score_file.read_text())
    artifact = {
        "schema": "cybertrack.submission.v1",
        **{
            k: score[k]
            for k in (
                "run_id",
                "mission_id",
                "season",
                "callsign",
                "total",
                "max_total",
                "elapsed_seconds",
                "submitted_at",
                "dimensions",
                "flags",
                "local_model",
                "xp_awarded",
            )
            if k in score
        },
        "telemetry_digest": score.get("telemetry_digest"),
        "ask_count": score.get("ask_count", 0),
    }
    status, body = _post("/api/submissions", artifact)
    if status == 409:
        raise RuntimeError(f"Arena already has run {score['run_id']} (duplicate).")
    if status >= 400:
        raise RuntimeError(f"Arena rejected submission ({status}): {body}")
    return body

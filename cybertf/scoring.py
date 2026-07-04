"""Deterministic mission scoring.

Every check is reproducible from the run artifacts alone — no model in the
loop. Expected answers are stored as salted SHA-256 hashes of normalized
strings so the public repo contains no plaintext answer keys. This is the
clearly-labeled demo validation tier; production seasons move expected
values fully server-side (see docs/ROADMAP.md).
"""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

from . import telemetry
from .missions import Mission

DIMENSIONS = [
    "mission_completion",
    "evidence_discipline",
    "tool_reliability",
    "prompt_discipline",
    "recovery_from_bad_ai_guidance",
    "terminal_recovery",
    "hallucination_resistance",
    "time_to_signal",
    "communication_quality",
    "local_offline_compliance",
]

HASH_PREFIX = "cybertrack"


def normalize(value: str, mode: str = "loose") -> str:
    text = str(value).strip().lower()
    if mode == "exact":
        return text
    # loose: underscores count as spaces, collapse whitespace,
    # drop punctuation except word-internal chars (paths, times, decimals),
    # and trim stray punctuation at the edges ("false." == "false")
    text = text.replace("_", " ")
    text = re.sub(r"[^\w\s./:-]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip().strip(".:,;-/").strip()


def answer_hash(mission_id: str, check_id: str, value: str, mode: str = "loose") -> str:
    normalized = normalize(value, mode)
    raw = f"{HASH_PREFIX}:{mission_id}:{check_id}:{normalized}"
    return hashlib.sha256(raw.encode()).hexdigest()


def _get_field(answer: dict, dotted: str):
    cur = answer
    for part in dotted.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return None
        cur = cur[part]
    return cur


def _eval_check(check: dict, mission: Mission, answer: dict, run_dir: Path) -> bool:
    ctype = check["type"]
    field_val = _get_field(answer, check.get("field", "")) if check.get("field") else None

    if ctype == "hash_match":
        if field_val is None:
            return False
        mode = check.get("normalize", "loose")
        return answer_hash(mission.id, check["id"], str(field_val), mode) == check["sha256"]

    if ctype == "hash_match_any":
        if field_val is None:
            return False
        mode = check.get("normalize", "loose")
        h = answer_hash(mission.id, check["id"], str(field_val), mode)
        return h in check["sha256_any"]

    if ctype == "field_equals":
        return field_val == check["value"]

    if ctype == "field_regex":
        if field_val is None:
            return False
        return re.search(check["pattern"], str(field_val), re.IGNORECASE | re.DOTALL) is not None

    if ctype == "field_min_length":
        return field_val is not None and len(str(field_val).strip()) >= int(check["min_length"])

    if ctype == "evidence_includes":
        evidence = answer.get("evidence", [])
        if not isinstance(evidence, list):
            return False
        needle = check["path"].lower()
        return any(needle in str(e).lower() for e in evidence)

    if ctype == "file_contains":
        target = mission.data_dir / check["file"]
        if not target.is_file():
            return False
        hay = target.read_text(errors="replace")
        if check.get("regex"):
            return re.search(check["regex"], hay, re.MULTILINE) is not None
        return check["text"] in hay

    if ctype == "file_excludes":
        target = mission.data_dir / check["file"]
        if not target.is_file():
            return True
        hay = target.read_text(errors="replace")
        if check.get("regex"):
            return re.search(check["regex"], hay, re.MULTILINE) is None
        return check["text"] not in hay

    if ctype == "tests_pass":
        test_file = mission.data_dir / check["test_file"]
        if not test_file.is_file():
            return False
        proc = subprocess.run(
            [sys.executable, "-m", "unittest", "-q", test_file.stem],
            cwd=str(test_file.parent),
            capture_output=True,
            text=True,
            timeout=120,
        )
        return proc.returncode == 0

    if ctype == "ask_used":
        return telemetry.ask_count(run_dir) >= int(check.get("min_asks", 1))

    raise ValueError(f"Unknown check type: {ctype}")


def _time_points(mission: Mission, elapsed: int, suspicious: bool) -> tuple[int, int]:
    """Speed reward: full points at/under par, linear decay to 0 at timebox."""
    max_pts = int(mission.time_points)
    if max_pts <= 0:
        return 0, 0
    if suspicious:
        return 0, max_pts
    par = mission.par_seconds or int(mission.expected_seconds.get("min", 60)) * 2
    limit = mission.timebox_minutes * 60
    if elapsed <= par:
        return max_pts, max_pts
    if elapsed >= limit:
        return 0, max_pts
    frac = 1 - (elapsed - par) / max(1, limit - par)
    return round(max_pts * frac), max_pts


def score_run(mission: Mission, run_dir: Path, run: dict) -> dict:
    answer_path = run_dir / "answer.json"
    answer = json.loads(answer_path.read_text()) if answer_path.is_file() else {}

    elapsed = int(run.get("elapsed_seconds", 0))
    expected_min = int(mission.expected_seconds.get("min", 0))
    suspicious_fast = elapsed < expected_min

    dims: dict[str, dict] = {d: {"points": 0, "max": 0} for d in DIMENSIONS}
    check_results = []
    total = 0
    for check in mission.checks:
        pts = int(check.get("points", 0))
        dim = check.get("dimension", "mission_completion")
        dims.setdefault(dim, {"points": 0, "max": 0})
        dims[dim]["max"] += pts
        try:
            passed = _eval_check(check, mission, answer, run_dir)
        except Exception:
            passed = False
        earned = pts if passed else 0
        dims[dim]["points"] += earned
        total += earned
        check_results.append(
            {
                "id": check["id"],
                "label": check.get("label", check["id"]),
                "passed": passed,
                "points": earned,
                "max": pts,
                "dimension": dim,
            }
        )

    # Speed dimension.
    tpts, tmax = _time_points(mission, elapsed, suspicious_fast)
    dims["time_to_signal"]["points"] += tpts
    dims["time_to_signal"]["max"] += tmax
    total += tpts

    # Local/offline compliance: real local model, not simulation.
    model = run.get("local_model", {})
    compliance_max = 5
    compliant = not model.get("simulated", False) and model.get("provider") in (
        "ollama",
        "openai-compatible-local",
    )
    cpts = compliance_max if compliant else 0
    dims["local_offline_compliance"]["points"] += cpts
    dims["local_offline_compliance"]["max"] += compliance_max
    total += cpts

    max_total = mission.max_check_points() + tmax + compliance_max
    tel_digest = telemetry.digest(run_dir)

    difficulty_multiplier = 1 + (mission.difficulty - 1) * 0.25
    xp = 0
    if max_total > 0 and not suspicious_fast:
        xp = round(total / max_total * mission.xp_base * difficulty_multiplier)

    score = {
        "schema": "cybertrack.score.v1",
        "run_id": run["run_id"],
        "mission_id": mission.id,
        "season": mission.season,
        "callsign": run["callsign"],
        "submitted_at": run.get("submitted_at"),
        "elapsed_seconds": elapsed,
        "total": total,
        "max_total": max_total,
        "dimensions": dims,
        "checks": check_results,
        "flags": {
            "suspicious_fast": suspicious_fast,
            "missing_telemetry": tel_digest is None,
        },
        "local_model": model,
        "telemetry_digest": tel_digest,
        "ask_count": telemetry.ask_count(run_dir),
        "xp_awarded": xp,
    }
    (run_dir / "score.json").write_text(json.dumps(score, indent=2) + "\n")
    if run.get("telemetry_enabled", False):
        telemetry.log_event(
            run_dir,
            "score",
            {"total": total, "max_total": max_total, "xp_awarded": xp},
        )
    return score

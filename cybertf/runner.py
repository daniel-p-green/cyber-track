"""Run lifecycle: start missions, track the active run, submit answers."""

from __future__ import annotations

import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

from . import gemma, telemetry
from .missions import Mission, load_mission
from .paths import runs_dir, state_dir
from .profile import load_profile

ACTIVE_RUN_FILE = "active_run"


def _active_run_path() -> Path:
    return state_dir() / ACTIVE_RUN_FILE


def new_run_id(callsign: str) -> str:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    return f"{stamp}-{callsign.lower()}"


def start_run(mission: Mission, no_telemetry: bool = False) -> Path:
    profile = load_profile()
    if profile is None:
        raise RuntimeError("No operator profile. Run `cybertf enlist <CALLSIGN>` first.")
    callsign = profile["callsign"]
    telemetry_on = profile.get("telemetry_opt_in", True) and not no_telemetry

    run_id = new_run_id(callsign)
    run_dir = runs_dir() / run_id
    run_dir.mkdir(parents=True)

    try:
        model = gemma.model_info()
    except gemma.GemmaUnavailable:
        model = {"provider": "none", "model": "unavailable", "simulated": False}

    run = {
        "run_id": run_id,
        "mission_id": mission.id,
        "season": mission.season,
        "callsign": callsign,
        "started_at": telemetry.now_iso(),
        "status": "active",
        "telemetry_enabled": telemetry_on,
        "local_model": model,
    }
    (run_dir / "run.json").write_text(json.dumps(run, indent=2) + "\n")

    # Copy the answer template so the operator edits inside the run dir.
    if mission.answer_template_path.is_file():
        shutil.copy(mission.answer_template_path, run_dir / "answer.json")

    if telemetry_on:
        telemetry.log_event(
            run_dir,
            "mission_start",
            {"mission_id": mission.id, "callsign": callsign, "model": model},
        )

    _active_run_path().write_text(run_id + "\n")
    return run_dir


def load_run(run_id: str) -> tuple[Path, dict]:
    run_dir = runs_dir() / run_id
    meta = run_dir / "run.json"
    if not meta.is_file():
        raise FileNotFoundError(f"Run '{run_id}' not found under runs/.")
    return run_dir, json.loads(meta.read_text())


def active_run() -> tuple[Path, dict] | None:
    p = _active_run_path()
    if not p.is_file():
        return None
    run_id = p.read_text().strip()
    if not run_id:
        return None
    try:
        return load_run(run_id)
    except FileNotFoundError:
        return None


def elapsed_seconds(run: dict, end_iso: str) -> int:
    start = datetime.strptime(run["started_at"], "%Y-%m-%dT%H:%M:%SZ")
    end = datetime.strptime(end_iso, "%Y-%m-%dT%H:%M:%SZ")
    return max(0, int((end - start).total_seconds()))


def record_ask(prompt: str, context_files: list[str], answer: dict) -> None:
    ar = active_run()
    if ar is None:
        return
    run_dir, run = ar
    if not run.get("telemetry_enabled", False):
        return
    telemetry.log_event(
        run_dir,
        "ask",
        {
            "prompt": prompt,
            "context_files": context_files,
            "response": answer.get("response", ""),
            "model": answer.get("model"),
            "provider": answer.get("provider"),
            "latency_ms": answer.get("latency_ms"),
            "simulated": answer.get("simulated", False),
        },
    )


def submit_answer(mission: Mission, answer_file: Path) -> tuple[Path, dict]:
    """Attach an answer to the active (or latest) run for this mission."""
    ar = active_run()
    run_dir = None
    run = None
    if ar is not None and ar[1]["mission_id"] == mission.id and ar[1]["status"] == "active":
        run_dir, run = ar
    else:
        # Latest active run for this mission.
        candidates = sorted(runs_dir().glob("*/run.json"), reverse=True)
        for meta in candidates:
            data = json.loads(meta.read_text())
            if data["mission_id"] == mission.id and data["status"] == "active":
                run_dir, run = meta.parent, data
                break
    if run_dir is None or run is None:
        raise RuntimeError(
            f"No active run for mission '{mission.id}'. Start one with "
            f"`cybertf run {mission.id}`."
        )

    answer = json.loads(Path(answer_file).read_text())
    (run_dir / "answer.json").write_text(json.dumps(answer, indent=2) + "\n")

    run["submitted_at"] = telemetry.now_iso()
    run["elapsed_seconds"] = elapsed_seconds(run, run["submitted_at"])
    run["status"] = "submitted"
    (run_dir / "run.json").write_text(json.dumps(run, indent=2) + "\n")

    if run.get("telemetry_enabled", False):
        telemetry.log_event(
            run_dir,
            "submission",
            {"mission_id": mission.id, "elapsed_seconds": run["elapsed_seconds"]},
        )
    return run_dir, run

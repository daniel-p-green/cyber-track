"""Local operator profile: a lightweight callsign identity.

Stored at .cybertrack/profile.json inside the workspace (gitignored).
No accounts, no passwords, no email. The web arena keeps its own
anonymous record keyed by callsign.
"""

from __future__ import annotations

import json
import re

from . import rank_for_xp
from .paths import state_dir
from .telemetry import now_iso

CALLSIGN_RE = re.compile(r"^[A-Z0-9-]{3,20}$")


def profile_path():
    return state_dir() / "profile.json"


def load_profile() -> dict | None:
    p = profile_path()
    if not p.is_file():
        return None
    return json.loads(p.read_text())


def save_profile(profile: dict) -> None:
    profile_path().write_text(json.dumps(profile, indent=2) + "\n")


def enlist(callsign: str, github_url: str = "", telemetry_opt_in: bool = True) -> dict:
    callsign = callsign.strip().upper()
    if not CALLSIGN_RE.match(callsign):
        raise ValueError(
            "Callsign must be 3-20 characters using A-Z, 0-9, and hyphens. "
            "Example: NIGHTOWL or VECTOR-6."
        )
    existing = load_profile() or {}
    profile = {
        "callsign": callsign,
        "github_url": github_url or existing.get("github_url", ""),
        "telemetry_opt_in": telemetry_opt_in,
        "created_at": existing.get("created_at", now_iso()),
        "xp": existing.get("xp", 0),
        "rank": existing.get("rank", "Recruit"),
        "missions_completed": existing.get("missions_completed", []),
    }
    save_profile(profile)
    return profile


def award_xp(xp: int, mission_id: str) -> dict:
    """Apply XP locally and report promotion. Returns updated profile."""
    profile = load_profile()
    if profile is None:
        raise RuntimeError("No profile. Run `cybertf enlist <CALLSIGN>` first.")
    old_rank = profile.get("rank", "Recruit")
    profile["xp"] = int(profile.get("xp", 0)) + int(xp)
    profile["rank"] = rank_for_xp(profile["xp"])
    completed = set(profile.get("missions_completed", []))
    completed.add(mission_id)
    profile["missions_completed"] = sorted(completed)
    profile["promoted"] = profile["rank"] != old_rank
    profile["previous_rank"] = old_rank
    save_profile(profile)
    return profile

"""Workspace path resolution.

Everything cybertf touches lives inside the mission workspace (the repo).
Telemetry, runs, and profile data never leave this directory tree.
"""

from __future__ import annotations

import os
from pathlib import Path


def workspace_root(start: Path | None = None) -> Path:
    """Find the workspace root by walking up until we see challenges/ + cybertf/."""
    env = os.environ.get("CYBERTF_ROOT")
    if env:
        return Path(env).resolve()
    here = (start or Path.cwd()).resolve()
    for candidate in [here, *here.parents]:
        if (candidate / "challenges").is_dir() and (candidate / "cybertf").is_dir():
            return candidate
    # Fall back to the package's parent (repo checkout layout).
    return Path(__file__).resolve().parent.parent


def challenges_dir() -> Path:
    return workspace_root() / "challenges"


def runs_dir() -> Path:
    d = workspace_root() / "runs"
    d.mkdir(exist_ok=True)
    return d


def state_dir() -> Path:
    """Local operator state (profile, active run pointer). Gitignored."""
    d = workspace_root() / ".cybertrack"
    d.mkdir(exist_ok=True)
    return d

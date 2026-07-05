"""Mission loading and validation."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

from .paths import challenges_dir

EVENT_TYPES = ("qualification", "sprint", "field", "relay", "marathon")


@dataclass
class Mission:
    id: str
    title: str
    event_type: str
    difficulty: int
    timebox_minutes: int
    expected_seconds: dict
    xp_base: int
    summary: str
    skills: list
    answer_fields: list
    checks: list
    season: str = "season-one"
    par_seconds: int | None = None
    time_points: int = 5
    path: Path = field(default_factory=Path)

    @property
    def brief_path(self) -> Path:
        return self.path / "brief.md"

    @property
    def data_dir(self) -> Path:
        return self.path / "data"

    @property
    def answer_template_path(self) -> Path:
        return self.path / "answer.example.json"

    def max_check_points(self) -> int:
        return sum(int(c.get("points", 0)) for c in self.checks)


def load_mission(mission_id: str) -> Mission:
    mdir = challenges_dir() / mission_id
    spec = mdir / "mission.json"
    if not spec.is_file():
        raise FileNotFoundError(
            f"Mission '{mission_id}' not found. Run `cybertf list` to see missions."
        )
    raw = json.loads(spec.read_text())
    if raw.get("event_type") not in EVENT_TYPES:
        raise ValueError(f"Mission {mission_id}: bad event_type {raw.get('event_type')!r}")
    known = {f.name for f in Mission.__dataclass_fields__.values()}  # type: ignore[attr-defined]
    kwargs = {k: v for k, v in raw.items() if k in known}
    return Mission(path=mdir, **kwargs)


def list_missions() -> list[Mission]:
    out = []
    root = challenges_dir()
    if not root.is_dir():
        return out
    for spec in sorted(root.glob("*/mission.json")):
        try:
            out.append(load_mission(spec.parent.name))
        except (ValueError, KeyError, json.JSONDecodeError):
            continue
    order = {t: i for i, t in enumerate(EVENT_TYPES)}
    out.sort(key=lambda m: (order.get(m.event_type, 99), m.difficulty, m.id))
    return out

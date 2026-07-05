"""Local season scorecard: aggregates run artifacts into a Markdown leaderboard.

This is the offline twin of the web arena leaderboard — it keeps the demo
resilient even with no network at all.
"""

from __future__ import annotations

import json
from pathlib import Path

from . import SEASON_ID, rank_for_xp
from .paths import runs_dir


def collect_scores() -> list[dict]:
    scores = []
    for score_file in sorted(runs_dir().glob("*/score.json")):
        try:
            scores.append(json.loads(score_file.read_text()))
        except json.JSONDecodeError:
            continue
    return scores


def _fmt_time(seconds: int) -> str:
    return f"{seconds // 60}:{seconds % 60:02d}"


def generate_scorecard() -> Path:
    scores = collect_scores()
    lines: list[str] = []
    lines.append("# Season Zero Local Scorecard")
    lines.append("")
    lines.append(
        "Generated from local run artifacts in `runs/`. This is the offline "
        "leaderboard; the web arena mirrors the same submissions when online."
    )
    lines.append("")

    if not scores:
        lines.append("No scored runs yet. Start with `cybertf run basic_qualification`.")
    else:
        # Operator standings.
        by_operator: dict[str, dict] = {}
        for s in scores:
            op = by_operator.setdefault(
                s["callsign"], {"xp": 0, "runs": 0, "missions": set(), "flagged": 0}
            )
            op["xp"] += s.get("xp_awarded", 0)
            op["runs"] += 1
            op["missions"].add(s["mission_id"])
            if s.get("flags", {}).get("suspicious_fast"):
                op["flagged"] += 1

        lines.append("## Operator Standings")
        lines.append("")
        lines.append("| # | Callsign | Rank | XP | Missions | Runs | Flags |")
        lines.append("|---|---|---|---|---|---|---|")
        standing = sorted(by_operator.items(), key=lambda kv: -kv[1]["xp"])
        for i, (callsign, op) in enumerate(standing, 1):
            flag = f"⚠ {op['flagged']}" if op["flagged"] else "—"
            lines.append(
                f"| {i} | `{callsign}` | {rank_for_xp(op['xp'])} | {op['xp']} "
                f"| {len(op['missions'])} | {op['runs']} | {flag} |"
            )
        lines.append("")

        # Per-mission best runs.
        lines.append("## Mission Results")
        lines.append("")
        lines.append("| Mission | Callsign | Score | Time | Status |")
        lines.append("|---|---|---|---|---|")
        ordered = sorted(
            scores,
            key=lambda s: (s["mission_id"], -s["total"], s["elapsed_seconds"]),
        )
        for s in ordered:
            status = (
                "**UNVERIFIED · SUSPICIOUS TIME**"
                if s.get("flags", {}).get("suspicious_fast")
                else "verified"
            )
            lines.append(
                f"| {s['mission_id']} | `{s['callsign']}` | {s['total']}/{s['max_total']} "
                f"| {_fmt_time(s['elapsed_seconds'])} | {status} |"
            )
        lines.append("")

    lines.append("---")
    lines.append(
        "*Scores are training/readiness feedback for synthetic exercises, "
        "never job-suitability signals.*"
    )
    lines.append("")

    out = runs_dir() / f"{SEASON_ID}-scorecard.md"
    out.write_text("\n".join(lines))
    return out

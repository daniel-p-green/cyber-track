"""cybertf — the CyberTrack mission CLI.

This is the cockpit surface operators use inside Cursor. Everything except
`publish` works fully offline with a local Gemma4 model.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from . import __version__, audio, gemma
from .arena import arena_url, publish_run, register_operator
from .missions import list_missions, load_mission
from .profile import award_xp, enlist, load_profile
from .report import generate_aar
from .runner import active_run, load_run, start_run, submit_answer, record_ask
from .scoring import score_run
from .season import generate_scorecard

# --- terminal styling ------------------------------------------------------

GREEN = "\033[92m"
AMBER = "\033[93m"
RED = "\033[91m"
CYAN = "\033[96m"
DIM = "\033[2m"
BOLD = "\033[1m"
RESET = "\033[0m"


def _c(color: str, text: str) -> str:
    if not sys.stdout.isatty():
        return text
    return f"{color}{text}{RESET}"


def banner(text: str) -> None:
    print(_c(CYAN, f"\n▮▮ {text.upper()}"))


def ok(text: str) -> None:
    print(_c(GREEN, f"  ✓ {text}"))


def warn(text: str) -> None:
    print(_c(AMBER, f"  ⚠ {text}"))


def fail(text: str) -> None:
    print(_c(RED, f"  ✗ {text}"))


def _fmt_time(seconds: int) -> str:
    return f"{seconds // 60}:{seconds % 60:02d}"


# --- commands ---------------------------------------------------------------


def cmd_enlist(args) -> int:
    telemetry_opt_in = not args.no_telemetry
    profile = enlist(args.callsign, args.github or "", telemetry_opt_in)
    banner(f"operator enlisted: {profile['callsign']}")
    ok(f"Local profile saved to .cybertrack/profile.json")
    ok(f"Rank: {profile['rank']} · XP: {profile['xp']}")
    if telemetry_opt_in:
        print(
            _c(
                DIM,
                "  Telemetry consent: ON. Mission timestamps, cybertf ask "
                "prompts/responses,\n  submissions, and scores are logged to the "
                "run folder inside this workspace\n  only. Nothing outside the "
                "workspace is ever captured. See docs/TELEMETRY.md.\n  Disable "
                "any time with: cybertf enlist "
                f"{profile['callsign']} --no-telemetry",
            )
        )
    else:
        warn("Telemetry OFF. Decision-trace checks will be skipped in scoring.")
    if args.register:
        try:
            body = register_operator(profile["callsign"], profile.get("github_url", ""))
            ok(f"Registered with arena at {arena_url()}")
        except (ConnectionError, RuntimeError) as e:
            warn(str(e))
    return 0


def cmd_list(args) -> int:
    missions = list_missions()
    banner("season zero mission board")
    if not missions:
        warn("No missions found in challenges/.")
        return 1
    for m in missions:
        pips = "▮" * m.difficulty + "▯" * (5 - m.difficulty)
        print(
            f"  {_c(BOLD, m.id):42s} {m.event_type.upper():13s} "
            f"{pips}  {m.timebox_minutes:>2}min  {m.xp_base} XP"
        )
        print(_c(DIM, f"    {m.summary}"))
    print(_c(DIM, f"\n  Start one with: cybertf run <mission_id>"))
    return 0


def cmd_brief(args) -> int:
    m = load_mission(args.mission_id)
    banner(f"mission brief: {m.title}")
    text = m.brief_path.read_text() if m.brief_path.is_file() else m.summary
    print(text)
    if args.audio or args.voice is not None:
        script = audio.briefing_script(
            m.id, fallback=f"Mission briefing. {m.title}. {m.summary}"
        )
        spoken = audio.speak(script, voice=args.voice or "offline")
        if spoken == "none":
            warn("No audio path available on this machine.")
        else:
            ok(f"Briefing audio playing ({spoken} TTS).")
    return 0


def cmd_run(args) -> int:
    m = load_mission(args.mission_id)
    run_dir = start_run(m, no_telemetry=args.no_telemetry)
    banner(f"mission start: {m.title}")
    ok(f"Run directory: {run_dir.relative_to(Path.cwd()) if run_dir.is_relative_to(Path.cwd()) else run_dir}")
    ok(f"Timer started. Timebox: {m.timebox_minutes} minutes.")
    print(_c(DIM, f"\n  Brief:    cybertf brief {m.id}"))
    print(_c(DIM, f"  Evidence: challenges/{m.id}/data/"))
    print(_c(DIM, f"  Field AI: cybertf ask \"your question\" [--file <evidence-file>]"))
    print(_c(DIM, f"  Answers:  edit {run_dir.name}/answer.json, then"))
    print(_c(DIM, f"  Submit:   cybertf submit {m.id} runs/{run_dir.name}/answer.json"))
    if args.audio:
        audio.speak(f"Mission start. {m.title}. Timer running.", voice=args.voice)
    return 0


def cmd_ask(args) -> int:
    context_parts = []
    context_files = []
    for fp in args.file or []:
        p = Path(fp)
        if not p.is_file():
            fail(f"Context file not found: {fp}")
            return 1
        context_files.append(fp)
        context_parts.append(f"### {fp}\n{p.read_text(errors='replace')[:8000]}")
    ar = active_run()
    if ar is not None:
        run_dir, run = ar
        m = load_mission(run["mission_id"])
        if m.brief_path.is_file():
            context_parts.insert(0, f"### mission brief\n{m.brief_path.read_text()[:4000]}")
    try:
        out = gemma.ask(args.question, context="\n\n".join(context_parts))
    except gemma.GemmaUnavailable as e:
        fail(str(e))
        return 1
    record_ask(args.question, context_files, out)
    tag = "SIMULATION" if out["simulated"] else f"{out['model']} · local · {out['latency_ms']}ms"
    banner(f"field ai: {tag}")
    print(out["response"].strip())
    if not out["simulated"]:
        print(_c(DIM, "\n  Verify before you trust: the field AI only knows what you show it."))
    return 0


def cmd_submit(args) -> int:
    m = load_mission(args.mission_id)
    answer_file = Path(args.answer_file)
    if not answer_file.is_file():
        fail(f"Answer file not found: {answer_file}")
        return 1
    run_dir, run = submit_answer(m, answer_file)
    score = score_run(m, run_dir, run)
    banner(f"submission scored: {m.title}")
    pct = round(score["total"] / score["max_total"] * 100) if score["max_total"] else 0
    ok(f"Score: {score['total']}/{score['max_total']} ({pct}%)")
    ok(f"Elapsed: {_fmt_time(score['elapsed_seconds'])}")
    for c in score["checks"]:
        (ok if c["passed"] else fail)(f"{c['label']} ({c['points']}/{c['max']})")
    if score["flags"]["suspicious_fast"]:
        warn("Suspicious completion time. Run flagged UNVERIFIED, no XP awarded.")
    if score["xp_awarded"]:
        profile = award_xp(score["xp_awarded"], m.id)
        ok(f"+{score['xp_awarded']} XP → {profile['xp']} total")
        if profile.get("promoted"):
            banner(f"promotion confirmed: {profile['rank'].upper()}")
            audio.play_cue("promotion")
        else:
            audio.play_cue("complete")
    aar = generate_aar(m, run_dir, narrate=not args.no_narrate)
    ok(f"After-action report: {aar}")
    print(_c(DIM, f"\n  Publish to arena: cybertf publish {run['run_id']}"))
    return 0


def cmd_score(args) -> int:
    run_dir, run = load_run(args.run_id)
    m = load_mission(run["mission_id"])
    score = score_run(m, run_dir, run)
    print(json.dumps(score, indent=2))
    return 0


def cmd_report(args) -> int:
    run_dir, run = load_run(args.run_id)
    m = load_mission(run["mission_id"])
    if not (run_dir / "score.json").is_file():
        score_run(m, run_dir, run)
    aar = generate_aar(m, run_dir, narrate=not args.no_narrate)
    print(aar.read_text())
    return 0


def cmd_publish(args) -> int:
    run_dir, run = load_run(args.run_id)
    try:
        body = publish_run(run_dir)
    except (ConnectionError, RuntimeError, FileNotFoundError) as e:
        fail(str(e))
        return 1
    banner("arena submission accepted")
    op = body.get("operator", {})
    ok(f"Operator: {op.get('callsign')} · {op.get('rank')} · {op.get('xp')} XP (arena)")
    if body.get("promoted"):
        banner(f"promotion confirmed: {body.get('new_rank', '').upper()}")
        audio.play_cue("promotion")
    pos = body.get("leaderboard_position")
    if pos:
        ok(f"Leaderboard position: #{pos}")
    flags = body.get("flags", {})
    if flags.get("suspicious_fast"):
        warn("Arena flagged this run: UNVERIFIED · SUSPICIOUS TIME.")
    ok(f"View: {arena_url()}/leaderboard")
    return 0


def cmd_season(args) -> int:
    out = generate_scorecard()
    print(out.read_text())
    ok(f"Scorecard written to {out}")
    return 0


def cmd_verify_model(args) -> int:
    banner("local model verification")
    try:
        result = gemma.verify()
    except gemma.GemmaUnavailable as e:
        fail(str(e))
        return 1
    if result.get("simulated"):
        warn(result["note"])
        return 0
    ok(f"Endpoint: {result['endpoint']} (local: {result['endpoint_is_local']})")
    for m in result["detected_gemma_models"]:
        ok(f"Detected: {m['name']} ({m.get('parameter_size')}, {m.get('quantization')})")
    ok(f"Selected model: {result['selected_model']}")
    ok(f"Canary response: {result['canary_response']!r}")
    ok(f"Round-trip latency: {result['latency_ms']}ms")
    print(_c(GREEN, "\n  ● GEMMA4 · LOCAL · OFFLINE. Field AI ready."))
    return 0


def cmd_status(args) -> int:
    banner("operator status")
    profile = load_profile()
    if profile is None:
        warn("Not enlisted. Run: cybertf enlist <CALLSIGN>")
    else:
        ok(f"Callsign: {profile['callsign']} · {profile['rank']} · {profile['xp']} XP")
        ok(f"Missions completed: {len(profile.get('missions_completed', []))}")
    ar = active_run()
    if ar:
        _, run = ar
        if run["status"] == "active":
            ok(f"Active run: {run['run_id']} ({run['mission_id']})")
        else:
            ok(f"Last run: {run['run_id']} ({run['status']})")
    else:
        print(_c(DIM, "  No active run."))
    return 0


# --- parser -----------------------------------------------------------------


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="cybertf",
        description=(
            "CyberTrack mission league: offline AI operator readiness in "
            "Cursor, powered by local Gemma4."
        ),
    )
    p.add_argument("--version", action="version", version=f"cybertf {__version__}")
    sub = p.add_subparsers(dest="command", required=True)

    s = sub.add_parser("enlist", help="Create/update your operator callsign profile")
    s.add_argument("callsign")
    s.add_argument("--github", help="Optional GitHub profile URL")
    s.add_argument("--no-telemetry", action="store_true", help="Opt out of exercise telemetry")
    s.add_argument("--register", action="store_true", help="Also register with the web arena")
    s.set_defaults(func=cmd_enlist)

    s = sub.add_parser("list", help="Show the Season Zero mission board")
    s.set_defaults(func=cmd_list)

    s = sub.add_parser("brief", help="Print a mission brief")
    s.add_argument("mission_id")
    s.add_argument("--audio", action="store_true", help="Read the briefing aloud (offline TTS)")
    s.add_argument(
        "--voice",
        nargs="?",
        const="offline",
        default=None,
        choices=["offline", "elevenlabs"],
        help="Play the mission voice briefing (default: offline macOS say)",
    )
    s.set_defaults(func=cmd_brief)

    s = sub.add_parser("run", help="Start a mission (starts the timer)")
    s.add_argument("mission_id")
    s.add_argument("--no-telemetry", action="store_true")
    s.add_argument("--audio", action="store_true")
    s.add_argument("--voice", default="offline", choices=["offline", "elevenlabs"])
    s.set_defaults(func=cmd_run)

    s = sub.add_parser("ask", help="Ask the local Gemma4 field AI")
    s.add_argument("question")
    s.add_argument("--file", action="append", help="Evidence file(s) to include as context")
    s.set_defaults(func=cmd_ask)

    s = sub.add_parser("submit", help="Submit answers; scores the run and writes the AAR")
    s.add_argument("mission_id")
    s.add_argument("answer_file")
    s.add_argument("--no-narrate", action="store_true", help="Skip the Gemma AAR debrief")
    s.set_defaults(func=cmd_submit)

    s = sub.add_parser("score", help="Re-score a run (prints score.json)")
    s.add_argument("run_id")
    s.set_defaults(func=cmd_score)

    s = sub.add_parser("report", help="Generate/print the after-action report")
    s.add_argument("run_id")
    s.add_argument("--no-narrate", action="store_true")
    s.set_defaults(func=cmd_report)

    s = sub.add_parser("publish", help="Publish a scored run to the web arena")
    s.add_argument("run_id")
    s.set_defaults(func=cmd_publish)

    s = sub.add_parser("season", help="Generate the local season scorecard")
    s.set_defaults(func=cmd_season)

    s = sub.add_parser("verify-model", help="Prove the local Gemma4 path works")
    s.set_defaults(func=cmd_verify_model)

    s = sub.add_parser("status", help="Show operator + active run status")
    s.set_defaults(func=cmd_status)

    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        return args.func(args)
    except (FileNotFoundError, RuntimeError, ValueError) as e:
        fail(str(e))
        return 1


if __name__ == "__main__":
    sys.exit(main())

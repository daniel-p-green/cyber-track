#!/usr/bin/env python3
"""Generate voice briefing MP3s for the web arena.

Backends (first match wins):
  1. elevenlabs  — ELEVENLABS_API_KEY in env
  2. piper       — piper binary + PIPER_MODEL_PATH
  3. local-http  — POST text to CYBERTF_TTS_URL, save response body
  4. say         — macOS `say` + ffmpeg → mp3
  5. edge        — edge-tts CLI (dev fallback; needs network)

Usage:
  python3 scripts/generate_briefings.py
  python3 scripts/generate_briefings.py --backend elevenlabs
  python3 scripts/generate_briefings.py --backend piper --id sprint_signal_lost
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
OUT_DIR = REPO / "web" / "public" / "audio" / "briefings"
MISSIONS_TS = REPO / "web" / "lib" / "missions.ts"
BRIEFING_AUDIO_TS = REPO / "web" / "lib" / "briefing-audio.ts"


def load_briefings() -> list[tuple[str, str]]:
    """Parse mission briefings + hero from the web lib TypeScript sources."""
    items: list[tuple[str, str]] = []

    hero_ts = BRIEFING_AUDIO_TS.read_text()
    hero_id = re.search(r'export const HERO_BRIEFING_ID = "([^"]+)"', hero_ts)
    hero_text = re.search(
        r"export const HERO_BRIEFING_TEXT =\s*\n\s*\"([^\"]+)\";", hero_ts, re.DOTALL
    )
    if hero_id and hero_text:
        items.append((hero_id.group(1), hero_text.group(1)))

    missions = MISSIONS_TS.read_text()
    for block in re.finditer(
        r'id:\s*"([^"]+)"[\s\S]*?briefing:\s*\n\s*"((?:\\.|[^"\\])*)"',
        missions,
    ):
        mission_id = block.group(1)
        text = block.group(2).encode().decode("unicode_escape")
        items.append((mission_id, text))

    if not items:
        raise SystemExit("No briefings parsed from web/lib sources")
    return items


def synthesize_elevenlabs(text: str, out: Path) -> bool:
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        return False
    voice = os.environ.get("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")
    payload = json.dumps({"text": text, "model_id": "eleven_multilingual_v2"}).encode()
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice}",
        data=payload,
        headers={"Content-Type": "application/json", "xi-api-key": key},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            out.write_bytes(resp.read())
        return out.stat().st_size > 0
    except Exception as exc:
        print(f"  elevenlabs failed: {exc}", file=sys.stderr)
        return False


def synthesize_piper(text: str, out: Path) -> bool:
    model = os.environ.get("PIPER_MODEL_PATH")
    piper = shutil.which("piper")
    if not model or not piper:
        return False
    wav = out.with_suffix(".wav")
    try:
        subprocess.run(
            [piper, "--model", model, "--output_file", str(wav)],
            input=text.encode(),
            check=True,
            capture_output=True,
        )
        if shutil.which("ffmpeg"):
            subprocess.run(
                ["ffmpeg", "-y", "-i", str(wav), "-codec:a", "libmp3lame", "-qscale:a", "3", str(out)],
                check=True,
                capture_output=True,
            )
            wav.unlink(missing_ok=True)
        else:
            wav.rename(out.with_suffix(".wav"))
            print("  piper: ffmpeg not found; wrote WAV instead of MP3", file=sys.stderr)
            return False
        return out.stat().st_size > 0
    except subprocess.CalledProcessError as exc:
        print(f"  piper failed: {exc.stderr.decode() if exc.stderr else exc}", file=sys.stderr)
        return False


def synthesize_local_http(text: str, out: Path) -> bool:
    base = os.environ.get("CYBERTF_TTS_URL", "").rstrip("/")
    if not base:
        return False
    payload = json.dumps({"text": text}).encode()
    req = urllib.request.Request(
        base,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            out.write_bytes(resp.read())
        return out.stat().st_size > 0
    except Exception as exc:
        print(f"  local TTS failed: {exc}", file=sys.stderr)
        return False


def synthesize_say(text: str, out: Path) -> bool:
    if shutil.which("say") is None:
        return False
    aiff = out.with_suffix(".aiff")
    try:
        subprocess.run(["say", "-r", "185", "-o", str(aiff), text], check=True, capture_output=True)
        if shutil.which("ffmpeg") is None:
            print("  say: ffmpeg required to convert to mp3", file=sys.stderr)
            return False
        subprocess.run(
            ["ffmpeg", "-y", "-i", str(aiff), "-codec:a", "libmp3lame", "-qscale:a", "3", str(out)],
            check=True,
            capture_output=True,
        )
        aiff.unlink(missing_ok=True)
        return out.stat().st_size > 0
    except subprocess.CalledProcessError as exc:
        print(f"  say failed: {exc}", file=sys.stderr)
        return False


def synthesize_edge(text: str, out: Path) -> bool:
    edge = shutil.which("edge-tts")
    if edge is None:
        # common pip --user install path
        candidate = Path.home() / ".local" / "bin" / "edge-tts"
        edge = str(candidate) if candidate.is_file() else None
    if not edge:
        return False
    voice = os.environ.get("EDGE_TTS_VOICE", "en-US-GuyNeural")
    rate = os.environ.get("EDGE_TTS_RATE", "-8%")
    try:
        subprocess.run(
            [edge, "--voice", voice, f"--rate={rate}", "--text", text, "--write-media", str(out)],
            check=True,
            capture_output=True,
        )
        return out.stat().st_size > 0
    except subprocess.CalledProcessError as exc:
        print(f"  edge-tts failed: {exc.stderr.decode() if exc.stderr else exc}", file=sys.stderr)
        return False


BACKENDS = {
    "elevenlabs": synthesize_elevenlabs,
    "piper": synthesize_piper,
    "local-http": synthesize_local_http,
    "say": synthesize_say,
    "edge": synthesize_edge,
}


def pick_backend(requested: str | None) -> str:
    if requested:
        return requested
    if os.environ.get("ELEVENLABS_API_KEY"):
        return "elevenlabs"
    if os.environ.get("PIPER_MODEL_PATH") and shutil.which("piper"):
        return "piper"
    if os.environ.get("CYBERTF_TTS_URL"):
        return "local-http"
    if shutil.which("say"):
        return "say"
    return "edge"


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate web arena voice briefing MP3s")
    parser.add_argument("--backend", choices=list(BACKENDS.keys()), help="TTS backend to use")
    parser.add_argument("--id", help="Generate a single briefing id only")
    parser.add_argument("--force", action="store_true", help="Overwrite existing files")
    args = parser.parse_args()

    backend_name = pick_backend(args.backend)
    synthesize = BACKENDS[backend_name]
    print(f"Backend: {backend_name}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    briefings = load_briefings()
    if args.id:
        briefings = [(i, t) for i, t in briefings if i == args.id]
        if not briefings:
            raise SystemExit(f"Unknown briefing id: {args.id}")

    ok = 0
    for briefing_id, text in briefings:
        out = OUT_DIR / f"{briefing_id}.mp3"
        if out.exists() and not args.force:
            print(f"skip {briefing_id} (exists)")
            ok += 1
            continue
        print(f"gen  {briefing_id} …")
        if synthesize(text, out):
            print(f"  → {out.relative_to(REPO)} ({out.stat().st_size // 1024} KB)")
            ok += 1
        else:
            print(f"  FAILED {briefing_id}", file=sys.stderr)

    print(f"\n{ok}/{len(briefings)} briefings ready in {OUT_DIR.relative_to(REPO)}")
    if ok < len(briefings):
        raise SystemExit(1)


if __name__ == "__main__":
    main()

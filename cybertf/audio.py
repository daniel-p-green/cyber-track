"""Optional mission audio.

Default path is fully offline: macOS built-in `say` for briefings and a
system sound for mission-complete cues. This matches the edge/offline
thesis — no cloud voice required.

OpenAI TTS is an optional demo polish tier, used only when OPENAI_API_KEY
is present in the environment and --voice openai is requested. The key is
never stored or committed.
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import urllib.request
from pathlib import Path

# Radio-operator voice briefings, keyed by mission id. Target 8 to 12
# seconds at the `say` rate below. Missions without an entry fall back to
# title + summary.
BRIEFING_SCRIPTS = {
    "sprint_signal_lost": (
        "Operator, HALCYON control. A config push broke the coastal uplink. "
        "Sensors are dropping packets ahead of the storm front. No cloud on "
        "this link, just you and the local model. Verify before you "
        "trust. Clock is running."
    ),
}


def briefing_script(mission_id: str, fallback: str = "") -> str:
    """Return the voice briefing for a mission, or the fallback text."""
    return BRIEFING_SCRIPTS.get(mission_id, fallback)


COMPLETE_SOUND = "/System/Library/Sounds/Glass.aiff"
PROMOTE_SOUND = "/System/Library/Sounds/Hero.aiff"


def offline_available() -> bool:
    return shutil.which("say") is not None


def speak_offline(text: str, blocking: bool = False) -> bool:
    """Offline TTS via macOS `say`. Returns True if playback started."""
    if not offline_available():
        return False
    cmd = ["say", "-r", "185", text]
    if blocking:
        subprocess.run(cmd, check=False)
    else:
        subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return True


def play_cue(kind: str = "complete") -> bool:
    sound = PROMOTE_SOUND if kind == "promotion" else COMPLETE_SOUND
    if not Path(sound).is_file() or shutil.which("afplay") is None:
        return False
    subprocess.Popen(["afplay", sound], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return True


def speak_openai(text: str, out_path: Path) -> bool:
    """Optional cloud polish tier. Requires OPENAI_API_KEY in env."""
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        return False
    base = os.environ.get("OPENAI_API_BASE", "https://api.openai.com/v1").rstrip("/")
    model = os.environ.get("OPENAI_TTS_MODEL", "tts-1-hd")
    voice = os.environ.get("OPENAI_TTS_VOICE", "onyx")
    req = urllib.request.Request(
        f"{base}/audio/speech",
        data=json.dumps(
            {"model": model, "input": text, "voice": voice, "response_format": "mp3"}
        ).encode(),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {key}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            out_path.write_bytes(resp.read())
    except Exception:
        return False
    if shutil.which("afplay"):
        subprocess.Popen(
            ["afplay", str(out_path)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
    return True


def speak(text: str, voice: str = "offline", out_dir: Path | None = None) -> str:
    """Speak text with the requested tier. Returns the tier actually used."""
    if voice == "openai":
        target = (out_dir or Path.cwd()) / "briefing.mp3"
        if speak_openai(text, target):
            return "openai"
    if speak_offline(text):
        return "offline"
    return "none"

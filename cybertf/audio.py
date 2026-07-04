"""Optional mission audio.

Default path is fully offline: macOS built-in `say` for briefings and a
system sound for mission-complete cues. This matches the edge/offline
thesis — no cloud voice required.

ElevenLabs is an optional polish tier, used only when ELEVENLABS_API_KEY
is present in the environment and --voice elevenlabs is requested.
The key is never stored or committed.
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import urllib.request
from pathlib import Path

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


def speak_elevenlabs(text: str, out_path: Path) -> bool:
    """Optional cloud polish tier. Requires ELEVENLABS_API_KEY in env."""
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        return False
    voice = os.environ.get("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice}",
        data=json.dumps({"text": text, "model_id": "eleven_multilingual_v2"}).encode(),
        headers={"Content-Type": "application/json", "xi-api-key": key},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
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
    if voice == "elevenlabs":
        target = (out_dir or Path.cwd()) / "briefing.mp3"
        if speak_elevenlabs(text, target):
            return "elevenlabs"
    if speak_offline(text):
        return "offline"
    return "none"

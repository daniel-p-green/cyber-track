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

# Radio-operator voice briefings, keyed by mission id. Target 8 to 12
# seconds at the `say` rate below. Missions without an entry fall back to
# title + summary.
BRIEFING_SCRIPTS = {
    "sprint_signal_lost": (
        "Operator, HALCYON control. A config push broke the coastal uplink. "
        "Sensors are dropping packets ahead of the storm front. No cloud on "
        "this link, just you and the local field AI. Verify before you "
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


def speak_piper(text: str, out_path: Path) -> bool:
    """Local Piper TTS. Requires piper binary and PIPER_MODEL_PATH."""
    model = os.environ.get("PIPER_MODEL_PATH")
    piper = shutil.which("piper")
    if not model or not piper:
        return False
    wav = out_path.with_suffix(".wav")
    try:
        subprocess.run(
            [piper, "--model", model, "--output_file", str(wav)],
            input=text.encode(),
            check=True,
            capture_output=True,
        )
        if shutil.which("ffmpeg"):
            subprocess.run(
                [
                    "ffmpeg",
                    "-y",
                    "-i",
                    str(wav),
                    "-codec:a",
                    "libmp3lame",
                    "-qscale:a",
                    "3",
                    str(out_path),
                ],
                check=True,
                capture_output=True,
            )
            wav.unlink(missing_ok=True)
            return out_path.is_file()
        out_path = wav
        return wav.is_file()
    except subprocess.CalledProcessError:
        return False


def speak_local_http(text: str, out_path: Path) -> bool:
    """POST {text} to CYBERTF_TTS_URL (Piper/Kokoro/local voice server)."""
    base = os.environ.get("CYBERTF_TTS_URL", "").rstrip("/")
    if not base:
        return False
    req = urllib.request.Request(
        base,
        data=json.dumps({"text": text}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            out_path.write_bytes(resp.read())
        return out_path.stat().st_size > 0
    except Exception:
        return False


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
    target = (out_dir or Path.cwd()) / "briefing.mp3"
    if voice == "elevenlabs":
        if speak_elevenlabs(text, target):
            return "elevenlabs"
    if voice == "piper":
        if speak_piper(text, target):
            return "piper"
    if voice == "local":
        if speak_local_http(text, target):
            return "local"
    if voice in ("elevenlabs", "piper", "local"):
        # explicit tier failed; do not silently downgrade for named tiers
        return "none"
    if speak_offline(text):
        return "offline"
    return "none"

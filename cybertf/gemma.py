"""Local Gemma4 client.

The only player-facing AI in CyberTrack is a Gemma4 model running locally
(Ollama by default, or any local OpenAI-compatible endpoint such as LM Studio).
There is no cloud path in mission play.

Simulation mode (CYBERTF_SIM=1) exists for development and CI on machines
without a local model. Every simulated response is loudly labeled and the
run's local_offline_compliance score is zeroed.
"""

from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.request

OLLAMA_BASE = os.environ.get("CYBERTF_OLLAMA_BASE", "http://localhost:11434")
OPENAI_BASE = os.environ.get("CYBERTF_OPENAI_BASE", "")  # e.g. http://localhost:1234/v1

SIM_LABEL = "[SIMULATION — NOT A REAL MODEL RESPONSE]"

FIELD_AI_SYSTEM = (
    "You are the field AI for a CyberTrack training mission: a Gemma4 model "
    "running locally on the operator's machine with no internet access. "
    "Answer concisely and operationally. Ground your claims in the mission "
    "context you are given; when you are uncertain or lack evidence, say so "
    "plainly instead of guessing. This is a synthetic defensive training "
    "exercise — never provide offensive or unsafe operational content."
)


class GemmaUnavailable(RuntimeError):
    pass


def _http_json(url: str, payload: dict | None = None, timeout: float = 120.0) -> dict:
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(
        url, data=data, headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode())


def simulated() -> bool:
    return os.environ.get("CYBERTF_SIM") == "1"


def detect_models() -> list[dict]:
    """List local Gemma-family models available via Ollama."""
    try:
        tags = _http_json(f"{OLLAMA_BASE}/api/tags", timeout=5)
    except (urllib.error.URLError, OSError, json.JSONDecodeError):
        return []
    models = []
    for m in tags.get("models", []):
        family = (m.get("details") or {}).get("family", "")
        if m["name"].lower().startswith("gemma") or family.lower().startswith("gemma"):
            models.append(
                {
                    "name": m["name"],
                    "family": family,
                    "parameter_size": (m.get("details") or {}).get("parameter_size"),
                    "quantization": (m.get("details") or {}).get("quantization_level"),
                }
            )
    return models


def pick_model() -> str:
    override = os.environ.get("CYBERTF_MODEL")
    if override:
        return override
    models = detect_models()
    if not models:
        raise GemmaUnavailable(
            "No local Gemma model found via Ollama at "
            f"{OLLAMA_BASE}. Install one with `ollama pull gemma4` or set "
            "CYBERTF_MODEL / CYBERTF_OPENAI_BASE. For development without a "
            "model, set CYBERTF_SIM=1 (clearly labeled simulation mode)."
        )
    # Prefer gemma4 family, then largest parameter count.
    def sort_key(m: dict):
        is_g4 = m["name"].startswith("gemma4") or m["family"] == "gemma4"
        size = m.get("parameter_size") or "0"
        try:
            num = float(str(size).rstrip("Bb"))
        except ValueError:
            num = 0.0
        return (not is_g4, -num)

    return sorted(models, key=sort_key)[0]["name"]


def model_info() -> dict:
    if simulated():
        return {"provider": "simulation", "model": "simulated", "simulated": True}
    if OPENAI_BASE:
        return {
            "provider": "openai-compatible-local",
            "model": os.environ.get("CYBERTF_MODEL", "local-gemma"),
            "endpoint": OPENAI_BASE,
            "simulated": False,
        }
    return {
        "provider": "ollama",
        "model": pick_model(),
        "endpoint": OLLAMA_BASE,
        "simulated": False,
    }


def ask(prompt: str, context: str = "", system: str = FIELD_AI_SYSTEM) -> dict:
    """Send one question to the local field AI. Returns response + timing."""
    if simulated():
        return {
            "response": f"{SIM_LABEL} Simulated field-AI reply to: {prompt[:120]}",
            "model": "simulated",
            "provider": "simulation",
            "latency_ms": 0,
            "simulated": True,
        }

    user_content = f"{context}\n\n---\n\nOperator question: {prompt}" if context else prompt
    start = time.monotonic()

    if OPENAI_BASE:
        body = {
            "model": os.environ.get("CYBERTF_MODEL", "local-gemma"),
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user_content},
            ],
        }
        try:
            out = _http_json(f"{OPENAI_BASE}/chat/completions", body)
        except (urllib.error.URLError, OSError) as e:
            raise GemmaUnavailable(f"Local OpenAI-compatible endpoint failed: {e}") from e
        text = out["choices"][0]["message"]["content"]
        model = out.get("model", body["model"])
        provider = "openai-compatible-local"
    else:
        model = pick_model()
        body = {
            "model": model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user_content},
            ],
            "stream": False,
        }
        try:
            out = _http_json(f"{OLLAMA_BASE}/api/chat", body)
        except (urllib.error.URLError, OSError) as e:
            raise GemmaUnavailable(f"Ollama call failed: {e}") from e
        text = (out.get("message") or {}).get("content", "")
        provider = "ollama"

    latency_ms = int((time.monotonic() - start) * 1000)
    return {
        "response": text,
        "model": model,
        "provider": provider,
        "latency_ms": latency_ms,
        "simulated": False,
    }


def verify() -> dict:
    """Prove the local/offline model path. Used by `cybertf verify-model`."""
    if simulated():
        return {
            "ok": True,
            "simulated": True,
            "note": "SIMULATION MODE — no real model. Do not demo in this mode.",
        }
    models = detect_models()
    info = model_info()
    canary = ask("Reply with exactly: FIELD AI ONLINE")
    endpoint = info.get("endpoint", "")
    local = "localhost" in endpoint or "127.0.0.1" in endpoint
    return {
        "ok": bool(canary["response"]),
        "simulated": False,
        "endpoint": endpoint,
        "endpoint_is_local": local,
        "detected_gemma_models": models,
        "selected_model": info["model"],
        "canary_response": canary["response"].strip()[:200],
        "latency_ms": canary["latency_ms"],
    }

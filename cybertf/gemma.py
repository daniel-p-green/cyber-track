"""Gemma/Gemma-compatible mission assistant client.

The only player-facing AI in CyberTrack is a Gemma4 model running locally
(Ollama by default, or any local OpenAI-compatible endpoint such as LM Studio).
Cloud OpenAI-compatible endpoints can be used as explicit fallbacks, but they
do not count as local/offline compliance.

An internal test fallback exists for development and CI on machines without a
local model. Fallback responses are labeled in artifacts and the run's
local_offline_compliance score is zeroed.
"""

from __future__ import annotations

import json
import os
import time
from urllib.parse import urlparse
import urllib.error
import urllib.request

OLLAMA_BASE = os.environ.get("CYBERTF_OLLAMA_BASE", "http://localhost:11434")
OPENAI_BASE = os.environ.get("CYBERTF_OPENAI_BASE", "")  # e.g. http://localhost:1234/v1

SIM_LABEL = "[TEST FALLBACK: NOT A REAL MODEL RESPONSE]"

FIELD_AI_SYSTEM = (
    "You are the local Gemma4 mission assistant for a CyberTrack training mission, "
    "running locally on the operator's machine with no internet access. "
    "Answer concisely and operationally. Ground your claims in the mission "
    "context you are given; when you are uncertain or lack evidence, say so "
    "plainly instead of guessing. This is a synthetic defensive training "
    "exercise. Never provide offensive or unsafe operational content."
)


class GemmaUnavailable(RuntimeError):
    pass


def _http_json(
    url: str,
    payload: dict | None = None,
    timeout: float = 120.0,
    headers: dict[str, str] | None = None,
) -> dict:
    data = json.dumps(payload).encode() if payload is not None else None
    req_headers = {"Content-Type": "application/json"}
    if headers:
        req_headers.update(headers)
    req = urllib.request.Request(
        url, data=data, headers=req_headers
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode())


def simulated() -> bool:
    return os.environ.get("CYBERTF_SIM") == "1"


def endpoint_is_local(endpoint: str) -> bool:
    host = (urlparse(endpoint).hostname or "").lower()
    return (
        host in {"localhost", "127.0.0.1", "::1", "host.docker.internal"}
        or host.startswith("192.168.")
        or host.startswith("10.")
    )


def provider_for_endpoint(endpoint: str) -> str:
    return "openai-compatible-local" if endpoint_is_local(endpoint) else "openai-compatible-cloud"


def openai_headers() -> dict[str, str]:
    headers: dict[str, str] = {}
    key = os.environ.get("CYBERTF_OPENAI_API_KEY") or os.environ.get("OPENROUTER_API_KEY")
    if key:
        headers["Authorization"] = f"Bearer {key}"
    if "openrouter.ai" in OPENAI_BASE:
        headers["HTTP-Referer"] = os.environ.get(
            "CYBERTF_OPENROUTER_REFERRER", "https://cybertrack-arena.local"
        )
        headers["X-Title"] = os.environ.get("CYBERTF_OPENROUTER_TITLE", "CyberTrack")
    return headers


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
            "CYBERTF_MODEL / CYBERTF_OPENAI_BASE to point at a local "
            "Gemma-compatible endpoint."
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
            "provider": provider_for_endpoint(OPENAI_BASE),
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
    """Send one question to the local model. Returns response + timing."""
    if simulated():
        return {
            "response": f"{SIM_LABEL} Simulated local-model reply to: {prompt[:120]}",
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
            out = _http_json(
                f"{OPENAI_BASE.rstrip('/')}/chat/completions",
                body,
                headers=openai_headers(),
            )
        except (urllib.error.URLError, OSError) as e:
            raise GemmaUnavailable(f"OpenAI-compatible endpoint failed: {e}") from e
        text = out["choices"][0]["message"]["content"]
        model = out.get("model", body["model"])
        provider = provider_for_endpoint(OPENAI_BASE)
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
            "note": "Internal test fallback active, no real model response.",
        }
    models = detect_models()
    info = model_info()
    canary = ask("Reply with exactly: FIELD AI ONLINE")
    endpoint = info.get("endpoint", "")
    local = endpoint_is_local(endpoint)
    return {
        "ok": bool(canary["response"]),
        "simulated": False,
        "endpoint": endpoint,
        "endpoint_is_local": local,
        "provider": info["provider"],
        "detected_gemma_models": models,
        "selected_model": info["model"],
        "canary_response": canary["response"].strip()[:200],
        "latency_ms": canary["latency_ms"],
    }

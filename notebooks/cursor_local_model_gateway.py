# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "marimo",
# ]
# ///

import marimo

__generated_with = "0.14.17"
app = marimo.App(width="medium", app_title="CyberTrack Cursor Local Model Gateway")


@app.cell
def _():
    import json
    import os
    import urllib.error
    import urllib.request

    import marimo as mo

    return json, mo, os, urllib


@app.cell
def _(mo):
    mo.md(
        """
        # CyberTrack local model gateway

        This notebook is an optional setup aid for Cursor-native chat. It is not
        required for the CyberTrack demo loop.

        Core demo path:

        ```bash
        cybertf verify-model
        cybertf run basic_qualification
        cybertf ask "what claim should I verify?" --file challenges/basic_qualification/data/field_ai_advisory.txt
        cybertf submit basic_qualification runs/<run_id>/answer.json
        cybertf publish <run_id>
        ```

        That path talks to local Ollama directly and preserves the local/offline
        proof story. Cursor-native chat is extra polish for people who want the
        model in Cursor's model picker.
        """
    )
    return


@app.cell
def _(json, mo, urllib):
    def get_json(url: str, timeout: float = 2.0) -> tuple[bool, object]:
        try:
            req = urllib.request.Request(url, headers={"Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=timeout) as res:
                payload = json.loads(res.read().decode("utf-8"))
            return True, payload
        except (OSError, urllib.error.URLError, json.JSONDecodeError) as exc:
            return False, str(exc)

    ok, payload = get_json("http://localhost:11434/api/tags")
    if ok and isinstance(payload, dict):
        models = payload.get("models", [])
        names = [m.get("name", "unknown") for m in models if isinstance(m, dict)]
        body = "\n".join(f"- `{name}`" for name in names) or "- No models returned."
        status = f"## Local Ollama check\n\nConnected to `localhost:11434`.\n\n{body}"
    else:
        status = (
            "## Local Ollama check\n\n"
            "Ollama was not reachable at `http://localhost:11434`.\n\n"
            "Start Ollama, then run `ollama pull gemma4` and refresh this cell."
        )

    mo.md(status)
    return get_json, ok, payload


@app.cell
def _(mo):
    mo.md(
        """
        ## Cursor-native local chat

        Cursor usually needs an HTTPS OpenAI-compatible endpoint for custom
        models. For a local Ollama model, expose Ollama through a temporary
        tunnel, then set Cursor's OpenAI-compatible base URL to the tunnel URL
        ending in `/v1`.

        macOS:

        ```bash
        export OLLAMA_ORIGINS="*"
        ollama serve
        ollama pull gemma4
        ngrok http 11434 --host-header="localhost:11434"
        ```

        Windows PowerShell:

        ```powershell
        setx OLLAMA_ORIGINS "*"
        ollama serve
        ollama pull gemma4
        ngrok http 11434 --host-header="localhost:11434"
        ```

        Cursor settings:

        - Model name: `gemma4:latest` or the exact name shown by `ollama list`
        - API key: any non-empty value, for example `Ollama`
        - Base URL: `https://your-ngrok-subdomain.ngrok-free.app/v1`

        Close the tunnel when the demo is over. Do not send sensitive evidence
        through a public tunnel unless you understand the exposure.
        """
    )
    return


@app.cell
def _(mo):
    mo.md(
        """
        ## OpenRouter fallback

        OpenRouter is useful when local hardware is unavailable, and it currently
        has free Gemma-family models. It is a cloud fallback, so it should not be
        counted as local/offline compliance in CyberTrack judging.

        ```bash
        export CYBERTF_OPENAI_BASE="https://openrouter.ai/api/v1"
        export OPENROUTER_API_KEY="..."
        export CYBERTF_MODEL="google/gemma-4-26b-a4b-it:free"
        cybertf verify-model
        ```

        Use this only as a clearly labeled backup path. The preferred demo proof
        remains local Ollama + Gemma.
        """
    )
    return


@app.cell
def _(mo):
    mo.md(
        """
        ## Run this notebook

        From the public repo root:

        ```bash
        uvx marimo edit notebooks/cursor_local_model_gateway.py
        ```

        Or, if `marimo` is already installed:

        ```bash
        marimo edit notebooks/cursor_local_model_gateway.py
        ```

        This notebook is sandboxed with PEP 723 metadata, so it does not add a
        dependency to the CyberTrack package.
        """
    )
    return


if __name__ == "__main__":
    app.run()

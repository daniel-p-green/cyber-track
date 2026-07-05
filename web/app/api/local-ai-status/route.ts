import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type OllamaModel = {
  name?: string;
  model?: string;
};

function modelName(model: OllamaModel): string | null {
  return model.name ?? model.model ?? null;
}

async function fetchOllamaJson<T>(url: string): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1400);
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function pickGemmaModel(models: string[], desired: string): string | null {
  return (
    models.find((m) => m === desired) ??
    models.find((m) => m.startsWith(`${desired}:`)) ??
    models.find((m) => m.toLowerCase().includes("gemma")) ??
    null
  );
}

export async function GET() {
  const base = (process.env.CYBERTF_OLLAMA_BASE ?? "http://127.0.0.1:11434").replace(/\/$/, "");
  const desired = process.env.CYBERTF_MODEL ?? "gemma4:latest";

  const tags = await fetchOllamaJson<{ models?: OllamaModel[] }>(`${base}/api/tags`);
  if (!tags) {
    return NextResponse.json(
      {
        provider: "ollama",
        connected: false,
        model: null,
        model_state: "unreachable",
        loaded_models: [],
        available_models: [],
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const ps = await fetchOllamaJson<{ models?: OllamaModel[] }>(`${base}/api/ps`);
  const availableModels = (tags.models ?? []).map(modelName).filter(Boolean) as string[];
  const loadedModels = (ps?.models ?? []).map(modelName).filter(Boolean) as string[];
  const loadedModel = pickGemmaModel(loadedModels, desired);
  const installedModel = pickGemmaModel(availableModels, desired);

  return NextResponse.json(
    {
      provider: "ollama",
      connected: true,
      model: loadedModel ?? installedModel,
      model_state: loadedModel ? "loaded" : installedModel ? "installed" : "missing",
      loaded_models: loadedModels.slice(0, 8),
      available_models: availableModels.slice(0, 8),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

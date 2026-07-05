import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const BRIEFING_DIR = path.join(process.cwd(), "public", "audio", "briefings");

/** Serve pre-generated briefings or synthesize via OpenAI / local TTS. */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id")?.trim();
  const text = req.nextUrl.searchParams.get("text")?.trim();

  if (!id || !text) {
    return NextResponse.json({ error: "id and text are required" }, { status: 400 });
  }
  if (id.length > 64 || !/^[a-z0-9_-]+$/.test(id)) {
    return NextResponse.json({ error: "invalid briefing id" }, { status: 400 });
  }
  if (text.length > 2000) {
    return NextResponse.json({ error: "text too long" }, { status: 400 });
  }

  const staticPath = path.join(BRIEFING_DIR, `${id}.mp3`);
  try {
    const cached = await readFile(staticPath);
    return audioResponse(cached);
  } catch {
    // fall through to synthesis tiers
  }

  const openai = await synthesizeOpenAI(text);
  if (openai) return audioResponse(openai);

  const local = await synthesizeLocal(text);
  if (local) return audioResponse(local);

  return NextResponse.json(
    {
      error: "briefing audio unavailable",
      hint: "Run scripts/generate_briefings.py --backend openai, set OPENAI_API_KEY, or set CYBERTF_TTS_URL",
    },
    { status: 503 }
  );
}

function audioResponse(body: Buffer) {
  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}

async function synthesizeOpenAI(text: string): Promise<Buffer | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const base = (process.env.OPENAI_API_BASE ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.OPENAI_TTS_MODEL ?? "tts-1-hd";
  const voice = process.env.OPENAI_TTS_VOICE ?? "onyx";

  const res = await fetch(`${base}/audio/speech`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      input: text,
      voice,
      response_format: "mp3",
    }),
  });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

/** POST { "text": "..." } to a local Piper/Kokoro/edge TTS server. */
async function synthesizeLocal(text: string): Promise<Buffer | null> {
  const base = process.env.CYBERTF_TTS_URL?.replace(/\/$/, "");
  if (!base) return null;

  try {
    const res = await fetch(base, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("audio")) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

import { NextRequest, NextResponse } from "next/server";
import { upsertOperator } from "@/lib/store";

const CALLSIGN_RE = /^[A-Z0-9-]{3,20}$/;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { callsign, github_url, x_url } = body as Record<string, string>;

  if (!callsign || typeof callsign !== "string") {
    return NextResponse.json({ error: "callsign is required" }, { status: 400 });
  }

  const upper = callsign.toUpperCase();
  if (!CALLSIGN_RE.test(upper)) {
    return NextResponse.json(
      { error: "callsign must be 3-20 characters, uppercase letters, digits, or hyphens" },
      { status: 400 }
    );
  }

  const operator = await upsertOperator(upper, github_url, x_url);
  return NextResponse.json({ operator });
}

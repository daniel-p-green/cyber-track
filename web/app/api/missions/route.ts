import { NextResponse } from "next/server";
import { MISSIONS } from "@/lib/missions";

export async function GET() {
  return NextResponse.json({ missions: MISSIONS });
}

import { NextRequest, NextResponse } from "next/server";
import { getOperator, getSubmissionsByCallsign } from "@/lib/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ callsign: string }> }
) {
  const { callsign } = await params;
  const upper = callsign.toUpperCase();
  const operator = await getOperator(upper);
  if (!operator) {
    return NextResponse.json({ error: "Operator not found" }, { status: 404 });
  }
  const submissions = await getSubmissionsByCallsign(upper);
  return NextResponse.json({ operator, submissions });
}

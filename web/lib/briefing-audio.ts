/** Voice briefing IDs and static asset paths for the web arena. */

export const HERO_BRIEFING_ID = "hero";

export const HERO_BRIEFING_TEXT =
  "CyberTrack. A tactical mission arena inside Cursor. Timed incidents, incomplete evidence, and Gemma4 running locally as your only assistant. The model is confidently wrong at least once. Make the call, cite your proof, and read the after action report. Anyone can get an A I answer. Operators verify one under pressure.";

/** Pre-generated MP3 served from /public. */
export function staticBriefingUrl(briefingId: string): string {
  return `/audio/briefings/${briefingId}.mp3`;
}

/** On-demand synthesis when a static file is missing. */
export function dynamicBriefingUrl(briefingId: string, text: string): string {
  const params = new URLSearchParams({ id: briefingId, text });
  return `/api/briefing-audio?${params.toString()}`;
}

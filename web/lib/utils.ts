import { Mission } from "./missions";

export function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export type SlopeId = "green" | "blue" | "black" | "double-black";

export interface Slope {
  id: SlopeId;
  label: string;
  shortLabel: string;
}

/** Skiing-style difficulty language: instantly readable, sport-progression
 *  feel. Mapped from the mission's numeric difficulty. */
export function slopeForDifficulty(difficulty: number): Slope {
  if (difficulty <= 1) return { id: "green", label: "Green Circle", shortLabel: "Green" };
  if (difficulty === 2) return { id: "blue", label: "Blue Square", shortLabel: "Blue" };
  if (difficulty === 3) return { id: "black", label: "Black Diamond", shortLabel: "Black" };
  return { id: "double-black", label: "Double Black Diamond", shortLabel: "Dbl Black" };
}

export function computeXP(
  total: number,
  maxTotal: number,
  mission: Mission
): number {
  const diffMultiplier = 1 + (mission.difficulty - 1) * 0.25;
  return Math.round((total / Math.max(maxTotal, 1)) * mission.xp_base * diffMultiplier);
}

export function eventTypeLabel(eventType: string): string {
  return eventType.replace(/_/g, " ").toUpperCase();
}

export function eventTypeColor(eventType: string): string {
  switch (eventType) {
    case "qualification": return "tag-signal";
    case "sprint":        return "tag-amber";
    case "field":         return "tag-ice";
    case "relay":         return "tag-muted";
    case "marathon":      return "tag-alert";
    default:              return "tag-muted";
  }
}

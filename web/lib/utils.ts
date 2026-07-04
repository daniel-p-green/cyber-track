import { Mission } from "./missions";

export function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function difficultyPips(level: number, max = 5): string {
  const filled = "▮".repeat(Math.min(level, max));
  const empty  = "▯".repeat(Math.max(0, max - level));
  return filled + empty;
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

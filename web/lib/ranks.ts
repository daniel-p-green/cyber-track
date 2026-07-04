export interface RankEntry {
  name: string;
  xp_min: number;
  glyph: string;
}

export const RANKS: RankEntry[] = [
  { name: "Recruit", xp_min: 0, glyph: "△" },
  { name: "Operator", xp_min: 250, glyph: "▲" },
  { name: "Specialist", xp_min: 700, glyph: "▲▲" },
  { name: "Sentinel", xp_min: 1400, glyph: "◆▲" },
  { name: "Warden", xp_min: 2400, glyph: "◆▲▲" },
  { name: "Commander", xp_min: 3800, glyph: "◆◆▲▲" },
  { name: "Field Marshal", xp_min: 5600, glyph: "◆◆◆▲▲" },
];

export function getRankForXP(xp: number): RankEntry {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.xp_min) rank = r;
  }
  return rank;
}

export function getNextRank(xp: number): RankEntry | null {
  const current = getRankForXP(xp);
  const idx = RANKS.findIndex((r) => r.name === current.name);
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

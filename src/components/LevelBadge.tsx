const LEVEL_NAMES: Record<number, string> = {
  1: "Novice",
  2: "Visitor",
  3: "Reader",
  4: "Bookworm",
  5: "Comic Lover",
  6: "Manga Addict",
  7: "Master Reader",
  8: "Comic Sage",
  9: "Legendary",
  10: "God of Manga",
}

export function getLevelName(level: number): string {
  return LEVEL_NAMES[level] || "Unknown"
}

const COLORS: Record<number, string> = {
  1: "border-zinc-600 text-zinc-400",
  2: "border-green-600 text-green-400",
  3: "border-blue-600 text-blue-400",
  4: "border-indigo-600 text-indigo-400",
  5: "border-purple-600 text-purple-400",
  6: "border-neon-pink text-neon-pink",
  7: "border-brutal-red text-brutal-red",
  8: "border-neon-yellow text-neon-yellow",
  9: "border-brutal-orange text-brutal-orange",
  10: "border-neon-cyan text-neon-cyan",
}

export default function LevelBadge({ level, totalReads }: { level: number; totalReads?: number }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className={`border px-2 py-0.5 text-xs font-bold ${COLORS[level] || "border-zinc-600 text-zinc-400"}`}>
        Lv.{level}
      </span>
      <span className="text-xs text-zinc-500 font-mono">{LEVEL_NAMES[level] || "Unknown"}</span>
      {totalReads !== undefined && (
        <span className="text-xs text-zinc-600 font-mono">({totalReads} reads)</span>
      )}
    </div>
  )
}

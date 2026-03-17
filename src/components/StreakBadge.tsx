interface Props {
  streak: number
}

export default function StreakBadge({ streak }: Props) {
  if (streak === 0) {
    return (
      <div className="flex items-center gap-2 text-white/50 text-sm">
        <span>Start your streak today</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full">
      <span className="text-xl">🔥</span>
      <span className="text-orange-300 font-semibold">
        {streak} day streak
      </span>
    </div>
  )
}

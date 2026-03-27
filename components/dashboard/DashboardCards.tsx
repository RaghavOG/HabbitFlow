import * as React from "react"
import { CheckCircle2, Flame, LineChart, Target } from "lucide-react"
import { cn } from "@/lib/utils"

type CardDef = {
  icon: React.ElementType
  label: string
  value: string
  sub: string
  accent: string
  glow: string
}

export default function DashboardCards({
  successRate,
  currentStreak,
  completionsThisMonth,
  calendarDaysWithCompletion,
  logEntries,
  habitCount,
}: {
  successRate: number
  currentStreak: number
  completionsThisMonth: number
  calendarDaysWithCompletion: number
  logEntries: number
  habitCount: number
}) {
  const cards: CardDef[] = [
    {
      icon: LineChart,
      label: "Success Rate",
      value: `${Math.round(successRate)}%`,
      sub: `${completionsThisMonth} / ${logEntries} checks done (logged days)`,
      accent: "text-blue-500",
      glow: "from-blue-500/20 to-blue-500/5",
    },
    {
      icon: Flame,
      label: "Best Streak",
      value: `${currentStreak}d`,
      sub: "Longest active streak",
      accent: "text-orange-500",
      glow: "from-orange-500/20 to-orange-500/5",
    },
    {
      icon: CheckCircle2,
      label: "Active Days",
      value: String(calendarDaysWithCompletion),
      sub: "Days with ≥1 habit done",
      accent: "text-emerald-500",
      glow: "from-emerald-500/20 to-emerald-500/5",
    },
    {
      icon: Target,
      label: "Habits Tracked",
      value: String(habitCount),
      sub: `${logEntries} total log entries`,
      accent: "text-violet-500",
      glow: "from-violet-500/20 to-violet-500/5",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ icon: Icon, label, value, sub, accent, glow }, i) => (
        <div
          key={label}
          className={cn(
            "card-hover glass-card rounded-2xl p-5 animate-fade-in-up relative overflow-hidden"
          )}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {/* Gradient top-left blob */}
          <div className={cn("absolute -top-4 -right-4 h-20 w-20 rounded-full bg-gradient-to-br blur-2xl opacity-60", glow)} />

          <div className="relative">
            <div className={cn("inline-flex size-9 items-center justify-center rounded-xl mb-3",
              `bg-gradient-to-br ${glow}`)}>
              <Icon className={cn("size-4", accent)} />
            </div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
            <div className="text-3xl font-bold tracking-tight tabular-nums">{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{sub}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

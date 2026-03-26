import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Flame, LineChart } from "lucide-react"

export default function DashboardCards({
  successRate,
  currentStreak,
  completed,
  tracked,
}: {
  successRate: number
  currentStreak: number
  completed: number
  tracked: number
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-[1px] rounded-2xl bg-gradient-to-r from-emerald-500/60 via-blue-500/50 to-emerald-500/30">
        <Card className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <LineChart className="size-4 text-blue-400" />
              <CardTitle className="text-sm font-medium text-zinc-200">Success Rate</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight tabular-nums text-zinc-50">
              {Math.round(successRate)}%
            </div>
            <div className="text-xs text-zinc-400 tabular-nums">
              {completed}/{tracked} tracked
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-[1px] rounded-2xl bg-gradient-to-r from-blue-500/50 via-emerald-500/40 to-blue-500/20">
        <Card className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-emerald-400" />
              <CardTitle className="text-sm font-medium text-zinc-200">Current Streak</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight tabular-nums text-zinc-50">
              {currentStreak}
            </div>
            <div className="text-xs text-zinc-400">Longest current streak</div>
          </CardContent>
        </Card>
      </div>

      <div className="p-[1px] rounded-2xl bg-gradient-to-r from-emerald-500/40 via-zinc-500/30 to-blue-500/30">
        <Card className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <CardTitle className="text-sm font-medium text-zinc-200">Completed</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight tabular-nums text-zinc-50">{completed}</div>
            <div className="text-xs text-zinc-400">Days completed this month</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


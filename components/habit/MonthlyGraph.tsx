"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateKeyUTC } from "@/utils/date"
import { AlertTriangle, TrendingDown, TrendingUp, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

type DashboardHabit = {
  _id: string
  name: string
  color: string
  goalPerMonth: number
  completedDays: number
  successRate: number
  streak: number
  progress: number
  logs: Record<string, boolean>
}

type ViewPeriod = "weekly" | "monthly" | "quarterly"

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

// ── Heatmap calendar view ──────────────────────────────────────────────
function HabitHeatmap({
  habits,
  year,
  month,
}: {
  habits: DashboardHabit[]
  year: number
  month: number
}) {
  const totalDays = getDaysInMonth(year, month)

  // For each day, compute % of habits done
  const dayRates = React.useMemo(() => {
    return Array.from({ length: totalDays }, (_, i) => {
      const day = i + 1
      const dateKey = formatDateKeyUTC(new Date(Date.UTC(year, month - 1, day)))
      const done = habits.filter((h) => h.logs[dateKey] === true).length
      const rate = habits.length === 0 ? 0 : done / habits.length
      return { day, dateKey, rate, done, total: habits.length }
    })
  }, [habits, year, month, totalDays])

  function rateToColor(rate: number) {
    if (rate === 0) return "bg-muted/60"
    if (rate < 0.25) return "bg-emerald-500/20"
    if (rate < 0.5) return "bg-emerald-500/40"
    if (rate < 0.75) return "bg-emerald-500/60"
    if (rate < 1) return "bg-emerald-500/80"
    return "bg-emerald-500"
  }

  const weeks: (typeof dayRates)[] = []
  // Pad start of month to align with weekday
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const padded = [...Array.from({ length: firstWeekday }, () => null), ...dayRates]
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7) as (typeof dayRates))
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-[10px] text-muted-foreground font-medium">
            {d}
          </div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }, (_, di) => {
            const cell = week[di]
            if (!cell) return <div key={di} />
            return (
              <div
                key={di}
                className={cn(
                  "aspect-square rounded-md transition-all hover:ring-2 hover:ring-primary/40 cursor-default",
                  rateToColor(cell.rate)
                )}
                title={`${cell.dateKey}: ${cell.done}/${cell.total} habits (${Math.round(cell.rate * 100)}%)`}
              />
            )
          })}
        </div>
      ))}
      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <span className="text-[10px] text-muted-foreground">Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((r) => (
          <div
            key={r}
            className={cn("h-3 w-3 rounded-sm", rateToColor(r))}
          />
        ))}
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>
    </div>
  )
}

// ── At-risk habits widget ──────────────────────────────────────────────
function AtRiskHabits({ habits }: { habits: DashboardHabit[] }) {
  const atRisk = habits
    .filter((h) => h.successRate < 50 && h.completedDays > 0)
    .sort((a, b) => a.successRate - b.successRate)
    .slice(0, 3)

  if (atRisk.length === 0) return null

  return (
    <Card className="glass-card border-0 rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <AlertTriangle className="size-4 text-yellow-500" />
          At-Risk Habits
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            &lt; 50% completion
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {atRisk.map((h) => (
          <div key={h._id} className="flex items-center gap-3">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: h.color }}
            />
            <span className="flex-1 text-sm truncate">{h.name}</span>
            <div className="text-right shrink-0">
              <div className="text-sm font-semibold text-yellow-500">
                {Math.round(h.successRate)}%
              </div>
              <div className="text-xs text-muted-foreground tabular-nums">
                {h.completedDays}/{h.goalPerMonth}d
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ── Trend comparison ───────────────────────────────────────────────────
function TrendComparison({
  habits,
  year,
  month,
}: {
  habits: DashboardHabit[]
  year: number
  month: number
}) {
  const { curRate, prevRate, delta } = React.useMemo(() => {
    // Current month completions
    const curDays = getDaysInMonth(year, month)
    let curDone = 0
    let curTotal = 0

    // Previous month
    const prevDate = new Date(Date.UTC(year, month - 2, 1))
    const prevYear = prevDate.getUTCFullYear()
    const prevMonth = prevDate.getUTCMonth() + 1
    const prevDays = getDaysInMonth(prevYear, prevMonth)
    let prevDone = 0
    let prevTotal = 0

    for (const h of habits) {
      for (let d = 1; d <= curDays; d++) {
        const key = formatDateKeyUTC(new Date(Date.UTC(year, month - 1, d)))
        curTotal++
        if (h.logs[key] === true) curDone++
      }
      for (let d = 1; d <= prevDays; d++) {
        const key = formatDateKeyUTC(new Date(Date.UTC(prevYear, prevMonth - 1, d)))
        // Check if habit had any logs this month at all (rough heuristic)
        if (h.logs[key] !== undefined) {
          prevTotal++
          if (h.logs[key] === true) prevDone++
        }
      }
    }

    const curRate = curTotal === 0 ? 0 : Math.round((curDone / curTotal) * 100)
    const prevRate = prevTotal === 0 ? null : Math.round((prevDone / prevTotal) * 100)
    const delta = prevRate === null ? null : curRate - prevRate

    return { curRate, prevRate, delta }
  }, [habits, year, month])

  const monthName = new Date(Date.UTC(year, month - 1, 1)).toLocaleString(undefined, { month: "short" })
  const prevMonthName = new Date(Date.UTC(year, month - 2, 1)).toLocaleString(undefined, { month: "short" })

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/60 px-4 py-3">
      <div className="text-center">
        <div className="text-xs text-muted-foreground">{prevMonthName}</div>
        <div className="text-xl font-bold tabular-nums">
          {prevRate === null ? "—" : `${prevRate}%`}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {delta === null ? (
          <Minus className="size-4 text-muted-foreground" />
        ) : delta > 0 ? (
          <div className="flex flex-col items-center gap-0.5">
            <TrendingUp className="size-4 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-500">+{delta}%</span>
          </div>
        ) : delta < 0 ? (
          <div className="flex flex-col items-center gap-0.5">
            <TrendingDown className="size-4 text-red-500" />
            <span className="text-xs font-semibold text-red-500">{delta}%</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-0.5">
            <Minus className="size-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">0%</span>
          </div>
        )}
      </div>
      <div className="text-center">
        <div className="text-xs text-muted-foreground">{monthName}</div>
        <div className="text-xl font-bold tabular-nums">{curRate}%</div>
      </div>
    </div>
  )
}

// ── Main chart ────────────────────────────────────────────────────────
export default function MonthlyGraph({
  habits,
  year,
  month,
}: {
  habits: DashboardHabit[]
  year: number
  month: number
}) {
  const [mounted, setMounted] = React.useState(false)
  const [view, setView] = React.useState<ViewPeriod>("monthly")
  const [chartMode, setChartMode] = React.useState<"line" | "area">("area")

  React.useEffect(() => setMounted(true), [])

  const days = React.useMemo(
    () => Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1),
    [year, month]
  )

  // Weekly view: last 7 days
  const weeklyDays = React.useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (6 - i))
      return d
    })
  }, [])

  // Quarterly: last 3 months, group by month
  const quarterlyData = React.useMemo(() => {
    const result = []
    for (let mo = -2; mo <= 0; mo++) {
      const d = new Date(Date.UTC(year, month - 1 + mo, 1))
      const my = d.getUTCFullYear()
      const mm = d.getUTCMonth() + 1
      const dim = getDaysInMonth(my, mm)
      let done = 0, total = 0
      for (const h of habits) {
        for (let day = 1; day <= dim; day++) {
          const key = formatDateKeyUTC(new Date(Date.UTC(my, mm - 1, day)))
          if (h.logs[key] !== undefined) {
            total++
            if (h.logs[key] === true) done++
          }
        }
      }
      result.push({
        label: d.toLocaleString(undefined, { month: "short" }),
        rate: total === 0 ? 0 : Math.round((done / total) * 100),
      })
    }
    return result
  }, [habits, year, month])

  const monthlyData = React.useMemo(() => {
    const habitIds = habits.map((h) => h._id)
    const counts: Record<string, number> = Object.fromEntries(habitIds.map((id) => [id, 0]))

    return days.map((day) => {
      const dateUtc = new Date(Date.UTC(year, month - 1, day))
      const dateKey = formatDateKeyUTC(dateUtc)

      for (const h of habits) {
        if (h.logs[dateKey] === true) counts[h._id] = (counts[h._id] ?? 0) + 1
      }

      const row: Record<string, number | string> = { day, dateKey }
      for (const id of habitIds) row[id] = counts[id] ?? 0
      return row
    })
  }, [days, habits, month, year])

  const weeklyData = React.useMemo(() => {
    return weeklyDays.map((date) => {
      const dateKey = formatDateKeyUTC(date)
      let done = 0
      for (const h of habits) {
        if (h.logs[dateKey] === true) done++
      }
      return {
        label: date.toLocaleString(undefined, { weekday: "short" }),
        done,
        rate: habits.length === 0 ? 0 : Math.round((done / habits.length) * 100),
      }
    })
  }, [weeklyDays, habits])

  const viewTabs: { key: ViewPeriod; label: string }[] = [
    { key: "weekly", label: "Week" },
    { key: "monthly", label: "Month" },
    { key: "quarterly", label: "Quarter" },
  ]

  return (
    <div className="space-y-4">
      {/* -- Trend + At-Risk row -- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <TrendComparison habits={habits} year={year} month={month} />

          {/* Heatmap */}
          <Card className="glass-card border-0 rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Completion Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <HabitHeatmap habits={habits} year={year} month={month} />
            </CardContent>
          </Card>
        </div>
        <div>
          <AtRiskHabits habits={habits} />
        </div>
      </div>

      {/* -- Main Chart -- */}
      <Card className="glass-card border-0 rounded-2xl overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-sm font-medium">Progress Chart</CardTitle>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {view === "weekly" && "Last 7 days — habit completion rate"}
                {view === "monthly" && "Cumulative completed days per habit"}
                {view === "quarterly" && "3-month completion rate comparison"}
              </div>
            </div>

            {/* Period tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1">
              {viewTabs.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setView(key)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150",
                    view === key
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Area / Line toggle */}
            {view === "monthly" && (
              <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1">
                {(["area", "line"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setChartMode(m)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all duration-150",
                      chartMode === m
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="w-full min-h-[280px] h-[280px]">
            {mounted ? (
              <>
                {/* Weekly */}
                {view === "weekly" && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData}>
                      <defs>
                        <linearGradient id="wkGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.56 0.22 262)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="oklch(0.56 0.22 262)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 6" vertical={false} opacity={0.15} />
                      <XAxis dataKey="label" tick={{ fill: "currentColor", fontSize: 12, opacity: 0.6 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: "currentColor", fontSize: 12, opacity: 0.6 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(v) => [`${v}%`, "Completion Rate"]} labelFormatter={(l) => `${l}`} />
                      <Area type="monotone" dataKey="rate" stroke="oklch(0.56 0.22 262)" strokeWidth={2} fill="url(#wkGrad)" dot={{ fill: "oklch(0.56 0.22 262)", r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}

                {/* Monthly */}
                {view === "monthly" && chartMode === "area" && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="2 6" vertical={false} opacity={0.15} />
                      <XAxis dataKey="day" tick={{ fill: "currentColor", fontSize: 11, opacity: 0.6 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, days.length]} tick={{ fill: "currentColor", fontSize: 11, opacity: 0.6 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(val, key) => {
                          const h = habits.find((h) => h._id === String(key))
                          return [Number(val), h?.name ?? String(key)]
                        }}
                        labelFormatter={(l) => `Day ${l}`}
                      />
                      <Legend
                        formatter={(val) => {
                          const h = habits.find((h) => h._id === String(val))
                          return h?.name ?? String(val)
                        }}
                      />
                      {habits.map((h, idx) => (
                        <Area
                          key={h._id}
                          type="monotone"
                          dataKey={h._id}
                          stroke={h.color}
                          strokeWidth={2}
                          fill={h.color}
                          fillOpacity={0.08 - idx * 0.01}
                          dot={false}
                          isAnimationActive={false}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                )}

                {view === "monthly" && chartMode === "line" && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="2 6" vertical={false} opacity={0.15} />
                      <XAxis dataKey="day" tick={{ fill: "currentColor", fontSize: 11, opacity: 0.6 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, days.length]} tick={{ fill: "currentColor", fontSize: 11, opacity: 0.6 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(val, key) => {
                          const h = habits.find((h) => h._id === String(key))
                          return [Number(val), h?.name ?? String(key)]
                        }}
                        labelFormatter={(l) => `Day ${l}`}
                      />
                      <Legend
                        formatter={(val) => {
                          const h = habits.find((h) => h._id === String(val))
                          return h?.name ?? String(val)
                        }}
                      />
                      {habits.map((h) => (
                        <Line
                          key={h._id}
                          type="monotone"
                          dataKey={h._id}
                          stroke={h.color}
                          strokeWidth={2.2}
                          dot={false}
                          isAnimationActive={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}

                {/* Quarterly */}
                {view === "quarterly" && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={quarterlyData}>
                      <defs>
                        <linearGradient id="qGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.60 0.18 165)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="oklch(0.60 0.18 165)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 6" vertical={false} opacity={0.15} />
                      <XAxis dataKey="label" tick={{ fill: "currentColor", fontSize: 13, opacity: 0.6 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: "currentColor", fontSize: 12, opacity: 0.6 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(v) => [`${v}%`, "Completion Rate"]} />
                      <Area type="monotone" dataKey="rate" stroke="oklch(0.60 0.18 165)" strokeWidth={2.5} fill="url(#qGrad)" dot={{ fill: "oklch(0.60 0.18 165)", r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </>
            ) : (
              <div className="h-full w-full shimmer rounded-xl bg-muted/40" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

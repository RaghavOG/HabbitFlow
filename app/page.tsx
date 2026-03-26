"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import HabitGrid from "@/components/habit/HabitGrid"
import MonthlyGraph from "@/components/habit/MonthlyGraph"
import AddHabitDialog from "@/components/habit/AddHabitDialog"

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

function monthLabel(year: number, month1to12: number) {
  const d = new Date(Date.UTC(year, month1to12 - 1, 1))
  return d.toLocaleString(undefined, { month: "long", year: "numeric" })
}

export default function Home() {
  const [monthCursor, setMonthCursor] = React.useState(() => new Date())
  const year = monthCursor.getUTCFullYear()
  const month = monthCursor.getUTCMonth() + 1 // 1-12

  const [habits, setHabits] = React.useState<DashboardHabit[]>([])
  const [loading, setLoading] = React.useState(false)
  const [authRequired, setAuthRequired] = React.useState(false)

  const fetchDashboard = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard?year=${year}&month=${month}`, { cache: "no-store" })
      if (res.status === 401) {
        setAuthRequired(true)
        setHabits([])
        return
      }
      if (!res.ok) throw new Error(`Dashboard fetch failed: ${res.status}`)
      const json = (await res.json()) as { habits: DashboardHabit[] }
      setAuthRequired(false)
      setHabits(json.habits ?? [])
    } finally {
      setLoading(false)
    }
  }, [year, month])

  React.useEffect(() => {
    void fetchDashboard()
  }, [fetchDashboard])

  const applyToggleOptimistic = React.useCallback((habit: DashboardHabit, dateKey: string): DashboardHabit => {
    const prevTracked = Object.prototype.hasOwnProperty.call(habit.logs, dateKey)
    const prevDone = habit.logs[dateKey] === true

    const nextLogs = { ...habit.logs }
    let nextCompletedDays = habit.completedDays

    if (prevTracked) {
      const nextDone = !prevDone
      nextLogs[dateKey] = nextDone
      nextCompletedDays = nextDone ? habit.completedDays + 1 : habit.completedDays - 1
    } else {
      // Not tracked yet this month: create with `status: true`.
      nextLogs[dateKey] = true
      nextCompletedDays = habit.completedDays + 1
    }

    const totalTrackedDays = Object.keys(nextLogs).length
    const successRate = totalTrackedDays === 0 ? 0 : (nextCompletedDays / totalTrackedDays) * 100
    const progress = habit.goalPerMonth > 0 ? (nextCompletedDays / habit.goalPerMonth) * 100 : 0

    return {
      ...habit,
      logs: nextLogs,
      completedDays: Math.max(0, nextCompletedDays),
      successRate,
      progress,
    }
  }, [])

  const applyMarkDoneOptimistic = React.useCallback((habit: DashboardHabit, dateKey: string): DashboardHabit => {
    const prevDone = habit.logs[dateKey] === true
    if (prevDone) return habit

    const nextLogs = { ...habit.logs, [dateKey]: true }
    const nextCompletedDays = habit.completedDays + 1

    const totalTrackedDays = Object.keys(nextLogs).length
    const successRate = totalTrackedDays === 0 ? 0 : (nextCompletedDays / totalTrackedDays) * 100
    const progress = habit.goalPerMonth > 0 ? (nextCompletedDays / habit.goalPerMonth) * 100 : 0

    return {
      ...habit,
      logs: nextLogs,
      completedDays: Math.max(0, nextCompletedDays),
      successRate,
      progress,
    }
  }, [])

  const toggleHabit = React.useCallback(
    async (habitId: string, dateKey: string) => {
      setHabits((prev) => prev.map((h) => (h._id === habitId ? applyToggleOptimistic(h, dateKey) : h)))

      try {
        await fetch("/api/logs/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ habitId, date: dateKey }),
        })
      } finally {
        void fetchDashboard()
      }
    },
    [applyToggleOptimistic, fetchDashboard]
  )

  const markDone = React.useCallback(
    async (habitId: string, dateKey: string) => {
      setHabits((prev) => prev.map((h) => (h._id === habitId ? applyMarkDoneOptimistic(h, dateKey) : h)))

      try {
        await fetch("/api/logs/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ habitId, date: dateKey }),
        })
      } finally {
        void fetchDashboard()
      }
    },
    [applyMarkDoneOptimistic, fetchDashboard]
  )

  const overall = React.useMemo(() => {
    const completed = habits.reduce((sum, h) => sum + h.completedDays, 0)
    const tracked = habits.reduce((sum, h) => sum + Object.keys(h.logs).length, 0)
    const successRate = tracked === 0 ? 0 : (completed / tracked) * 100
    const longestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0)
    return { completed, tracked, successRate, longestStreak }
  }, [habits])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMonthCursor(new Date(Date.UTC(year, month - 2, 1)))}
              disabled={loading}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMonthCursor(new Date(Date.UTC(year, month, 1)))}
              disabled={loading}
            >
              Next
            </Button>
            <AddHabitDialog />
          </div>
          <div className="text-sm text-muted-foreground">{monthLabel(year, month)}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums">{Math.round(overall.successRate)}%</div>
              <div className="text-xs text-muted-foreground tabular-nums">
                {overall.completed}/{overall.tracked} tracked
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums">{overall.longestStreak}</div>
              <div className="text-xs text-muted-foreground">Longest current streak</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums">{overall.completed}</div>
              <div className="text-xs text-muted-foreground">Days completed this month</div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Spinner className="mr-2" />
            Loading dashboard...
          </div>
        ) : authRequired ? (
          <Card>
            <CardHeader>
              <CardTitle>Sign in required</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm space-y-3">
              <div>Go to the sign in page to continue.</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="/signin">Sign in</a>
                </Button>
                <Button size="sm" asChild>
                  <a href="/signup">Sign up</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : habits.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No habits yet</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Create habits and then come back to track them in the matrix.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <HabitGrid habits={habits} year={year} month={month} onToggleHabit={toggleHabit} onMarkDone={markDone} />
            </div>
            <div className="space-y-4">
              <MonthlyGraph habits={habits} year={year} month={month} />
              <Card className={cn("text-sm")}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground space-y-1">
                  <div>Today column is highlighted.</div>
                  <div>Drag across undone cells to mark them done.</div>
                  <div>Future days are disabled.</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

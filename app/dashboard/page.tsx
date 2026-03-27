"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import HabitGrid from "@/components/habit/HabitGrid"
import MonthlyGraph from "@/components/habit/MonthlyGraph"
import AddHabitDialog from "@/components/habit/AddHabitDialog"
import HabitActionsMenu from "@/components/habit/HabitActionsMenu"
import DashboardCards from "@/components/dashboard/DashboardCards"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import {
  optimisticMarkDoneHabitDay,
  optimisticToggleHabitDay,
  setDashboardMonthHabits,
} from "@/lib/redux/dashboardSlice"
import type { DashboardHabit } from "@/lib/redux/dashboardSlice"
import { formatDateKeyUTC, toStartOfDayUTC } from "@/utils/date"
import {
  CalendarCheck2,
  Flame,
  RotateCcw,
  BarChart2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import AIInsightsCard from "@/components/ai/AIInsightsCard"
import { toast } from "sonner"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

function monthLabel(year: number, month1to12: number) {
  const d = new Date(Date.UTC(year, month1to12 - 1, 1))
  return d.toLocaleString(undefined, { month: "long", year: "numeric" })
}

const EMPTY_HABITS: DashboardHabit[] = []
const SHOW_MORNING_ROUTINE_BUTTON = false

export default function DashboardPage() {
  const [showMotivation, setShowMotivation] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return true
    const v = window.localStorage.getItem("hf_show_motivation")
    return v === null ? true : v === "true"
  })

  const [showAIInsights, setShowAIInsights] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return true
    const v = window.localStorage.getItem("hf_show_ai_insights")
    return v === null ? true : v === "true"
  })

  React.useEffect(() => {
    window.localStorage.setItem("hf_show_motivation", String(showMotivation))
  }, [showMotivation])

  React.useEffect(() => {
    window.localStorage.setItem("hf_show_ai_insights", String(showAIInsights))
  }, [showAIInsights])

  const [monthCursor, setMonthCursor] = React.useState(() => new Date())
  const year = monthCursor.getUTCFullYear()
  const month = monthCursor.getUTCMonth() + 1
  const monthKey = `${year}-${month}`

  const dispatch = useAppDispatch()

  const persistedHabits = useAppSelector((s) => s.dashboard.habitsByMonthKey[monthKey])
  const hasMonthData = persistedHabits !== undefined
  const habits: DashboardHabit[] = persistedHabits ?? EMPTY_HABITS
  const displayHabits = React.useMemo(() => [...habits].reverse(), [habits])
  const [habitsPanelOpen, setHabitsPanelOpen] = React.useState(true)

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)")
    const apply = () => setHabitsPanelOpen(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  const [authRequired, setAuthRequired] = React.useState(false)
  const [loadingInitial, setLoadingInitial] = React.useState(false)

  const fetchDashboard = React.useCallback(
    async (opts: { showSpinner: boolean }) => {
      if (opts.showSpinner) setLoadingInitial(true)
      try {
        const res = await fetch(`/api/dashboard?year=${year}&month=${month}`, {
          cache: "no-store",
          credentials: "include",
        })

        if (res.status === 401) {
          setAuthRequired(true)
          dispatch(setDashboardMonthHabits({ monthKey, habits: [] }))
          return
        }
        if (!res.ok) throw new Error(`Dashboard fetch failed: ${res.status}`)

        const json = (await res.json()) as { habits: DashboardHabit[] }
        setAuthRequired(false)
        dispatch(setDashboardMonthHabits({ monthKey, habits: json.habits ?? [] }))
      } finally {
        setLoadingInitial(false)
      }
    },
    [dispatch, monthKey, month, year]
  )

  React.useEffect(() => {
    void fetchDashboard({ showSpinner: !hasMonthData })
  }, [fetchDashboard, hasMonthData])

  const toggleHabit = React.useCallback(
    async (habitId: string, dateKey: string) => {
      dispatch(optimisticToggleHabitDay({ habitId, dateKey }))
      await fetch("/api/logs/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId, date: dateKey }),
        credentials: "include",
      })
      void fetchDashboard({ showSpinner: false })
    },
    [dispatch, fetchDashboard]
  )

  const markDone = React.useCallback(
    async (habitId: string, dateKey: string) => {
      dispatch(optimisticMarkDoneHabitDay({ habitId, dateKey }))
      await fetch("/api/logs/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId, date: dateKey }),
        credentials: "include",
      })
      void fetchDashboard({ showSpinner: false })
    },
    [dispatch, fetchDashboard]
  )

  const overall = React.useMemo(() => {
    const habitCount = habits.length
    // Sum of per-habit "done" cells in the visible month (not calendar days).
    const completionsThisMonth = habits.reduce((sum, h) => sum + h.completedDays, 0)
    // Every stored log for the month (done or not) — denominator for log-level success rate.
    const logEntries = habits.reduce((sum, h) => sum + Object.keys(h.logs).length, 0)
    const successRate = logEntries === 0 ? 0 : (completionsThisMonth / logEntries) * 100
    const longestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0)

    const daysWithAnyCompletion = new Set<string>()
    for (const h of habits) {
      for (const [dateKey, done] of Object.entries(h.logs)) {
        if (done) daysWithAnyCompletion.add(dateKey)
      }
    }
    const calendarDaysWithCompletion = daysWithAnyCompletion.size

    return {
      completionsThisMonth,
      logEntries,
      habitCount,
      successRate,
      longestStreak,
      calendarDaysWithCompletion,
    }
  }, [habits])

  const todayKey = React.useMemo(() => {
    return formatDateKeyUTC(toStartOfDayUTC(new Date()))
  }, [])

  const analyticsRef = React.useRef<HTMLDivElement | null>(null)

  const markAllToday = React.useCallback(async () => {
    if (!habits.length) return
    const toUpdate = habits.filter((h) => h.logs[todayKey] !== true)
    if (!toUpdate.length) return

    for (const h of toUpdate) {
      dispatch(optimisticMarkDoneHabitDay({ habitId: h._id, dateKey: todayKey }))
    }

    await Promise.all(
      toUpdate.map((h) =>
        fetch("/api/logs/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ habitId: h._id, date: todayKey }),
          credentials: "include",
        })
      )
    )

    void fetchDashboard({ showSpinner: false })
  }, [dispatch, fetchDashboard, habits, todayKey])

  const resetMonth = React.useCallback(async () => {
    dispatch(setDashboardMonthHabits({ monthKey, habits: [] }))
    await fetch(`/api/logs/reset-month?year=${year}&month=${month}`, {
      method: "DELETE",
      credentials: "include",
    })
    void fetchDashboard({ showSpinner: false })
  }, [dispatch, fetchDashboard, month, monthKey, year])

  const [seedingRoutine, setSeedingRoutine] = React.useState(false)
  const seedMorningRoutine = React.useCallback(async () => {
    setSeedingRoutine(true)
    try {
      const res = await fetch("/api/habits/seed-morning-routine", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, month }),
      })
      const json = (await res.json()) as { error?: string; created?: number; skipped?: number }
      if (!res.ok) throw new Error(json.error || "Failed to add routine habits")
      toast.success(`Added ${json.created ?? 0} habits${(json.skipped ?? 0) > 0 ? ` (skipped ${json.skipped})` : ""}`)
      void fetchDashboard({ showSpinner: false })
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add routine habits")
    } finally {
      setSeedingRoutine(false)
    }
  }, [fetchDashboard, month, year])

  const motivation = React.useMemo(() => {
    if (!habits.length) return { streakText: "Start a habit today", weekdayText: "", goalText: "" }

    const longest = overall.longestStreak
    const streakText = longest >= 3 ? `🔥 You're on a ${longest} day streak!` : "Keep going — consistency beats intensity."

    const weekdayCounts = Array.from({ length: 7 }, () => 0)
    for (const h of habits) {
      for (const [dateKey, done] of Object.entries(h.logs)) {
        if (!done) continue
        const d = new Date(`${dateKey}T00:00:00Z`)
        if (Number.isNaN(d.getTime())) continue
        weekdayCounts[d.getUTCDay()] += 1
      }
    }
    const maxIdx = weekdayCounts.reduce((best, v, idx) => (v > weekdayCounts[best] ? idx : best), 0)
    const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const
    const weekdayText = weekdayCounts[maxIdx] > 0 ? `📅 You are most consistent on ${weekdayNames[maxIdx]}s.` : "Complete a few days to unlock insights."

    const totalGoal = habits.reduce((sum, h) => sum + h.goalPerMonth, 0)
    const remainingDays = Math.max(0, totalGoal - overall.completionsThisMonth)
    const goalText = remainingDays > 0 ? `🎯 Complete ${remainingDays} more day${remainingDays === 1 ? "" : "s"} to reach your goal.` : "✅ Goal reached. Now protect your streak."

    return { streakText, weekdayText, goalText }
  }, [habits, overall.completionsThisMonth, overall.longestStreak])

  // Handle habit reorder (optimistic — no API call needed, just local)
  const handleReorder = React.useCallback((reordered: DashboardHabit[]) => {
    dispatch(setDashboardMonthHabits({ monthKey, habits: [...reordered].reverse() }))
  }, [dispatch, monthKey])

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 space-y-6 animate-fade-in">
      {/* ── Month navigation header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{monthLabel(year, month)}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {habits.length} habit{habits.length !== 1 ? "s" : ""} being tracked
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl size-9"
            onClick={() => setMonthCursor(new Date(Date.UTC(year, month - 2, 1)))}
            disabled={loadingInitial}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl size-9"
            onClick={() => setMonthCursor(new Date(Date.UTC(year, month, 1)))}
            disabled={loadingInitial}
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
          {!authRequired && (
            <AddHabitDialog year={year} month={month} onCreated={() => void fetchDashboard({ showSpinner: true })} />
          )}
          {!authRequired && SHOW_MORNING_ROUTINE_BUTTON && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl"
              disabled={seedingRoutine}
              onClick={() => void seedMorningRoutine()}
            >
              {seedingRoutine ? "Adding..." : "Morning Routine"}
            </Button>
          )}
        </div>
      </div>

      {/* ── Stats cards ── */}
      <DashboardCards
        successRate={overall.successRate}
        currentStreak={overall.longestStreak}
        completionsThisMonth={overall.completionsThisMonth}
        calendarDaysWithCompletion={overall.calendarDaysWithCompletion}
        logEntries={overall.logEntries}
        habitCount={overall.habitCount}
      />

      {/* ── Body ── */}
      {loadingInitial && habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Spinner className="size-6" />
          <span className="text-sm">Loading your dashboard…</span>
        </div>
      ) : authRequired ? (
        <Card className="glass-card border-0 rounded-2xl">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm space-y-4">
            <div>Please sign in to access your habit dashboard.</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild className="rounded-xl">
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="rounded-xl">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : habits.length === 0 ? (
        <Card className="glass-card border-0 rounded-2xl">
          <CardHeader>
            <CardTitle>No habits yet</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm space-y-4">
            <p>Create your first habit to start tracking your progress.</p>
            <AddHabitDialog year={year} month={month} onCreated={() => void fetchDashboard({ showSpinner: false })} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* ── Habits panel ── */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            {/* Action toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <AddHabitDialog year={year} month={month} onCreated={() => void fetchDashboard({ showSpinner: false })} />

              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                onClick={() => void markAllToday()}
              >
                <CalendarCheck2 className="size-4 mr-2 text-emerald-500" />
                Mark All Today
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                onClick={() => void resetMonth()}
              >
                <RotateCcw className="size-4 mr-2 text-muted-foreground" />
                Reset Month
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="rounded-xl"
                onClick={() => analyticsRef.current?.scrollIntoView({ behavior: "smooth" })}
              >
                <BarChart2 className="size-4 mr-2" />
                Analytics
              </Button>

              <Button
                size="sm"
                variant={showMotivation ? "secondary" : "ghost"}
                className="rounded-xl"
                onClick={() => setShowMotivation((v) => !v)}
              >
                <Flame className="size-4 mr-2 text-orange-500" />
                Motivation
              </Button>

              <Button
                size="sm"
                variant={showAIInsights ? "secondary" : "ghost"}
                className="rounded-xl ml-auto"
                onClick={() => setShowAIInsights((v) => !v)}
              >
                ✨ AI Insights
              </Button>
            </div>

            {/* Habit list (collapsible) */}
            <Collapsible open={habitsPanelOpen} onOpenChange={setHabitsPanelOpen}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">
                  Habits <span className="text-muted-foreground font-normal">({displayHabits.length})</span>
                </div>
                <CollapsibleTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-xl"
                    aria-label={habitsPanelOpen ? "Collapse" : "Expand"}
                  >
                    <ChevronDown
                      className={cn("size-4 transition-transform duration-200", habitsPanelOpen && "rotate-180")}
                    />
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent>
                <ScrollArea className="mt-3 h-[200px] sm:h-auto">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {displayHabits.map((h) => (
                      <div
                        key={h._id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2 hover:bg-muted/30 transition-colors"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <span
                            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: h.color, boxShadow: `0 0 6px ${h.color}60` }}
                          />
                          <span className="text-sm truncate">{h.name}</span>
                          <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                            {Math.round(h.successRate)}%
                          </span>
                        </div>
                        <HabitActionsMenu
                          habit={{ _id: h._id, name: h.name, color: h.color, goalPerMonth: h.goalPerMonth }}
                          year={year}
                          month={month}
                          onSaved={() => void fetchDashboard({ showSpinner: false })}
                          onDeleted={() => void fetchDashboard({ showSpinner: false })}
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* ── Habit grid (with drag-and-drop) ── */}
          <div className="glass-card rounded-2xl p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium">Habit Tracker Grid</h2>
              <p className="text-xs text-muted-foreground">Drag ≡ to reorder • Click cell to toggle</p>
            </div>
            <HabitGrid
              habits={displayHabits}
              year={year}
              month={month}
              onToggleHabit={toggleHabit}
              onMarkDone={markDone}
              onReorder={handleReorder}
            />
          </div>

          {/* ── Analytics ── */}
          <div ref={analyticsRef} className="space-y-4">
            <h2 className="text-base font-semibold">Analytics</h2>
            <MonthlyGraph habits={displayHabits} year={year} month={month} />
          </div>

          {/* ── Motivation card ── */}
          {showMotivation && (
            <Card className="glass-card border-0 rounded-2xl animate-fade-in-up">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Flame className="size-4 text-orange-500" />
                  Motivation & Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="font-medium">{motivation.streakText}</div>
                {motivation.weekdayText && (
                  <div className="text-muted-foreground">{motivation.weekdayText}</div>
                )}
                {motivation.goalText && (
                  <div className="text-muted-foreground">{motivation.goalText}</div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── AI Insights ── */}
          <AIInsightsCard enabled={showAIInsights} />
        </div>
      )}
    </main>
  )
}

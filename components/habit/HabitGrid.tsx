"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import HabitRow from "@/components/habit/HabitRow"
import { toStartOfDayUTC, formatDateKeyUTC } from "@/utils/date"
import { TooltipProvider } from "@/components/ui/tooltip"

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

function getDaysInMonth(year: number, month: number) {
  // month is 1-12
  return new Date(year, month, 0).getDate()
}

type Props = {
  habits: DashboardHabit[]
  year: number
  month: number // 1-12
  onToggleHabit: (habitId: string, dateKey: string) => void
  onMarkDone: (habitId: string, dateKey: string) => void
}

export default function HabitGrid({ habits, year, month, onToggleHabit, onMarkDone }: Props) {
  const todayStartUTC = toStartOfDayUTC(new Date())
  const todayKey = formatDateKeyUTC(todayStartUTC)

  const days = React.useMemo(() => {
    const count = getDaysInMonth(year, month)
    return Array.from({ length: count }, (_, i) => i + 1)
  }, [year, month])

  const draggingToDoneRef = React.useRef(false)
  const toggledKeysRef = React.useRef<Set<string>>(new Set())

  const stopDrag = React.useCallback(() => {
    draggingToDoneRef.current = false
    toggledKeysRef.current.clear()
  }, [])

  const handlePointerDownCell = React.useCallback(
    (habitId: string, dateKey: string, isDone: boolean, isFuture: boolean) => {
      if (isFuture) return
      // Drag feature: only active when starting on an "undone" cell.
      // If the user starts from a done cell, we do a normal toggle and disable drag-mark.
      draggingToDoneRef.current = !isDone

      const key = `${habitId}|${dateKey}`
      if (toggledKeysRef.current.has(key)) return
      toggledKeysRef.current.add(key)
      onToggleHabit(habitId, dateKey)
    },
    [onToggleHabit]
  )

  const handlePointerEnterCell = React.useCallback(
    (habitId: string, dateKey: string, isDone: boolean, isFuture: boolean) => {
      if (!draggingToDoneRef.current) return
      if (isFuture) return
      if (isDone) return

      const key = `${habitId}|${dateKey}`
      if (toggledKeysRef.current.has(key)) return
      toggledKeysRef.current.add(key)
      onMarkDone(habitId, dateKey)
    },
    [onMarkDone]
  )

  return (
    <TooltipProvider delayDuration={150}>
      <div onPointerUp={stopDrag} onPointerCancel={stopDrag}>
      <div className="w-full overflow-x-auto">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 z-10 bg-background/90 backdrop-blur">Habit</TableHead>
            {days.map((day) => (
              <TableHead
                key={day}
                className={`px-1 text-center ${(() => {
                  const dateUtc = new Date(Date.UTC(year, month - 1, day))
                  const key = formatDateKeyUTC(dateUtc)
                  return key === todayKey ? "border-b-2 border-blue-400/80" : ""
                })()}`}
              >
                {day}
              </TableHead>
            ))}
            <TableHead className="w-36">Progress</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {habits.map((habit) => (
            <HabitRow
              key={habit._id}
              habit={habit}
              days={days}
              year={year}
              month={month}
              todayStartUTC={todayStartUTC}
              todayKey={todayKey}
              onPointerDownCell={handlePointerDownCell}
              onPointerEnterCell={handlePointerEnterCell}
            />
          ))}
        </TableBody>
        </Table>
      </div>
      </div>
    </TooltipProvider>
  )
}


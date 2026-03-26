"use client"

import * as React from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import ProgressBar from "@/components/habit/ProgressBar"
import HabitCell from "@/components/habit/HabitCell"
import { cn } from "@/lib/utils"
import { formatDateKeyUTC } from "@/utils/date"

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

type Props = {
  habit: DashboardHabit
  days: number[]
  year: number
  month: number // 1-12
  todayStartUTC: Date
  todayKey: string
  onPointerDownCell: (habitId: string, dateKey: string, isDone: boolean, isFuture: boolean) => void
  onPointerEnterCell: (habitId: string, dateKey: string, isDone: boolean, isFuture: boolean) => void
}

export default function HabitRow({
  habit,
  days,
  year,
  month,
  todayStartUTC,
  todayKey,
  onPointerDownCell,
  onPointerEnterCell,
}: Props) {
  return (
    <TableRow className="align-top">
      <TableCell className="font-medium sticky left-0 z-10 bg-background/90 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: habit.color }} />
          <span className="whitespace-nowrap">{habit.name}</span>
        </div>
      </TableCell>

      {days.map((day) => {
        const dateUtc = new Date(Date.UTC(year, month - 1, day))
        const dateKey = formatDateKeyUTC(dateUtc)
        const isToday = dateKey === todayKey
        const isFuture = dateUtc.getTime() > todayStartUTC.getTime()
        const isDone = habit.logs[dateKey] === true

        return (
          <TableCell
            key={day}
            className={`px-1 py-0 text-center ${isToday ? "shadow-[inset_0_-2px_0_rgba(59,130,246,0.65)]" : ""}`}
          >
            <HabitCell
              dateKey={dateKey}
              isDone={isDone}
              isFuture={isFuture}
              isToday={isToday}
              habitColor={habit.color}
              onPointerDown={() => onPointerDownCell(habit._id, dateKey, isDone, isFuture)}
              onPointerEnter={() => onPointerEnterCell(habit._id, dateKey, isDone, isFuture)}
            />
          </TableCell>
        )
      })}

      <TableCell className="w-36">
        <ProgressBar value={habit.progress} />
        <div className={cn("mt-1 text-xs text-muted-foreground tabular-nums")}>
          {habit.completedDays}/{habit.goalPerMonth}
        </div>
      </TableCell>
    </TableRow>
  )
}


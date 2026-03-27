"use client"

import * as React from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import ProgressBar from "@/components/habit/ProgressBar"
import HabitCell from "@/components/habit/HabitCell"
import { cn } from "@/lib/utils"
import { formatDateKeyUTC } from "@/utils/date"
import { GripVertical } from "lucide-react"
import type { DraggableProvidedDragHandleProps, DraggableProvidedDraggableProps } from "@hello-pangea/dnd"

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
  month: number
  todayStartUTC: Date
  todayKey: string
  onPointerDownCell: (habitId: string, dateKey: string, isDone: boolean, isFuture: boolean) => void
  onPointerEnterCell: (habitId: string, dateKey: string, isDone: boolean, isFuture: boolean) => void
  // Drag-and-drop props (optional for backward compatibility)
  dragHandleProps?: DraggableProvidedDragHandleProps | null
  draggableProps?: DraggableProvidedDraggableProps
  innerRef?: React.Ref<HTMLTableRowElement>
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
  dragHandleProps,
  draggableProps,
  innerRef,
}: Props) {
  return (
    <TableRow
      ref={innerRef}
      {...draggableProps}
      className="align-top group hover:bg-muted/30 transition-colors"
    >
      {/* Drag handle */}
      <TableCell className="sticky left-0 z-10 bg-background/95 backdrop-blur w-7 p-0 pl-1">
        <div
          {...(dragHandleProps ?? {})}
          className="flex items-center justify-center h-full w-5 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-muted-foreground"
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-3.5" />
        </div>
      </TableCell>

      {/* Name */}
      <TableCell className="font-medium sticky left-7 z-10 bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full shadow-sm"
            style={{ backgroundColor: habit.color, boxShadow: `0 0 6px ${habit.color}70` }}
          />
          <span className="whitespace-nowrap text-sm">{habit.name}</span>
        </div>
      </TableCell>

      {/* Day cells */}
      {days.map((day) => {
        const dateUtc = new Date(Date.UTC(year, month - 1, day))
        const dateKey = formatDateKeyUTC(dateUtc)
        const isToday = dateKey === todayKey
        const isFuture = dateUtc.getTime() > todayStartUTC.getTime()
        const isDone = habit.logs[dateKey] === true

        return (
          <TableCell
            key={day}
            className={cn("px-1 py-0 text-center", isToday && "bg-primary/5")}
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

      {/* Progress */}
      <TableCell className="w-36">
        <ProgressBar value={habit.progress} />
        <div className={cn("mt-1 text-xs text-muted-foreground tabular-nums")}>
          {habit.completedDays}/{habit.goalPerMonth}d
        </div>
      </TableCell>
    </TableRow>
  )
}

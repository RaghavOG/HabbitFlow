"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type Props = {
  dateKey: string
  isDone: boolean
  isFuture: boolean
  isToday: boolean
  habitColor: string
  onClick: () => void
  onPointerDown: () => void
  onPointerEnter: () => void
}

export default function HabitCell({
  dateKey,
  isDone,
  isFuture,
  isToday,
  habitColor,
  onClick,
  onPointerDown,
  onPointerEnter,
}: Props) {
  const bg = isFuture ? "#d1d5db" : isDone ? habitColor : "#1f2937"

  return (
    <div className="px-0 py-1">
      <button
        type="button"
        onClick={onClick}
        onPointerDown={onPointerDown}
        onPointerEnter={onPointerEnter}
        disabled={isFuture}
        aria-label={
          isFuture ? `Future day` : `${dateKey} ${isDone ? "mark undone" : "mark done"}`
        }
        className={cn(
          "h-6 w-6 rounded-md border border-transparent transition-colors",
          "hover:brightness-110 active:brightness-95",
          "disabled:cursor-not-allowed disabled:opacity-70",
          isToday && "ring-2 ring-blue-400"
        )}
        style={{ backgroundColor: bg }}
      />
    </div>
  )
}


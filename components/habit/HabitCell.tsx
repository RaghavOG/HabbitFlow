"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type Props = {
  dateKey: string
  isDone: boolean
  isFuture: boolean
  isToday: boolean
  habitColor: string
  onPointerDown: () => void
  onPointerEnter: () => void
}

export default function HabitCell({
  dateKey,
  isDone,
  isFuture,
  isToday,
  habitColor,
  onPointerDown,
  onPointerEnter,
}: Props) {
  const bg = isFuture ? "#d1d5db" : isDone ? habitColor : "#1f2937"

  return (
    <div className="px-0 py-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onPointerDown={onPointerDown}
            onPointerEnter={onPointerEnter}
            disabled={isFuture}
            aria-label={
              isFuture ? `Future day` : `${dateKey} ${isDone ? "mark undone" : "mark done"}`
            }
            className={cn(
              "h-6 w-6 sm:h-7 sm:w-7 rounded-lg border border-transparent transition-colors",
              "transform-gpu hover:scale-[1.08] hover:brightness-110 active:brightness-95",
              "disabled:cursor-not-allowed disabled:opacity-70",
              "cursor-pointer",
              "ring-offset-2",
              isToday && "ring-2 ring-blue-400/80"
            )}
            style={{ backgroundColor: bg }}
          />
        </TooltipTrigger>
        <TooltipContent>
          <div className="font-medium">{dateKey}</div>
          <div className="text-muted-foreground text-xs">
            {isFuture ? "Future" : isDone ? "Done" : "Not done"}
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}


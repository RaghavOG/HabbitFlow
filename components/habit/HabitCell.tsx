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
              "h-6 w-6 sm:h-7 sm:w-7 rounded-lg border border-transparent transition-all duration-150",
              "transform-gpu hover:scale-[1.15] active:scale-95",
              "disabled:cursor-not-allowed disabled:opacity-40",
              "cursor-pointer ring-offset-background",
              isDone && "shadow-sm",
              isToday && "ring-2 ring-primary/70 ring-offset-1",
              !isDone && !isFuture && "hover:border-primary/30 hover:bg-primary/8",
            )}
            style={{
              backgroundColor: isFuture
                ? "var(--muted)"
                : isDone
                ? habitColor
                : undefined,
              boxShadow: isDone ? `0 0 8px ${habitColor}50` : undefined,
            }}
          />
        </TooltipTrigger>
        <TooltipContent className="text-xs">
          <div className="font-semibold">{dateKey}</div>
          <div className="text-muted-foreground">
            {isFuture ? "Future" : isDone ? "✓ Done" : "Not done"}
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

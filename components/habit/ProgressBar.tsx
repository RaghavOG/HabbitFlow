"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export default function ProgressBar({ value }: { value: number }) {
  const safe = Math.max(0, Math.min(100, value))
  const rounded = Math.round(safe)

  const colorClass =
    rounded >= 80
      ? "from-emerald-500 to-green-400"
      : rounded >= 50
      ? "from-blue-500 to-cyan-400"
      : rounded >= 25
      ? "from-yellow-500 to-amber-400"
      : "from-red-500 to-rose-400"

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative w-20 h-1.5 rounded-full overflow-hidden bg-muted">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ease-out", colorClass)}
          style={{ width: `${safe}%` }}
        />
      </div>
      <span className={cn(
        "tabular-nums text-xs font-medium",
        rounded >= 80 ? "text-emerald-500" :
        rounded >= 50 ? "text-blue-500" :
        rounded >= 25 ? "text-yellow-500" :
        "text-red-500"
      )}>
        {rounded}%
      </span>
    </div>
  )
}

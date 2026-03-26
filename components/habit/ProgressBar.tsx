"use client"

import * as React from "react"

export default function ProgressBar({ value }: { value: number }) {
  const safe = Math.max(0, Math.min(100, value))
  const rounded = Math.round(safe)
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-24 h-2 rounded-full overflow-hidden bg-zinc-800 group">
        <div
          className="h-full transition-[width] duration-500 ease-out bg-gradient-to-r from-green-500 to-blue-500"
          style={{ width: `${safe}%` }}
        />
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-zinc-950/90 text-xs text-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        >
          {rounded}%
        </div>
      </div>
      <span className="tabular-nums text-xs text-zinc-400">{rounded}%</span>
    </div>
  )
}


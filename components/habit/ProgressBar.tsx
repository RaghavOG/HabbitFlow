"use client"

import * as React from "react"
import { Progress } from "@/components/ui/progress"

export default function ProgressBar({ value }: { value: number }) {
  const safe = Math.max(0, Math.min(100, value))
  return (
    <div className="flex items-center gap-2">
      <div className="w-24">
        <Progress value={safe} />
      </div>
      <span className="tabular-nums text-xs text-muted-foreground">{Math.round(safe)}%</span>
    </div>
  )
}


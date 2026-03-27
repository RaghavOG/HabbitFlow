"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { daysInMonthUTC } from "@/utils/date"
import { Plus } from "lucide-react"

const PRESET_COLORS = [
  "#22c55e", // green
  "#3b82f6", // blue
  "#a855f7", // purple
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#06b6d4", // cyan
  "#f97316", // orange
] as const

function clampInt(n: number, min: number, max: number) {
  const x = Math.trunc(Number.isFinite(n) ? n : min)
  return Math.max(min, Math.min(max, x))
}

export default function AddHabitDialog({
  onCreated,
  year,
  month,
}: {
  onCreated?: () => void
  year?: number
  month?: number
}) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [color, setColor] = React.useState("#22c55e")
  const [goalPerMonth, setGoalPerMonth] = React.useState<number>(31)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const maxDays = React.useMemo(() => {
    const now = new Date()
    const y = year ?? now.getUTCFullYear()
    const m = month ?? now.getUTCMonth() + 1
    return daysInMonthUTC(y, m)
  }, [month, year])

  React.useEffect(() => {
    setGoalPerMonth((g) => (g === 31 ? maxDays : clampInt(g, 1, maxDays)))
  }, [maxDays])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-xl btn-glow font-medium">
          <Plus className="size-4 mr-1.5" />
          Add Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl glass-card border-0">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">New Habit</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a habit to track in the monthly grid.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-xl px-3 py-2">{error}</div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Habit Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Morning Run"
              className="rounded-xl"
              autoFocus
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => {
                const active = c.toLowerCase() === color.toLowerCase()
                return (
                  <button
                    key={c}
                    type="button"
                    className={[
                      "h-8 w-8 rounded-xl border-2 transition-all duration-150",
                      active
                        ? "border-foreground scale-110 shadow-md"
                        : "border-transparent hover:scale-105 hover:border-border",
                    ].join(" ")}
                    style={{
                      backgroundColor: c,
                      boxShadow: active ? `0 0 12px ${c}80` : undefined,
                    }}
                    onClick={() => setColor(c)}
                    aria-label={`Set color ${c}`}
                  />
                )
              })}
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-8 w-10 rounded-xl p-0.5 cursor-pointer"
                aria-label="Custom color"
              />
            </div>
            <div className="text-xs text-muted-foreground tabular-nums font-mono">{color}</div>
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Monthly Goal</label>
              <span className="text-xs text-muted-foreground">1–{maxDays} days</span>
            </div>
            <Input
              type="number"
              value={goalPerMonth}
              onChange={(e) => setGoalPerMonth(clampInt(Number(e.target.value), 1, maxDays))}
              min={1}
              max={maxDays}
              step={1}
              className="rounded-xl"
            />
          </div>

          <Button
            className="w-full rounded-xl btn-glow font-medium"
            disabled={loading || !name.trim()}
            onClick={async () => {
              setError(null)
              setLoading(true)
              try {
                const res = await fetch("/api/habits", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name, color, goalPerMonth: clampInt(goalPerMonth, 1, maxDays) }),
                  credentials: "include",
                })
                const json = (await res.json()) as { error?: string }
                if (!res.ok) throw new Error(json.error || "Failed to create habit")
                setName("")
                setColor("#22c55e")
                setGoalPerMonth(maxDays)
                setOpen(false)
                onCreated?.()
              } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "Failed to create habit")
              } finally {
                setLoading(false)
              }
            }}
          >
            {loading ? (
              <>
                <Spinner className="mr-2" /> Creating…
              </>
            ) : (
              "Create Habit"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

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

export default function AddHabitDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [color, setColor] = React.useState("#22c55e")
  const [goalPerMonth, setGoalPerMonth] = React.useState<number>(20)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add Habit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Habit</DialogTitle>
          <DialogDescription>Create a new habit for the monthly grid.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {error && <div className="text-sm text-destructive">{error}</div>}
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Name</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Gym" />
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Color</div>
            <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9" />
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Goal (days/month)</div>
            <Input
              type="number"
              value={goalPerMonth}
              onChange={(e) => setGoalPerMonth(Number(e.target.value))}
              min={1}
            />
          </div>

          <Button
            className="w-full"
            disabled={loading}
            onClick={async () => {
              setError(null)
              setLoading(true)
              try {
                const res = await fetch("/api/habits", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name, color, goalPerMonth }),
                  credentials: "include",
                })
                const json = (await res.json()) as { error?: string }
                if (!res.ok) throw new Error(json.error || "Failed to create habit")
                setName("")
                setColor("#22c55e")
                setGoalPerMonth(20)
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
                <Spinner className="mr-2" /> Creating...
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


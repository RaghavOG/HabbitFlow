"use client"

import * as React from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { MoreHorizontal, PencilLine, Trash2 } from "lucide-react"

type HabitLike = {
  _id: string
  name: string
  color: string
  goalPerMonth: number
}

export default function HabitActionsMenu({
  habit,
  onSaved,
  onDeleted,
}: {
  habit: HabitLike
  onSaved: () => void
  onDeleted: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState(habit.name)
  const [color, setColor] = React.useState(habit.color)
  const [goalPerMonth, setGoalPerMonth] = React.useState<number>(habit.goalPerMonth)
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      setName(habit.name)
      setColor(habit.color)
      setGoalPerMonth(habit.goalPerMonth)
    }
  }, [habit.color, habit.goalPerMonth, habit.name, open])

  const save = async () => {
    if (!name.trim()) return toast.error("Name is required")
    if (!Number.isFinite(goalPerMonth) || goalPerMonth < 1) return toast.error("Goal must be >= 1")

    setSaving(true)
    try {
      const res = await fetch(`/api/habits/${habit._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim(), color: color.trim(), goalPerMonth }),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(json.error || "Failed to update habit")

      setOpen(false)
      onSaved()
      toast.success("Habit updated")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update habit")
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/habits/${habit._id}`, { method: "DELETE", credentials: "include" })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(json.error || "Failed to delete habit")
      onDeleted()
      toast.success("Habit deleted")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete habit")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl"
            aria-label={`Habit actions for ${habit.name}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => {
              setOpen(true)
            }}
          >
            <PencilLine className="mr-2 size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            disabled={deleting}
            onSelect={() => {
              void remove()
            }}
          >
            <Trash2 className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit habit</DialogTitle>
            <DialogDescription>Update name, color, or your monthly goal.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`name-${habit._id}`}>Name</Label>
              <Input
                id={`name-${habit._id}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Gym"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`color-${habit._id}`}>Color</Label>
              <Input
                id={`color-${habit._id}`}
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`goal-${habit._id}`}>Goal (days/month)</Label>
              <Input
                id={`goal-${habit._id}`}
                type="number"
                min={1}
                value={goalPerMonth}
                onChange={(e) => setGoalPerMonth(Number(e.target.value))}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={() => void save()} disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


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
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function AddHabitDialog() {
  const [name, setName] = React.useState("")
  const [color, setColor] = React.useState("#22c55e")
  const [goalPerMonth, setGoalPerMonth] = React.useState<number>(20)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">Add Habit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Habit</DialogTitle>
          <DialogDescription>This UI is ready; backend endpoint integration comes next.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
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

          <Card className="p-3 text-sm text-muted-foreground">
            Backend `POST /api/habits` is not implemented yet, so Submit is disabled.
          </Card>

          <Button disabled className="w-full">
            Submit (disabled)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


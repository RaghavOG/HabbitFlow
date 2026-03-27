"use client"

import * as React from "react"
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  type DroppableProvided,
  type DraggableProvided,
} from "@hello-pangea/dnd"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import HabitRow from "@/components/habit/HabitRow"
import { toStartOfDayUTC, formatDateKeyUTC } from "@/utils/date"
import { TooltipProvider } from "@/components/ui/tooltip"
import { GripVertical } from "lucide-react"

type DashboardHabit = {
  _id: string
  name: string
  color: string
  goalPerMonth: number
  completedDays: number
  successRate: number
  streak: number
  progress: number
  logs: Record<string, boolean>
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

type Props = {
  habits: DashboardHabit[]
  year: number
  month: number
  onToggleHabit: (habitId: string, dateKey: string) => void
  onMarkDone: (habitId: string, dateKey: string) => void
  onReorder?: (habits: DashboardHabit[]) => void
}

export default function HabitGrid({ habits, year, month, onToggleHabit, onMarkDone, onReorder }: Props) {
  const todayStartUTC = toStartOfDayUTC(new Date())
  const todayKey = formatDateKeyUTC(todayStartUTC)
  const scrollWrapRef = React.useRef<HTMLDivElement | null>(null)

  // Local ordered state for optimistic drag
  const [ordered, setOrdered] = React.useState<DashboardHabit[]>(habits)

  React.useEffect(() => {
    setOrdered(habits)
  }, [habits])

  const days = React.useMemo(() => {
    const count = getDaysInMonth(year, month)
    return Array.from({ length: count }, (_, i) => i + 1)
  }, [year, month])

  const draggingToDoneRef = React.useRef(false)
  const toggledKeysRef = React.useRef<Set<string>>(new Set())

  const stopDrag = React.useCallback(() => {
    draggingToDoneRef.current = false
    toggledKeysRef.current.clear()
  }, [])

  const handlePointerDownCell = React.useCallback(
    (habitId: string, dateKey: string, isDone: boolean, isFuture: boolean) => {
      if (isFuture) return
      draggingToDoneRef.current = !isDone
      const key = `${habitId}|${dateKey}`
      if (toggledKeysRef.current.has(key)) return
      toggledKeysRef.current.add(key)
      onToggleHabit(habitId, dateKey)
    },
    [onToggleHabit]
  )

  const handlePointerEnterCell = React.useCallback(
    (habitId: string, dateKey: string, isDone: boolean, isFuture: boolean) => {
      if (!draggingToDoneRef.current) return
      if (isFuture) return
      if (isDone) return
      const key = `${habitId}|${dateKey}`
      if (toggledKeysRef.current.has(key)) return
      toggledKeysRef.current.add(key)
      onMarkDone(habitId, dateKey)
    },
    [onMarkDone]
  )

  React.useEffect(() => {
    const wrap = scrollWrapRef.current
    if (!wrap) return
    const target = wrap.querySelector<HTMLElement>(`[data-date-key="${todayKey}"]`)
    if (!target) return
    target.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" })
  }, [todayKey, month, year, habits.length])

  function onDragEnd(result: DropResult) {
    if (!result.destination) return
    const src = result.source.index
    const dst = result.destination.index
    if (src === dst) return

    const next = Array.from(ordered)
    const [removed] = next.splice(src, 1)
    next.splice(dst, 0, removed)
    setOrdered(next)
    onReorder?.(next)
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div onPointerUp={stopDrag} onPointerCancel={stopDrag}>
        <div ref={scrollWrapRef} className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {/* Drag handle placeholder column */}
                <TableHead className="sticky left-0 z-10 bg-background/95 backdrop-blur w-7 p-0" />
                <TableHead className="sticky left-7 z-10 bg-background/95 backdrop-blur font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Habit
                </TableHead>
                {days.map((day) => {
                  const dateUtc = new Date(Date.UTC(year, month - 1, day))
                  const key = formatDateKeyUTC(dateUtc)
                  const isToday = key === todayKey
                  return (
                    <TableHead
                      key={day}
                      data-date-key={key}
                      className={`px-1 text-center text-xs text-muted-foreground ${
                        isToday ? "text-primary font-semibold border-b border-primary/60" : ""
                      }`}
                    >
                      {day}
                    </TableHead>
                  )
                })}
                <TableHead className="w-36 text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Progress
                </TableHead>
              </TableRow>
            </TableHeader>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="habit-rows">
                {(provided: DroppableProvided) => (
                  <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                    {ordered.map((habit, index) => (
                      <Draggable key={habit._id} draggableId={habit._id} index={index}>
                        {(draggableProvided: DraggableProvided) => (
                          <HabitRow
                            habit={habit}
                            days={days}
                            year={year}
                            month={month}
                            todayStartUTC={todayStartUTC}
                            todayKey={todayKey}
                            onPointerDownCell={handlePointerDownCell}
                            onPointerEnterCell={handlePointerEnterCell}
                            dragHandleProps={draggableProvided.dragHandleProps}
                            draggableProps={draggableProvided.draggableProps}
                            innerRef={draggableProvided.innerRef}
                          />
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </TableBody>
                )}
              </Droppable>
            </DragDropContext>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  )
}

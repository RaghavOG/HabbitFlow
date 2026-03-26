import { NextResponse } from "next/server"
import { connectToMongo } from "@/lib/mongodb"
import { HabitLogModel } from "@/models/HabitLog"
import { formatDateKeyUTC } from "@/utils/date"
import type { Types } from "mongoose"

export async function POST(req: Request) {
  await connectToMongo()

  const body = (await req.json()) as { habitId?: string; date?: string | Date | number }
  const habitId = body.habitId
  const dateInput = body.date

  if (!habitId || !dateInput) {
    return NextResponse.json({ error: "Missing habitId or date" }, { status: 400 })
  }

  type ToggleResult = { habitId: Types.ObjectId; date: Date; status: boolean }
  const HabitLogWithToggle = HabitLogModel as unknown as {
    toggleHabitForDate: (habitId: string, dateInput: string | Date | number) => Promise<ToggleResult>
  }
  const updated = await HabitLogWithToggle.toggleHabitForDate(habitId, dateInput)

  return NextResponse.json({
    habitId: String(updated.habitId),
    date: formatDateKeyUTC(updated.date),
    status: updated.status,
  })
}


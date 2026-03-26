import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectToMongo } from "@/lib/mongodb"
import { HabitLogModel } from "@/models/HabitLog"
import { HabitModel } from "@/models/Habit"
import { formatDateKeyUTC } from "@/utils/date"
import type { Types } from "mongoose"
import { getUserIdFromRequestCookie } from "@/lib/auth"

export async function POST(req: Request) {
  await connectToMongo()

  const userId = await getUserIdFromRequestCookie()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = (await req.json()) as { habitId?: string; date?: string | Date | number }
  const habitId = body.habitId
  const dateInput = body.date

  if (!habitId || !dateInput) {
    return NextResponse.json({ error: "Missing habitId or date" }, { status: 400 })
  }
  if (!mongoose.Types.ObjectId.isValid(habitId)) {
    return NextResponse.json({ error: "Invalid habit id" }, { status: 400 })
  }

  const habit = await HabitModel.findOne({
    _id: new mongoose.Types.ObjectId(habitId),
    userId: new mongoose.Types.ObjectId(userId),
  })
    .select({ _id: 1 })
    .lean()
  if (!habit) return NextResponse.json({ error: "Habit not found" }, { status: 404 })

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


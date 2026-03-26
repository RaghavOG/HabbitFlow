import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectToMongo } from "@/lib/mongodb"
import { getUserIdFromRequestCookie } from "@/lib/auth"
import { HabitModel } from "@/models/Habit"
import { HabitLogModel } from "@/models/HabitLog"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ habitId: string }> }
) {
  await connectToMongo()

  const userId = await getUserIdFromRequestCookie()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { habitId } = await params
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

  const url = new URL(req.url)
  const now = new Date()
  const year = Number(url.searchParams.get("year")) || now.getFullYear()
  const month = Number(url.searchParams.get("month")) || now.getMonth() + 1

  const HabitLogWithHelpers = HabitLogModel as unknown as {
    getLogsForHabitForMonth: (habitIdArg: string, yearArg: number, monthArg: number) => Promise<
      Array<{ _id: mongoose.Types.ObjectId; habitId: mongoose.Types.ObjectId; date: Date; status: boolean }>
    >
  }

  const logs = await HabitLogWithHelpers.getLogsForHabitForMonth(habitId, year, month)
  return NextResponse.json({
    habitId,
    year,
    month,
    logs: logs.map((l) => ({
      _id: String(l._id),
      habitId: String(l.habitId),
      date: l.date,
      status: l.status,
    })),
  })
}


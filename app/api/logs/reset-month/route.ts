import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectToMongo } from "@/lib/mongodb"
import { getUserIdFromRequestCookie } from "@/lib/auth"
import { HabitModel } from "@/models/Habit"
import { HabitLogModel } from "@/models/HabitLog"
import { getMonthRangeUTC } from "@/utils/date"

export async function DELETE(req: Request) {
  await connectToMongo()

  const userId = await getUserIdFromRequestCookie()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const year = Number(url.searchParams.get("year"))
  const month = Number(url.searchParams.get("month")) // 1-12

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: "Missing or invalid year/month" }, { status: 400 })
  }

  const { start, endExclusive } = getMonthRangeUTC(year, month)
  const userObjectId = new mongoose.Types.ObjectId(userId)

  const habits = await HabitModel.find({ userId: userObjectId }).select({ _id: 1 }).lean()
  const habitIds = habits.map((h) => h._id)

  if (!habitIds.length) return NextResponse.json({ ok: true })

  await HabitLogModel.deleteMany({
    habitId: { $in: habitIds },
    date: { $gte: start, $lt: endExclusive },
  })

  return NextResponse.json({ ok: true })
}


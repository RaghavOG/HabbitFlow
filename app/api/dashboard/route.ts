import { NextResponse } from "next/server"
import { connectToMongo } from "@/lib/mongodb"
import { HabitModel } from "@/models/Habit"
import { HabitLogModel } from "@/models/HabitLog"
import { formatDateKeyUTC, getMonthRangeUTC } from "@/utils/date"
import type { Model, Types } from "mongoose"
import { requireMongoUserIdFromClerk } from "@/lib/auth"

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

export async function GET(req: Request) {
  await connectToMongo()

  let userId: string
  try {
    userId = await requireMongoUserIdFromClerk()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(req.url)
  const now = new Date()
  const year = Number(url.searchParams.get("year")) || now.getFullYear()
  const month = Number(url.searchParams.get("month")) || now.getMonth() + 1 // 1-12

  // 1) Get all habits.
  type HabitDoc = {
    _id: Types.ObjectId
    userId: Types.ObjectId
    name: string
    color: string
    goalPerMonth: number
  }
  const HabitsWithHelpers = HabitModel as unknown as {
    getAllHabits: (userId?: string | Types.ObjectId) => Promise<HabitDoc[]>
  }
  const habits = await HabitsWithHelpers.getAllHabits(userId)

  const habitIds = habits.map((h) => h._id)
  const { start, endExclusive } = getMonthRangeUTC(year, month)

  // 2) Get all logs for all habits in the month in ONE query.
  type HabitLogMonthDoc = { habitId: Types.ObjectId; date: Date; status: boolean }
  const HabitLog = HabitLogModel as unknown as Model<HabitLogMonthDoc>
  const monthLogs = await HabitLog.find({
    habitId: { $in: habitIds },
    date: { $gte: start, $lt: endExclusive },
  })
    .select({ habitId: 1, date: 1, status: 1 })
    .lean()
    .exec()

  // 3) Build date->status map + completed/total counts from month logs.
  const logsByHabit: Record<string, Record<string, boolean>> = {}
  const completedDaysByHabit: Record<string, number> = {}
  const totalTrackedDaysByHabit: Record<string, number> = {}

  for (const log of monthLogs) {
    const habitId = String(log.habitId)
    const dateKey = formatDateKeyUTC(log.date)

    if (!logsByHabit[habitId]) logsByHabit[habitId] = {}
    logsByHabit[habitId][dateKey] = log.status

    totalTrackedDaysByHabit[habitId] = (totalTrackedDaysByHabit[habitId] ?? 0) + 1
    if (log.status) completedDaysByHabit[habitId] = (completedDaysByHabit[habitId] ?? 0) + 1
  }

  // 4) Calculate per-habit streak (needs history up to today).
  const dashboardHabits: DashboardHabit[] = []
  type HabitLogWithStreak = {
    calculateStreak: (habitId: Types.ObjectId, todayInput: Date) => Promise<number>
  }
  const HabitLogWithStreak = HabitLogModel as unknown as HabitLogWithStreak

  for (const habit of habits) {
    const habitId = String(habit._id)
    const completedDays = completedDaysByHabit[habitId] ?? 0
    const totalTrackedDays = totalTrackedDaysByHabit[habitId] ?? 0

    const successRate = totalTrackedDays === 0 ? 0 : (completedDays / totalTrackedDays) * 100
    const progress = habit.goalPerMonth > 0 ? (completedDays / habit.goalPerMonth) * 100 : 0

    const streak = await HabitLogWithStreak.calculateStreak(habit._id, new Date())

    dashboardHabits.push({
      _id: habitId,
      name: habit.name,
      color: habit.color,
      goalPerMonth: habit.goalPerMonth,
      completedDays,
      successRate,
      streak,
      progress,
      logs: logsByHabit[habitId] ?? {},
    })
  }

  return NextResponse.json({
    year,
    month,
    habits: dashboardHabits,
  })
}


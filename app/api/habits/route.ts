import { NextResponse } from "next/server"
import mongoose, { type Types } from "mongoose"
import { connectToMongo } from "@/lib/mongodb"
import { getUserIdFromRequestCookie } from "@/lib/auth"
import { HabitModel } from "@/models/Habit"

type HabitDoc = {
  _id: Types.ObjectId
  userId: Types.ObjectId
  name: string
  color: string
  goalPerMonth: number
}

type HabitWithHelpers = mongoose.Model<HabitDoc> & {
  getAllHabits: (userId?: string | Types.ObjectId) => Promise<HabitDoc[]>
}

function toResponseHabit(h: HabitDoc) {
  return {
    _id: String(h._id),
    userId: String(h.userId),
    name: h.name,
    color: h.color,
    goalPerMonth: h.goalPerMonth,
  }
}

export async function GET() {
  await connectToMongo()

  const userId = await getUserIdFromRequestCookie()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const habits = await (HabitModel as unknown as HabitWithHelpers).getAllHabits(userId)
  return NextResponse.json({ habits: habits.map(toResponseHabit) })
}

export async function POST(req: Request) {
  await connectToMongo()

  const userId = await getUserIdFromRequestCookie()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = (await req.json()) as { name?: string; color?: string; goalPerMonth?: number }
  const name = (body.name ?? "").trim()
  const color = (body.color ?? "").trim() || "#22c55e"
  const goalPerMonth = Number(body.goalPerMonth ?? 20)

  if (!name) return NextResponse.json({ error: "Habit name is required" }, { status: 400 })
  if (!Number.isFinite(goalPerMonth) || goalPerMonth < 1) {
    return NextResponse.json({ error: "goalPerMonth must be >= 1" }, { status: 400 })
  }

  const habit = await HabitModel.create({
    userId: new mongoose.Types.ObjectId(userId),
    name,
    color,
    goalPerMonth,
  })

  return NextResponse.json({ habit: toResponseHabit(habit as unknown as HabitDoc) }, { status: 201 })
}


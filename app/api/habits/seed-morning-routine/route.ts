import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectToMongo } from "@/lib/mongodb"
import { requireMongoUserIdFromClerk } from "@/lib/auth"
import { HabitModel } from "@/models/Habit"
import { daysInMonthUTC } from "@/utils/date"

const PRESET_COLORS = ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b", "#f43f5e"] as const

const MORNING_ROUTINE_HABITS = [
  "Wake up early",
  "Brush (Morning)",
  "Facewash (Morning)",
  "Drink Water 1",
  "Soak Dry Fruits",
  "Breathing (Anulom Vilom)",
  "Running",
  "Exercise",
  "Sunscreen",
  "Drink Water 2",
] as const

const AFTERNOON_HABITS = ["Eat Soaked Dry Fruits", "Drink Water 3", "Drink Water 4"] as const
const EVENING_HABITS = ["Walk 10,000 Steps", "Drink Water 5"] as const
const NIGHT_HABITS = ["Brush (Night)", "Facewash (Night)", "Under Eye Gel", "Sleep on Time"] as const

function colorForHabitName(name: string): string {
  if ((MORNING_ROUTINE_HABITS as readonly string[]).includes(name)) return "#22c55e" // morning: green
  if ((AFTERNOON_HABITS as readonly string[]).includes(name)) return "#3b82f6" // afternoon: blue
  if ((EVENING_HABITS as readonly string[]).includes(name)) return "#f59e0b" // evening: amber
  if ((NIGHT_HABITS as readonly string[]).includes(name)) return "#a855f7" // night: purple
  return PRESET_COLORS[Math.abs(name.length) % PRESET_COLORS.length]
}

export async function POST(req: Request) {
  await connectToMongo()

  let userId: string
  try {
    userId = await requireMongoUserIdFromClerk()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userObjectId = new mongoose.Types.ObjectId(userId)
  const body = (await req.json().catch(() => ({}))) as { year?: number; month?: number }
  const now = new Date()
  const year = Number(body.year ?? now.getUTCFullYear())
  const month = Number(body.month ?? now.getUTCMonth() + 1)
  const goalPerMonth = daysInMonthUTC(year, month)

  const names = [
    ...MORNING_ROUTINE_HABITS,
    ...AFTERNOON_HABITS,
    ...EVENING_HABITS,
    ...NIGHT_HABITS,
  ]

  const existing = (await HabitModel.find({ userId: userObjectId, name: { $in: names } })
    .select({ name: 1 })
    .lean()) as unknown as Array<{ name: string }>

  const existingNames = new Set(existing.map((h) => h.name))
  const toCreate = names.filter((n) => !existingNames.has(n))

  if (toCreate.length === 0) {
    return NextResponse.json({ ok: true, created: 0, skipped: names.length })
  }

  const docs = toCreate.map((name, idx) => ({
    userId: userObjectId,
    name,
    color: colorForHabitName(name) || PRESET_COLORS[idx % PRESET_COLORS.length],
    goalPerMonth,
  }))

  await HabitModel.insertMany(docs, { ordered: false })

  return NextResponse.json({ ok: true, created: toCreate.length, skipped: names.length - toCreate.length })
}


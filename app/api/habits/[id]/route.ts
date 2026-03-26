import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectToMongo } from "@/lib/mongodb"
import { getUserIdFromRequestCookie } from "@/lib/auth"
import { HabitModel } from "@/models/Habit"
import { HabitLogModel } from "@/models/HabitLog"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToMongo()

  const userId = await getUserIdFromRequestCookie()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid habit id" }, { status: 400 })
  }

  const objectId = new mongoose.Types.ObjectId(id)
  const deletedHabit = await HabitModel.findOneAndDelete({
    _id: objectId,
    userId: new mongoose.Types.ObjectId(userId),
  })

  if (!deletedHabit) {
    return NextResponse.json({ error: "Habit not found" }, { status: 404 })
  }

  await HabitLogModel.deleteMany({ habitId: objectId })
  return NextResponse.json({ ok: true })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToMongo()

  const userId = await getUserIdFromRequestCookie()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = (await req.json()) as { name?: string; color?: string; goalPerMonth?: number }
  const { id } = await params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid habit id" }, { status: 400 })
  }

  const name = (body.name ?? "").trim()
  const color = (body.color ?? "").trim()
  const goalPerMonth = body.goalPerMonth

  const update: Record<string, unknown> = {}
  if (name) update.name = name
  if (color) update.color = color
  if (goalPerMonth !== undefined) {
    if (!Number.isFinite(goalPerMonth) || goalPerMonth < 1) {
      return NextResponse.json({ error: "goalPerMonth must be >= 1" }, { status: 400 })
    }
    update.goalPerMonth = goalPerMonth
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
  }

  const updated = await HabitModel.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    },
    { $set: update },
    { new: true }
  ).lean()

  if (!updated) return NextResponse.json({ error: "Habit not found" }, { status: 404 })

  return NextResponse.json({ ok: true, habit: updated })
}


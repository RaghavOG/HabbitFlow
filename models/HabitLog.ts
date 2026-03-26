import mongoose, { Schema, type HydratedDocument, type Types } from "mongoose"
import {
  getMonthRangeUTC,
  toStartOfDayUTC,
} from "@/utils/date"
import { calculateStreakFromCompletedDatesDesc } from "@/utils/habitStats"

export interface IHabitLog {
  habitId: Types.ObjectId
  date: Date
  status: boolean
}

const HabitLogSchema = new Schema<IHabitLog>(
  {
    habitId: { type: Schema.Types.ObjectId, ref: "Habit", required: true, index: true },
    // Stored as a date-only value (normalized to UTC midnight)
    date: {
      type: Date,
      required: true,
      set: (v: Date | string | number) => toStartOfDayUTC(v),
    },
    status: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
)

// One log per habit per day.
HabitLogSchema.index({ habitId: 1, date: 1 }, { unique: true })
HabitLogSchema.index({ habitId: 1 })
HabitLogSchema.index({ date: 1 })

export type HabitLogDocument = HydratedDocument<IHabitLog>

// ---- Required operations (model helpers) ----

// Toggle habit status for a specific date.
// - If the log exists, toggle `status`.
// - If it doesn't exist, create a completed (`status: true`) log.
HabitLogSchema.statics.toggleHabitForDate = async function (
  habitId: string | Types.ObjectId,
  dateInput: Date | string | number
): Promise<HabitLogDocument> {
  const day = toStartOfDayUTC(dateInput)

  const habitObjectId = typeof habitId === "string" ? new mongoose.Types.ObjectId(habitId) : habitId

  const existing = await this.findOne({ habitId: habitObjectId, date: day })
  if (existing) {
    existing.status = !existing.status
    await existing.save()
    return existing
  }

  try {
    return (await this.create({ habitId: habitObjectId, date: day, status: true })) as unknown as HabitLogDocument
  } catch (err: unknown) {
    // Handle race conditions where two requests create the same (habitId, date) log.
    const maybeCode = typeof err === "object" && err !== null ? (err as { code?: unknown }).code : undefined
    if (typeof maybeCode === "number" && maybeCode === 11000) {
      const retry = await this.findOne({ habitId: habitObjectId, date: day })
      if (!retry) throw err
      retry.status = !retry.status
      await retry.save()
      return retry as unknown as HabitLogDocument
    }
    throw err
  }
}

// Get all logs for a habit for a given month (sorted by date ascending).
HabitLogSchema.statics.getLogsForHabitForMonth = async function (
  habitId: string | Types.ObjectId,
  year: number,
  month: number // 1-12
): Promise<Array<HabitLogDocument>> {
  const habitObjectId = typeof habitId === "string" ? new mongoose.Types.ObjectId(habitId) : habitId
  const { start, endExclusive } = getMonthRangeUTC(year, month)

  return this
    .find({ habitId: habitObjectId, date: { $gte: start, $lt: endExclusive } })
    .sort({ date: 1 })
    .exec()
}

// Count completed days (status: true) for a habit for a given month.
HabitLogSchema.statics.countCompletedDaysInMonth = async function (
  habitId: string | Types.ObjectId,
  year: number,
  month: number // 1-12
): Promise<number> {
  const habitObjectId = typeof habitId === "string" ? new mongoose.Types.ObjectId(habitId) : habitId
  const { start, endExclusive } = getMonthRangeUTC(year, month)
  return this.countDocuments({ habitId: habitObjectId, date: { $gte: start, $lt: endExclusive }, status: true })
}

// Calculate streak based on completed logs, sorted by date descending.
HabitLogSchema.statics.calculateStreak = async function (
  habitId: string | Types.ObjectId,
  todayInput: Date | string | number = new Date()
): Promise<number> {
  const habitObjectId = typeof habitId === "string" ? new mongoose.Types.ObjectId(habitId) : habitId
  const today = toStartOfDayUTC(todayInput)

  const completedLogs = await this
    .find({ habitId: habitObjectId, status: true, date: { $lte: today } })
    .sort({ date: -1 })
    .select({ date: 1 })
    .lean()
    .exec()
  const completedDatesDesc = (completedLogs as Array<{ date: Date }>).map((l) => l.date)

  return calculateStreakFromCompletedDatesDesc(completedDatesDesc, today)
}

// Calculate success rate = completedDays / totalTrackedDays * 100
HabitLogSchema.statics.calculateSuccessRate = async function (
  habitId: string | Types.ObjectId,
  year: number,
  month: number // 1-12
): Promise<{ completedDays: number; totalTrackedDays: number; successRate: number }> {
  const habitObjectId = typeof habitId === "string" ? new mongoose.Types.ObjectId(habitId) : habitId
  const { start, endExclusive } = getMonthRangeUTC(year, month)
  const completedDays = await this.countDocuments({
    habitId: habitObjectId,
    date: { $gte: start, $lt: endExclusive },
    status: true,
  })
  const totalTrackedDays = await this.countDocuments({
    habitId: habitObjectId,
    date: { $gte: start, $lt: endExclusive },
  })

  const successRate = totalTrackedDays === 0 ? 0 : (completedDays / totalTrackedDays) * 100
  return { completedDays, totalTrackedDays, successRate }
}

// Helper for month boundaries based on UTC.
// Useful when you need a specific day within a month.
HabitLogSchema.statics.getDayInMonthUTC = function (
  year: number,
  month: number, // 1-12
  dayOfMonth: number
): Date {
  const monthIndex = month - 1
  return new Date(Date.UTC(year, monthIndex, dayOfMonth))
}

// Ensure TS/Next doesn't complain about re-using an existing compiled model.
// Statics are attached to `HabitLogSchema` before this model is created.
export const HabitLogModel =
  (mongoose.models.HabitLog ?? mongoose.model("HabitLog", HabitLogSchema)) as unknown as mongoose.Model<HabitLogDocument>

export const HabitLog = HabitLogModel


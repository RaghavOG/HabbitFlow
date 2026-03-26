import mongoose, { Schema, type InferSchemaType, type HydratedDocument, type Types } from "mongoose"

export interface IHabit {
  userId: Types.ObjectId
  name: string
  color: string
  goalPerMonth: number
}

const HabitSchema = new Schema<IHabit>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    goalPerMonth: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
)

HabitSchema.index({ userId: 1 })

// One Habit -> Many HabitLogs (virtual relationship; not stored in the document).
HabitSchema.virtual("logs", {
  ref: "HabitLog",
  localField: "_id",
  foreignField: "habitId",
})

// Get all habits (optionally scoped to a user).
HabitSchema.statics.getAllHabits = async function (
  userId?: string | Types.ObjectId
): Promise<HabitDocument[]> {
  const filter: Record<string, unknown> = {}
  if (userId) {
    const userObjectId = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId
    filter.userId = userObjectId
  }
  return this.find(filter).sort({ createdAt: -1 }).exec()
}

export type HabitDocument = HydratedDocument<IHabit>
export type HabitModel = mongoose.Model<HabitDocument>

export const HabitModel = (mongoose.models.Habit ?? mongoose.model("Habit", HabitSchema)) as unknown as HabitModel

export type Habit = InferSchemaType<typeof HabitSchema>


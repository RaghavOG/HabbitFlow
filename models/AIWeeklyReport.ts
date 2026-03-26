import mongoose, { Schema, type Types, type HydratedDocument } from "mongoose"

export interface IAIWeeklyReport {
  userId: Types.ObjectId
  weekKey: string // YYYY-MM-DD (Monday start)
  bullets: string[]
  createdAt?: Date
  updatedAt?: Date
}

const AIWeeklyReportSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    weekKey: { type: String, required: true },
    bullets: { type: [String], required: true, default: [] },
  },
  { timestamps: true }
)

AIWeeklyReportSchema.index({ userId: 1, weekKey: 1 }, { unique: true })

export type AIWeeklyReportDocument = HydratedDocument<IAIWeeklyReport>
export type AIWeeklyReportModel = mongoose.Model<AIWeeklyReportDocument>

export const AIWeeklyReportModel =
  (mongoose.models.AIWeeklyReport ?? mongoose.model("AIWeeklyReport", AIWeeklyReportSchema)) as unknown as AIWeeklyReportModel


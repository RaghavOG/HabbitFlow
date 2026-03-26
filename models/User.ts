import mongoose, { Schema, type InferSchemaType, type HydratedDocument } from "mongoose"

export interface IUser {
  email: string
  name?: string
  passwordHash: string
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: false, trim: true },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true }
)

// Extra explicit unique index for clarity.
UserSchema.index({ email: 1 }, { unique: true })

export type UserDocument = HydratedDocument<IUser>
export type UserModel = mongoose.Model<UserDocument>

export const UserModel = (mongoose.models.User ?? mongoose.model("User", UserSchema)) as unknown as UserModel

export type User = InferSchemaType<typeof UserSchema>


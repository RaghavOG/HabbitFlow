import mongoose, { Schema, type InferSchemaType, type HydratedDocument } from "mongoose"

export interface IUser {
  email: string
  name?: string
  // For Clerk users
  clerkUserId?: string
  // For legacy/local auth (optional now)
  passwordHash?: string
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: false, trim: true },
    clerkUserId: { type: String, required: false, unique: true, sparse: true, index: true },
    passwordHash: { type: String, required: false, select: false },
  },
  { timestamps: true }
)

export type UserDocument = HydratedDocument<IUser>
export type UserModel = mongoose.Model<UserDocument>

export const UserModel = (mongoose.models.User ?? mongoose.model("User", UserSchema)) as unknown as UserModel

export type User = InferSchemaType<typeof UserSchema>


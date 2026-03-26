import mongoose from "mongoose"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { connectToMongo } from "@/lib/mongodb"
import { UserModel } from "@/models/User"

export async function getMongoUserIdFromClerk(): Promise<string | null> {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) return null

  await connectToMongo()
  const existing = await UserModel.findOne({ clerkUserId }).select({ _id: 1 }).lean()
  if (existing) return String(existing._id)

  // If webhook hasn't created the Mongo user yet (common in local/dev),
  // create it on-demand from Clerk profile.
  const client = await clerkClient()
  const clerkUser = await client.users.getUser(clerkUserId)
  const email = clerkUser.emailAddresses?.[0]?.emailAddress?.toLowerCase()
  const name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || undefined
  if (!email) return null

  const created = await UserModel.create({
    clerkUserId,
    email,
    ...(name ? { name } : {}),
  })

  return String(created._id)
}

export async function requireMongoUserIdFromClerk(): Promise<string> {
  const userId = await getMongoUserIdFromClerk()
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) throw new Error("Unauthorized")
  return userId
}


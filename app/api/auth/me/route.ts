import { NextResponse } from "next/server"
import { connectToMongo } from "@/lib/mongodb"
import { getUserIdFromRequestCookie } from "@/lib/auth"
import { UserModel } from "@/models/User"

export async function GET() {
  await connectToMongo()

  const userId = await getUserIdFromRequestCookie()
  if (!userId) return NextResponse.json({ user: null }, { status: 200 })

  const user = await UserModel.findById(userId).select({ email: 1, name: 1 }).lean()
  if (!user) return NextResponse.json({ user: null }, { status: 200 })

  return NextResponse.json({ user: { _id: String(user._id), email: user.email, name: user.name } })
}


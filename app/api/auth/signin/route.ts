import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToMongo } from "@/lib/mongodb"
import { UserModel } from "@/models/User"
import { setAuthCookie, signAuthToken } from "@/lib/auth"

export async function POST(req: Request) {
  await connectToMongo()

  const body = (await req.json()) as { email?: string; password?: string }
  const email = (body.email ?? "").trim().toLowerCase()
  const password = body.password ?? ""

  if (!email || !password) {
    return NextResponse.json({ error: "Missing email or password" }, { status: 400 })
  }

  const user = await UserModel.findOne({ email }).select("+passwordHash")
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const passwordHash = user.get("passwordHash") as unknown
  if (typeof passwordHash !== "string") {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const ok = await bcrypt.compare(password, passwordHash)
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const token = await signAuthToken({ userId: String(user._id) })
  await setAuthCookie(token)

  return NextResponse.json({ user: { _id: String(user._id), email: user.email, name: user.name } })
}


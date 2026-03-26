import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToMongo } from "@/lib/mongodb"
import { UserModel } from "@/models/User"

export async function POST(req: Request) {
  await connectToMongo()

  const body = (await req.json()) as { email?: string; password?: string; name?: string }
  const email = (body.email ?? "").trim().toLowerCase()
  const password = body.password ?? ""
  const name = body.name?.trim() || undefined

  if (!email || !password) return NextResponse.json({ error: "Missing email or password" }, { status: 400 })
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })

  const existing = await UserModel.findOne({ email }).lean()
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 })

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await UserModel.create({ email, name, passwordHash })

  return NextResponse.json({ user: { _id: String(user._id), email: user.email, name: user.name } }, { status: 201 })
}


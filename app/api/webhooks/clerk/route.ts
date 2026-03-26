import { NextResponse } from "next/server"
import { Webhook } from "svix"
import { connectToMongo } from "@/lib/mongodb"
import { UserModel } from "@/models/User"

type ClerkEmailAddress = { email_address?: string }
type ClerkUserData = {
  id: string
  first_name?: string | null
  last_name?: string | null
  email_addresses?: ClerkEmailAddress[]
}

type ClerkWebhookEvent = {
  type: "user.created" | "user.updated" | "user.deleted"
  data: ClerkUserData & { deleted?: boolean }
}

function getPrimaryEmail(data: ClerkUserData): string | null {
  const email = data.email_addresses?.[0]?.email_address
  return typeof email === "string" ? email.toLowerCase() : null
}

function getName(data: ClerkUserData): string | undefined {
  const first = (data.first_name ?? "").trim()
  const last = (data.last_name ?? "").trim()
  const full = `${first} ${last}`.trim()
  return full || undefined
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: "Missing CLERK_WEBHOOK_SECRET" }, { status: 500 })

  const svixId = req.headers.get("svix-id")
  const svixTimestamp = req.headers.get("svix-timestamp")
  const svixSignature = req.headers.get("svix-signature")
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing webhook headers" }, { status: 400 })
  }

  const payload = await req.text()

  let evt: ClerkWebhookEvent
  try {
    const wh = new Webhook(secret)
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  await connectToMongo()

  if (evt.type === "user.deleted") {
    // Clerk sends the user id in `data.id` for delete events.
    await UserModel.deleteOne({ clerkUserId: evt.data.id })
    return NextResponse.json({ ok: true })
  }

  const email = getPrimaryEmail(evt.data)
  // On update events, the payload can be transiently missing email addresses.
  // In that case we still ensure the user row exists and update name only.
  const name = getName(evt.data)

  // If email is missing, don't fail the webhook; just update what we can.
  if (!email) {
    await UserModel.updateOne(
      { clerkUserId: evt.data.id },
      {
        $set: {
          clerkUserId: evt.data.id,
          ...(name ? { name } : {}),
        },
      },
      { upsert: true }
    )
    return NextResponse.json({ ok: true, partial: true })
  }

  // Upsert by clerkUserId. Keep email unique.
  await UserModel.updateOne(
    { clerkUserId: evt.data.id },
    {
      $set: {
        clerkUserId: evt.data.id,
        email,
        ...(name ? { name } : {}),
      },
      $setOnInsert: {},
    },
    { upsert: true }
  )

  return NextResponse.json({ ok: true })
}


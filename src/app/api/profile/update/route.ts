import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name } = await request.json()
  if (!name || typeof name !== "string" || name.trim().length < 1 || name.trim().length > 50) {
    return NextResponse.json({ error: "Name must be 1-50 characters" }, { status: 400 })
  }

  const trimmed = name.trim()

  try {
    await query("UPDATE users SET name = $1 WHERE id = $2", [trimmed, session.user.id])
    return NextResponse.json({ name: trimmed })
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}

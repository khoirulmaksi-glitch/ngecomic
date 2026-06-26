import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await query(
    "SELECT id, name, email, role, level, total_reads, created_at FROM users ORDER BY created_at DESC"
  )

  return NextResponse.json(result.rows)
}

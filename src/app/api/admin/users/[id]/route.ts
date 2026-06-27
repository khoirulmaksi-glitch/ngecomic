import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { banned } = await request.json()

  const result = await query(
    "UPDATE users SET banned = $1 WHERE id = $2 RETURNING id, name, email, role, level, total_reads, banned, created_at",
    [banned, id]
  )

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json(result.rows[0])
}

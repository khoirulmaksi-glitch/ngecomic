import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const q = request.nextUrl.searchParams.get("q") || ""
  if (q.length < 1) {
    return NextResponse.json([])
  }

  const userId = Number(session.user.id)

  const result = await query(
    `SELECT id, name, email, level
     FROM users
     WHERE id != $1 AND (LOWER(name) LIKE $2 OR LOWER(email) LIKE $2)
     ORDER BY name ASC
     LIMIT 20`,
    [userId, `%${q.toLowerCase()}%`]
  )

  return NextResponse.json(result.rows)
}

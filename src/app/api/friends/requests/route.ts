import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = Number(session.user.id)

  const result = await query(
    `SELECT f.id, f.user_id, f.friend_id, f.status, f.created_at,
            u.name AS friend_name, u.email AS friend_email, u.level AS friend_level
     FROM friends f
     JOIN users u ON u.id = f.user_id
     WHERE f.friend_id = $1 AND f.status = 'pending'
     ORDER BY f.created_at DESC`,
    [userId]
  )

  return NextResponse.json(result.rows)
}

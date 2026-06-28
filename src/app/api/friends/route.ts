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
     JOIN users u ON u.id = CASE WHEN f.user_id = $1 THEN f.friend_id ELSE f.user_id END
     WHERE (f.user_id = $1 OR f.friend_id = $1) AND f.status = 'accepted'
     ORDER BY f.created_at DESC`,
    [userId]
  )

  return NextResponse.json(result.rows)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = Number(session.user.id)
  const { action, friendId, requestId } = await request.json()

  if (action === "send") {
    if (!friendId || friendId === userId) {
      return NextResponse.json({ error: "Invalid friend ID" }, { status: 400 })
    }

    const existing = await query(
      "SELECT id FROM friends WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)",
      [userId, friendId]
    )
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Already friends or request pending" }, { status: 400 })
    }

    await query(
      "INSERT INTO friends (user_id, friend_id, status) VALUES ($1, $2, 'pending')",
      [userId, friendId]
    )

    return NextResponse.json({ message: "Friend request sent" })
  }

  if (action === "accept" || action === "reject") {
    if (!requestId) {
      return NextResponse.json({ error: "requestId required" }, { status: 400 })
    }

    const req = await query(
      "SELECT * FROM friends WHERE id = $1 AND friend_id = $2 AND status = 'pending'",
      [requestId, userId]
    )
    if (req.rows.length === 0) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    if (action === "accept") {
      await query("UPDATE friends SET status = 'accepted' WHERE id = $1", [requestId])
      return NextResponse.json({ message: "Friend request accepted" })
    } else {
      await query("DELETE FROM friends WHERE id = $1", [requestId])
      return NextResponse.json({ message: "Friend request rejected" })
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = Number(session.user.id)
  const { friendId } = await request.json()

  await query(
    "DELETE FROM friends WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)",
    [userId, friendId]
  )

  return NextResponse.json({ message: "Friend removed" })
}

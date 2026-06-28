import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      comic_slug VARCHAR(255) NOT NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureTable()
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const userId = Number(session.user.id)

  const comment = await query(
    "SELECT user_id FROM comments WHERE id = $1",
    [id]
  )
  if (comment.rows.length === 0) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 })
  }
  if (comment.rows[0].user_id !== userId && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await query("DELETE FROM comments WHERE id = $1", [id])
  return NextResponse.json({ message: "Comment deleted" })
}

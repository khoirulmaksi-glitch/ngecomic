import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { comic_slug, chapter_slug, comic_title, comic_image } = await request.json()

  if (!comic_slug || !chapter_slug) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const userId = Number(session.user.id)

  await query(
    `INSERT INTO reading_history (user_id, comic_slug, chapter_slug, comic_title, comic_image)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, comic_slug, chapter_slug, comic_title || null, comic_image || null]
  )

  await query(
    "UPDATE users SET total_reads = total_reads + 1 WHERE id = $1",
    [userId]
  )

  const userResult = await query(
    "SELECT total_reads, level FROM users WHERE id = $1",
    [userId]
  )

  const totalReads = userResult.rows[0]?.total_reads || 0
  let newLevel = 1
  if (totalReads >= 1000) newLevel = 10
  else if (totalReads >= 500) newLevel = 9
  else if (totalReads >= 250) newLevel = 8
  else if (totalReads >= 100) newLevel = 7
  else if (totalReads >= 50) newLevel = 6
  else if (totalReads >= 25) newLevel = 5
  else if (totalReads >= 15) newLevel = 4
  else if (totalReads >= 8) newLevel = 3
  else if (totalReads >= 3) newLevel = 2

  await query("UPDATE users SET level = $1 WHERE id = $2", [newLevel, userId])

  return NextResponse.json({
    total_reads: totalReads,
    level: newLevel,
    message: "Reading logged",
  })
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = Number(session.user.id)

  const result = await query(
    `SELECT DISTINCT ON (comic_slug)
       comic_slug, chapter_slug, comic_title, comic_image, read_at
     FROM reading_history
     WHERE user_id = $1
     ORDER BY comic_slug, read_at DESC
     LIMIT 20`,
    [userId]
  )

  return NextResponse.json(result.rows)
}

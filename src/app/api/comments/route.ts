import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 })
  }

  const result = await query(
    `SELECT c.id, c.comic_slug, c.user_id, c.content, c.parent_id, c.created_at,
            u.name AS user_name, u.level AS user_level
     FROM comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.comic_slug = $1
     ORDER BY c.created_at DESC
     LIMIT 100`,
    [slug]
  )

  return NextResponse.json(result.rows)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = Number(session.user.id)
  const { comic_slug, content, parent_id } = await request.json()

  if (!comic_slug || !content?.trim()) {
    return NextResponse.json({ error: "comic_slug and content required" }, { status: 400 })
  }

  if (content.trim().length > 1000) {
    return NextResponse.json({ error: "Max 1000 characters" }, { status: 400 })
  }

  const result = await query(
    `INSERT INTO comments (comic_slug, user_id, content, parent_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [comic_slug, userId, content.trim(), parent_id || null]
  )

  return NextResponse.json({ id: result.rows[0].id, message: "Comment added" }, { status: 201 })
}

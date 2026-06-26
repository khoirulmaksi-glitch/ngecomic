import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await query(
    "SELECT * FROM favorites WHERE user_id = $1 ORDER BY created_at DESC",
    [Number(session.user.id)]
  )

  return NextResponse.json(result.rows)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { comic_slug, comic_title, comic_image } = await request.json()

  if (!comic_slug) {
    return NextResponse.json({ error: "comic_slug required" }, { status: 400 })
  }

  const existing = await query(
    "SELECT id FROM favorites WHERE user_id = $1 AND comic_slug = $2",
    [Number(session.user.id), comic_slug]
  )

  if (existing.rows.length > 0) {
    await query("DELETE FROM favorites WHERE user_id = $1 AND comic_slug = $2", [
      Number(session.user.id),
      comic_slug,
    ])
    return NextResponse.json({ message: "Removed from favorites", favorited: false })
  }

  await query(
    "INSERT INTO favorites (user_id, comic_slug, comic_title, comic_image) VALUES ($1, $2, $3, $4)",
    [Number(session.user.id), comic_slug, comic_title, comic_image]
  )

  return NextResponse.json({ message: "Added to favorites", favorited: true })
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { comic_slug } = await request.json()

  await query("DELETE FROM favorites WHERE user_id = $1 AND comic_slug = $2", [
    Number(session.user.id),
    comic_slug,
  ])

  return NextResponse.json({ message: "Removed from favorites" })
}

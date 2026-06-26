import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ favorited: false })
  }

  const slug = request.nextUrl.searchParams.get("slug")
  if (!slug) {
    return NextResponse.json({ favorited: false })
  }

  const result = await query(
    "SELECT id FROM favorites WHERE user_id = $1 AND comic_slug = $2",
    [Number(session.user.id), slug]
  )

  return NextResponse.json({ favorited: result.rows.length > 0 })
}

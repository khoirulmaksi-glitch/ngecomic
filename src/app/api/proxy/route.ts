import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const path = searchParams.get("path") || ""
  const url = `${process.env.API_BASE_URL}/comic${path ? `/${path}` : ""}${
    searchParams.toString() ? `?${searchParams.toString().replace(/^path=[^&]*&?/, "")}` : ""
  }`

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    })
    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

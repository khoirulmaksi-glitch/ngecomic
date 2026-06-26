import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

const BASE = process.env.API_BASE_URL || "https://www.sankavollerei.web.id"

async function logApi(endpoint: string, method: string, statusCode: number, durationMs: number, userId: number | null, ip: string) {
  try {
    await query(
      "INSERT INTO api_logs (endpoint, method, status_code, duration_ms, user_id, ip_address) VALUES ($1, $2, $3, $4, $5, $6)",
      [endpoint, method, statusCode, durationMs, userId, ip]
    )
  } catch {
    // silent
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const start = Date.now()
  const pathStr = path.join("/")
  const search = request.nextUrl.search
  const url = `${BASE}/comic/${pathStr}${search}`

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    })
    const data = await response.json()
    const duration = Date.now() - start

    void logApi(`/comic/${pathStr}`, "GET", response.status, duration, null, request.headers.get("x-forwarded-for") || "unknown")
    // Note: userId tracking for authenticated users via cookie not implemented here
    // to keep it simple, we're logging without user_id for proxy requests

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Failed to fetch comic data" }, { status: 500 })
  }
}

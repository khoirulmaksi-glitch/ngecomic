import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

const BASE = process.env.API_BASE_URL || "https://www.sankavollerei.web.id"

const PROXY_SERVICES = [
  "https://api.allorigins.win/raw?url=",
  "https://corsproxy.io/?url=",
]

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
  const targetUrl = `${BASE}/comic/${pathStr}${search}`

  const errors: string[] = []

  // Try in order: direct -> proxy1 -> proxy2
  const urls = [targetUrl, ...PROXY_SERVICES.map(s => `${s}${encodeURIComponent(targetUrl)}`)]

  for (let i = 0; i < urls.length; i++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(urls[i], {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        },
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (!response.ok) {
        errors.push(`URL ${i}: ${response.status}`)
        continue
      }

      const data = await response.json()
      const duration = Date.now() - start

      void logApi(`/comic/${pathStr}`, "GET", response.status, duration, null, request.headers.get("x-forwarded-for") || "unknown")

      return NextResponse.json(data)
    } catch (e) {
      errors.push(`URL ${i}: ${e instanceof Error ? e.message : "unknown"}`)
    }
  }

  return NextResponse.json({ error: "Failed to fetch comic data", details: errors }, { status: 502 })
}

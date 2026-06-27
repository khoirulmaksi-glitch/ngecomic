import { NextRequest, NextResponse } from "next/server"

const PROXY_SERVICES = [
  "https://api.allorigins.win/raw?url=",
  "https://corsproxy.io/?url=",
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const path = searchParams.get("path") || ""
  const baseUrl = process.env.API_BASE_URL || "https://www.sankavollerei.web.id"
  const targetUrl = `${baseUrl}/comic${path ? `/${path}` : ""}${
    searchParams.toString() ? `?${searchParams.toString().replace(/^path=[^&]*&?/, "")}` : ""
  }`

  const errors: string[] = []

  // Try direct first
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      const url = attempt === 0 ? targetUrl : `${PROXY_SERVICES[0]}${encodeURIComponent(targetUrl)}`
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        },
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (!response.ok) {
        errors.push(`Attempt ${attempt}: ${response.status}`)
        continue
      }
      const data = await response.json()
      return NextResponse.json(data)
    } catch (e) {
      errors.push(`Attempt ${attempt}: ${e instanceof Error ? e.message : "unknown"}`)
    }
  }

  // Try all proxy services
  for (const service of PROXY_SERVICES) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const response = await fetch(`${service}${encodeURIComponent(targetUrl)}`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        },
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (!response.ok) {
        errors.push(`Proxy ${service}: ${response.status}`)
        continue
      }
      const data = await response.json()
      return NextResponse.json(data)
    } catch (e) {
      errors.push(`Proxy ${service}: ${e instanceof Error ? e.message : "unknown"}`)
    }
  }

  return NextResponse.json({ error: "All fetch attempts failed", details: errors }, { status: 502 })
}

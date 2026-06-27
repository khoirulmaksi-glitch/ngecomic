import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { Comic } from "@/lib/types"

const BASE = process.env.API_BASE_URL || "https://www.sankavollerei.web.id"
const CACHE_TTL = 300

const PROXY_SERVICES = [
  "https://api.allorigins.win/raw?url=",
  "https://corsproxy.io/?url=",
]

interface GenreItem {
  label: string
  value: string
}

interface GenreData {
  slug: string
  label: string
  comics: Comic[]
}

function extractResults(data: any): any[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (data.comics) return Array.isArray(data.comics) ? data.comics : []
  if (data.seriesList) return Array.isArray(data.seriesList) ? data.seriesList : []
  if (data.results) return Array.isArray(data.results) ? data.results : []
  if (data.data) return Array.isArray(data.data) ? data.data : []
  return []
}

function extractSlug(item: any): string {
  if (item.slug) return item.slug
  if (item.link) {
    const m = item.link.match(/\/manga\/([^/]+)/)
    if (m) return m[1]
  }
  return ""
}

function toComic(item: any): Comic | null {
  const slug = extractSlug(item)
  if (!slug) return null
  return {
    title: item.title,
    slug,
    image: item.thumbnail || item.image || "",
    rating: item.rating || "",
    type: item.type || "",
    chapter: item.chapter || item.latestChapter || "",
  }
}

async function fetchJson(url: string): Promise<any> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    return res.json()
  } catch {
    clearTimeout(timeout)
    return null
  }
}

async function fetchFromExternal(path: string): Promise<any> {
  const targetUrl = `${BASE}/comic/${path}`
  for (const url of [targetUrl, ...PROXY_SERVICES.map(s => `${s}${encodeURIComponent(targetUrl)}`)]) {
    const data = await fetchJson(url)
    if (data) return data
  }
  return null
}

async function fetchGenreComics(slug: string): Promise<Comic[]> {
  for (const path of [`genre/${encodeURIComponent(slug)}`, `komikstation/genre/${encodeURIComponent(slug)}`]) {
    const data = await fetchFromExternal(path)
    if (!data) continue
    const items = extractResults(data)
    if (items.length > 0) return items.map(toComic).filter(Boolean) as Comic[]
  }
  return []
}

async function buildGenreData(): Promise<GenreData[]> {
  const genreData = await fetchFromExternal("komikstation/genres")
  if (!genreData) return []
  const genres: GenreItem[] = genreData.genres || []
  if (genres.length === 0) return []

  const results = await Promise.allSettled(
    genres.map(async (g) => {
      const slug = g.label.toLowerCase()
      const comics = await fetchGenreComics(slug)
      return { slug, label: g.label, comics }
    })
  )

  const out: GenreData[] = []
  for (const r of results) {
    if (r.status === "fulfilled" && r.value.comics.length > 0) {
      out.push(r.value)
    }
  }
  return out
}

export async function GET() {
  try {
    // Try cache first — single SQL query
    const cached = await query(
      "SELECT data, updated_at FROM genre_page_cache WHERE id = 1"
    )

    if (cached.rows.length > 0) {
      const { data, updated_at } = cached.rows[0]
      const age = (Date.now() - new Date(updated_at).getTime()) / 1000
      if (age < CACHE_TTL) {
        return NextResponse.json(data)
      }
    }

    // Cache miss or stale — fetch fresh data
    const data = await buildGenreData()

    // Store in cache (single INSERT or UPDATE)
    await query(
      `INSERT INTO genre_page_cache (id, data, updated_at)
       VALUES (1, $1::jsonb, NOW())
       ON CONFLICT (id)
       DO UPDATE SET data = $1::jsonb, updated_at = NOW()`,
      [JSON.stringify({ genres: data })]
    )

    return NextResponse.json({ genres: data })
  } catch (e) {
    console.error("Genre data fetch failed:", e)
    return NextResponse.json({ error: "Failed to load genre data" }, { status: 500 })
  }
}

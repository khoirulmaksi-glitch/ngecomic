import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { Comic } from "@/lib/types"

const BASE = process.env.API_BASE_URL || "https://www.sankavollerei.web.id"
const CACHE_TTL = 300
const FETCH_TIMEOUT = 6000

const PROXY_SERVICES = [
  "https://api.allorigins.win/raw?url=",
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

async function fetchJson(url: string, label: string): Promise<any> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) {
      console.error(`  fetchJson ${label}: HTTP ${res.status} from ${url.slice(0, 80)}`)
      return null
    }
    return res.json()
  } catch (e) {
    clearTimeout(timeout)
    const msg = e instanceof Error ? e.message : String(e)
    console.error(`  fetchJson ${label}: ${msg} (${url.slice(0, 80)})`)
    return null
  }
}

async function fetchFromExternal(path: string): Promise<any> {
  const targetUrl = `${BASE}/comic/${path}`
  const urls = [targetUrl, ...PROXY_SERVICES.map(s => `${s}${encodeURIComponent(targetUrl)}`)]
  for (let i = 0; i < urls.length; i++) {
    const label = `path=${path} attempt=${i}`
    const data = await fetchJson(urls[i], label)
    if (data) return data
  }
  return null
}

async function fetchGenreComics(slug: string): Promise<Comic[]> {
  const data = await fetchFromExternal(`komikstation/genre/${encodeURIComponent(slug)}`)
  if (data) {
    const items = extractResults(data)
    if (items.length > 0) return items.map(toComic).filter(Boolean) as Comic[]
  }
  return []
}

async function buildGenreData(): Promise<GenreData[]> {
  console.error("  buildGenreData: fetching genre list...")
  const genreData = await fetchFromExternal("komikstation/genres")
  if (!genreData) {
    console.error("  buildGenreData: FAILED to fetch genre list from all endpoints")
    return []
  }
  const genres: GenreItem[] = genreData.genres || []
  console.error(`  buildGenreData: got ${genres.length} genres`)
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
    console.error("=== GET /api/genre-data: checking DB cache ===")
    let cached
    try {
      cached = await query(
        "SELECT data, updated_at FROM genre_page_cache WHERE id = 1"
      )
    } catch (dbErr) {
      const msg = dbErr instanceof Error ? dbErr.message : String(dbErr)
      console.error("=== DB cache query failed ===\n", msg)
      // Table may not exist — proceed without cache
      cached = { rows: [] }
    }

    if (cached.rows.length > 0) {
      const { data, updated_at } = cached.rows[0]
      const age = (Date.now() - new Date(updated_at).getTime()) / 1000
      console.error(`  cache hit, age=${age.toFixed(0)}s`)
      if (age < CACHE_TTL) {
        return NextResponse.json(data)
      }
      console.error("  cache stale, refetching...")
    } else {
      console.error("  cache empty, fetching fresh data...")
    }

    // Cache miss or stale — fetch fresh data (with overall timeout)
    const data = await (async () => {
      let timer: ReturnType<typeof setTimeout>
      const result = await Promise.race([
        buildGenreData(),
        new Promise<GenreData[]>((_, reject) => {
          timer = setTimeout(() => reject(new Error("Global fetch timeout")), 25000)
        }),
      ])
      clearTimeout(timer!)
      return result
    })()

    // Store in cache (single INSERT or UPDATE)
    try {
      await query(
        `INSERT INTO genre_page_cache (id, data, updated_at)
         VALUES (1, $1::jsonb, NOW())
         ON CONFLICT (id)
         DO UPDATE SET data = $1::jsonb, updated_at = NOW()`,
        [JSON.stringify({ genres: data })]
      )
    } catch (storeErr) {
      const msg = storeErr instanceof Error ? storeErr.message : String(storeErr)
      console.error("=== DB cache store failed (non-fatal) ===\n", msg)
    }

    return NextResponse.json({ genres: data })
  } catch (e) {
    const msg = e instanceof Error ? `${e.name}: ${e.message}\n${e.stack}` : String(e)
    console.error("=== Genre data fetch failed ===\n", msg)
    return NextResponse.json({ error: "Failed to load genre data", detail: msg }, { status: 500 })
  }
}

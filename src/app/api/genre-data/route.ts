import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { Comic } from "@/lib/types"

const BASE = process.env.API_BASE_URL || "https://www.sankavollerei.web.id"
const CACHE_TTL = 3600
const FETCH_TIMEOUT = 4000
const IMG_RESOLVE_TIMEOUT = 3000
const MAX_COMICS_PER_GENRE = 20
const FETCH_CONCURRENCY = 5

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

async function fetchTimeout(url: string, timeout: number): Promise<Response | null> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
      signal: controller.signal,
    })
    clearTimeout(id)
    return res.ok ? res : null
  } catch {
    clearTimeout(id)
    return null
  }
}

async function fetchFromExternal(path: string): Promise<any> {
  const targetUrl = `${BASE}/comic/${path}`
  const res = await fetchTimeout(targetUrl, FETCH_TIMEOUT)
  if (res) return res.json()
  const services = ["https://api.allorigins.win/raw?url="]
  for (const s of services) {
    const proxyRes = await fetchTimeout(`${s}${encodeURIComponent(targetUrl)}`, FETCH_TIMEOUT)
    if (proxyRes) return proxyRes.json()
  }
  return null
}

async function resolveComicImage(slug: string): Promise<string | null> {
  const url = `${BASE}/comic/komikstation/manga/${slug}`
  const res = await fetchTimeout(url, IMG_RESOLVE_TIMEOUT)
  if (!res) return null
  try {
    const data = await res.json()
    return data.imageSrc?.startsWith("data:") ? null : data.imageSrc || null
  } catch {
    return null
  }
}

async function resolveComicImages(comics: Comic[]): Promise<Comic[]> {
  const slugs = comics.filter(c => c.image.startsWith("data:")).map(c => c.slug)
  if (slugs.length === 0) return comics

  const map = new Map<string, string>()
  const results = await Promise.allSettled(slugs.map(s => resolveComicImage(s)))
  results.forEach((r, i) => {
    if (r.status === "fulfilled" && r.value) map.set(slugs[i], r.value)
  })

  return comics.map(c => ({ ...c, image: map.get(c.slug) || c.image }))
}

async function fetchGenreComics(slug: string): Promise<Comic[]> {
  const data = await fetchFromExternal(`komikstation/genre/${encodeURIComponent(slug)}`)
  if (!data) return []
  const items = extractResults(data)
  if (items.length === 0) return []
  const comics = items.map(toComic).filter(Boolean) as Comic[]
  return resolveComicImages(comics.slice(0, MAX_COMICS_PER_GENRE))
}

async function buildGenreData(): Promise<GenreData[]> {
  const genreData = await fetchFromExternal("komikstation/genres")
  if (!genreData) return []
  const genres: GenreItem[] = genreData.genres || []
  if (genres.length === 0) return []

  const results: GenreData[] = []
  for (let i = 0; i < genres.length; i += FETCH_CONCURRENCY) {
    const batch = genres.slice(i, i + FETCH_CONCURRENCY)
    const settled = await Promise.allSettled(
      batch.map(async (g) => {
        const slug = g.label.toLowerCase()
        const comics = await fetchGenreComics(slug)
        return { slug, label: g.label, comics }
      })
    )
    for (const r of settled) {
      if (r.status === "fulfilled" && r.value.comics.length > 0) {
        results.push(r.value)
      }
    }
  }
  return results
}

export async function GET() {
  try {
    let cached
    try {
      cached = await query(
        "SELECT data, updated_at FROM genre_page_cache WHERE id = 1"
      )
    } catch {
      cached = { rows: [] }
    }

    if (cached.rows.length > 0) {
      const { data, updated_at } = cached.rows[0]
      const age = (Date.now() - new Date(updated_at).getTime()) / 1000

      if (age < CACHE_TTL) {
        return NextResponse.json(data)
      }

      // Stale-while-revalidate: serve stale cache, refresh in background
      buildGenreData()
        .then(fresh => {
          query(
            `INSERT INTO genre_page_cache (id, data, updated_at)
             VALUES (1, $1::jsonb, NOW())
             ON CONFLICT (id)
             DO UPDATE SET data = $1::jsonb, updated_at = NOW()`,
            [JSON.stringify({ genres: fresh })]
          ).catch(() => {})
        })
        .catch(err => console.error("Background refresh failed:", err))

      return NextResponse.json(data)
    }

    // No cache — wait for fresh data
    const freshData = await buildGenreData()
    await query(
      `INSERT INTO genre_page_cache (id, data, updated_at)
       VALUES (1, $1::jsonb, NOW())
       ON CONFLICT (id)
       DO UPDATE SET data = $1::jsonb, updated_at = NOW()`,
      [JSON.stringify({ genres: freshData })]
    ).catch(() => {})

    return NextResponse.json({ genres: freshData })
  } catch (e) {
    const msg = e instanceof Error ? `${e.name}: ${e.message}\n${e.stack}` : String(e)
    console.error("=== Genre data fetch failed ===\n", msg)
    return NextResponse.json({ error: "Failed to load genre data" }, { status: 500 })
  }
}

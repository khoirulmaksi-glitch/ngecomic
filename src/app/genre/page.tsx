import GenreClient from "./GenreClient"

export const dynamic = 'force-dynamic'

const API_BASE_URL = process.env.API_BASE_URL || "https://www.sankavollerei.web.id"

interface GenreItem {
  label: string
  value: string
}

async function fetchJSON(url: string) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
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

export default async function GenrePage() {
  const genreData = await fetchJSON(`${API_BASE_URL}/comic/komikstation/genres`)
  const genres: GenreItem[] = genreData?.genres || []

  let initialSelected = ""
  let initialComics: any[] = []

  if (genres.length > 0) {
    initialSelected = genres[0].label.toLowerCase()

    const [a, b] = await Promise.allSettled([
      fetchJSON(`${API_BASE_URL}/comic/genre/${encodeURIComponent(initialSelected)}`),
      fetchJSON(`${API_BASE_URL}/comic/komikstation/genre/${encodeURIComponent(initialSelected)}`),
    ])

    for (const result of [a, b]) {
      if (result.status !== "fulfilled" || !result.value) continue
      const items = extractResults(result.value)
      if (items.length > 0) {
        initialComics = items.map(item => {
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
        }).filter(Boolean)
        break
      }
    }
  }

  return (
    <GenreClient
      genres={genres}
      initialSelected={initialSelected}
      initialComics={initialComics}
    />
  )
}

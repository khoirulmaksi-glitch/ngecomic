const API_BASE_URL = process.env.API_BASE_URL || "https://www.sankavollerei.web.id"
import SearchClient from "./SearchClient"

interface PageParams {
  searchParams: Promise<{ q?: string; genre?: string }>
}

export default async function SearchPage({ searchParams }: PageParams) {
  const params = await searchParams
  const q = params.q || null
  const genre = params.genre || null

  let initialResults: any[] = []
  let initialGenreName = ""

  async function fetchFromAPI(path: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/comic${path}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 60 },
      })
      if (!res.ok) return null
      return res.json()
    } catch {
      return null
    }
  }

  if (genre) {
    const endpoints = [
      `/genre/${encodeURIComponent(genre)}`,
      `/komikstation/genre/${encodeURIComponent(genre)}`,
    ]
    for (const ep of endpoints) {
      const data = await fetchFromAPI(ep)
      if (!data) continue
      const extracted = extractResults(data)
      if (extracted.length > 0) {
        initialResults = extracted
        break
      }
    }

    const genreList = await fetchFromAPI("/komikstation/genres")
    if (genreList?.genres) {
      const found = genreList.genres.find(
        (x: { label: string }) => x.label.toLowerCase() === genre
      )
      initialGenreName = found?.label || genre
    } else {
      initialGenreName = genre
    }
  } else if (q) {
    const data = await fetchFromAPI(`/search?q=${encodeURIComponent(q)}`)
    if (data) {
      initialResults = extractResults(data)
    }
  }

  return (
    <SearchClient
      initialResults={initialResults}
      initialGenreName={initialGenreName}
      initialQuery={q || ""}
    />
  )
}

interface SearchResult {
  title: string
  slug: string
  href: string
  thumbnail: string
  image?: string
  type: string
  latestChapter?: string
  chapter?: string
  link?: string
  genre: string
  description: string
  rating?: string
  status?: string | null
  altTitle?: string
}

function extractResults(data: any): SearchResult[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (data.seriesList) return Array.isArray(data.seriesList) ? data.seriesList : []
  if (data.comics) return Array.isArray(data.comics) ? data.comics : []
  if (data.data) return Array.isArray(data.data) ? data.data : []
  if (data.results) return Array.isArray(data.results) ? data.results : []
  if (data.manga) return Array.isArray(data.manga) ? data.manga : []
  return []
}

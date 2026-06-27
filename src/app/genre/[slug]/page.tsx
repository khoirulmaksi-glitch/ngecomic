import Link from "next/link"
import { getGenres } from "@/lib/api"
import ComicCard from "@/components/ComicCard"
import type { Comic } from "@/lib/types"

export const dynamic = 'force-dynamic'

const API_BASE_URL = process.env.API_BASE_URL || "https://www.sankavollerei.web.id"

interface ComicItem {
  title: string
  slug?: string
  link?: string
  image?: string
  thumbnail?: string
  type?: string
  chapter?: string
  latestChapter?: string
  rating?: string
  genre?: string
  description?: string
}

function extractSlug(item: ComicItem): string {
  if (item.slug) return item.slug
  if (item.link) {
    const match = item.link.match(/\/manga\/([^/]+)/)
    if (match) return match[1]
  }
  return ""
}

interface PageParams {
  params: Promise<{ slug: string }>
}

export default async function GenreDetailPage({ params }: PageParams) {
  const { slug } = await params
  const genreSlug = slug.toLowerCase()

  const [genreListRes, primaryRes] = await Promise.allSettled([
    getGenres(),
    fetch(`${API_BASE_URL}/comic/genre/${encodeURIComponent(genreSlug)}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 60 },
    }),
  ])

  const genres = genreListRes.status === "fulfilled" ? genreListRes.value.genres || [] : []
  const genreInfo = genres.find((g) => g.label.toLowerCase() === genreSlug)
  const genreName = genreInfo?.label || genreSlug.charAt(0).toUpperCase() + genreSlug.slice(1)

  let comics: Comic[] = []
  let rawItems: ComicItem[] = []

  if (primaryRes.status === "fulfilled" && primaryRes.value.ok) {
    const data = await primaryRes.value.json()
    const items = Array.isArray(data)
      ? data
      : data.comics || data.seriesList || data.results || data.data || []
    rawItems = items
  } else {
    const fallbackRes = await fetch(
      `${API_BASE_URL}/comic/komikstation/genre/${encodeURIComponent(genreSlug)}`,
      { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 60 } }
    )
    if (fallbackRes.ok) {
      const data = await fallbackRes.json()
      rawItems = data.seriesList || data.comics || data.results || data.data || []
    }
  }

  comics = rawItems
    .map((item: ComicItem) => {
      const slug = extractSlug(item)
      if (!slug) return null
      const image = item.thumbnail || item.image || ""
      return {
        title: item.title,
        slug,
        image,
        rating: item.rating || "",
        type: item.type || "",
        chapter: item.chapter || item.latestChapter || "",
      }
    })
    .filter(Boolean) as Comic[]

  return (
    <div className="bg-surface text-on-surface min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted mb-1">
            <Link href="/" className="hover:text-brand transition-colors">Home</Link>
            <span>/</span>
            <Link href="/genre" className="hover:text-brand transition-colors">Genres</Link>
            <span>/</span>
            <span className="text-on-surface">{genreName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">{genreName}</h1>
          <p className="text-muted text-sm mt-1">
            Menampilkan komik genre {genreName}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {genres.map((g) => (
            <Link
              key={g.value}
              href={`/genre/${g.label.toLowerCase()}`}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-colors ${
                g.label.toLowerCase() === genreSlug
                  ? "bg-brand text-white border-brand"
                  : "border-outline text-muted hover:border-brand hover:text-brand"
              }`}
            >
              {g.label}
            </Link>
          ))}
        </div>

        {comics.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted font-mono">Tidak ada komik untuk genre &ldquo;{genreName}&rdquo;</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
            {comics.map((comic) => (
              <ComicCard key={comic.slug} comic={comic} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import PixelCard from "@/components/PixelCard"
import { Suspense } from "react"

interface SearchResult {
  title: string
  altTitle?: string
  slug: string
  href: string
  thumbnail: string
  type: string
  genre: string
  description: string
}

interface GenreInfo {
  label: string
  value: string
}

function SearchInner() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [genre, setGenre] = useState(searchParams.get("genre") || "")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [genreName, setGenreName] = useState("")

  useEffect(() => {
    const q = searchParams.get("q")
    const g = searchParams.get("genre")
    if (q) {
      setQuery(q)
      setGenre("")
      doSearch(q)
    } else if (g) {
      setGenre(g)
      setQuery("")
      fetchGenreComics(g)
    }
  }, [])

  async function fetchGenreComics(g: string) {
    setLoading(true)
    setSearched(true)
    try {
      const genreRes = await fetch("/api/proxy?path=komikstation/genres")
      const genreData = await genreRes.json()
      const genres: GenreInfo[] = genreData.genres || []
      const found = genres.find((x) => x.value === g)
      setGenreName(found?.label || g)

      const res = await fetch(`/api/proxy?path=komikstation/genre/${g}`)
      const data = await res.json()
      setResults(data.data || data.comics || data.results || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  async function doSearch(q: string) {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/proxy?path=search&q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.data || data.comics || data.results || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setGenre("")
    setGenreName("")
    doSearch(query)
  }, [query])

  function extractSlug(item: SearchResult): string {
    if (item.slug) return item.slug
    const match = item.href?.match(/\/manga\/([^/]+)/)
    return match ? match[1] : ""
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {genreName ? `Genre: ${genreName}` : "Search"}
          </h1>
          <p className="text-muted text-sm mt-1">
            {genreName ? `Menampilkan komik genre ${genreName}` : "Find your favorite comics"}
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-2xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul komik..."
            className="flex-1 px-4 py-3 border-2 border-outline bg-surface text-on-surface focus:border-brand outline-none transition-colors text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-brand text-white font-bold uppercase tracking-wider text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "..." : "Cari"}
          </button>
        </form>

        {searched && !loading && results.length === 0 && (
          <p className="text-center text-muted py-10 font-mono">
            {genreName
              ? `Tidak ada komik untuk genre "${genreName}"`
              : `Tidak ada hasil untuk "${query}"`
            }
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {results.map((item) => {
            const slug = extractSlug(item)
            if (!slug) return null
            return (
              <PixelCard key={item.slug || item.href} variant="pink" className="border-2 border-outline hover:border-brand bg-surface">
                <Link
                  href={`/comic/${slug}`}
                  className="group block"
                >
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none"
                        const p = (e.target as HTMLElement).parentElement
                        if (p && !p.querySelector(".fl")) {
                          const s = document.createElement("span")
                          s.className = "fl absolute inset-0 flex items-center justify-center text-3xl font-black text-muted"
                          s.textContent = item.title.charAt(0)
                          p.appendChild(s)
                        }
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm line-clamp-2 text-on-surface">
                      {item.title}
                    </h3>
                    {item.type && (
                      <p className="text-xs text-brand mt-1 font-mono">{item.type}</p>
                    )}
                  </div>
                </Link>
              </PixelCard>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="bg-surface text-on-surface min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 text-muted">Loading...</div>
      </div>
    }>
      <SearchInner />
    </Suspense>
  )
}

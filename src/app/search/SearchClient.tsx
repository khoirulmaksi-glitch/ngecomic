"use client"

import { useState, useCallback, useRef } from "react"
import Link from "next/link"
import PixelCard from "@/components/PixelCard"

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

interface Props {
  initialResults: SearchResult[]
  initialGenreName: string
  initialQuery: string
}

function isPlaceholder(src: string | undefined): boolean {
  return !src || src.startsWith("data:")
}

function extractSlugFromLink(link?: string): string {
  if (!link) return ""
  const match = link.match(/\/manga\/([^/]+)/)
  return match ? match[1] : ""
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

const cache = new Map<string, SearchResult[]>()

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 animate-pulse">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="border-2 border-outline bg-surface overflow-hidden">
          <div className="aspect-[3/4] bg-zinc-800" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-zinc-800 rounded w-3/4" />
            <div className="h-2 bg-zinc-800 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function SearchClient({ initialResults, initialGenreName, initialQuery }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>(initialResults)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(!!(initialGenreName || initialQuery))
  const [genreName, setGenreName] = useState(initialGenreName)
  const genreListRef = useRef<{ label: string; value: string }[] | null>(null)
  const currentFetchRef = useRef<AbortController | null>(null)

  async function loadGenreList() {
    if (genreListRef.current) return genreListRef.current
    try {
      const res = await fetch("/api/proxy?path=komikstation/genres")
      if (res.ok) {
        const data = await res.json()
        genreListRef.current = data.genres || []
        return genreListRef.current
      }
    } catch {}
    return []
  }

  async function fetchGenreFromApi(g: string): Promise<SearchResult[]> {
    const endpoints = [
      `/api/proxy?path=genre/${encodeURIComponent(g)}`,
      `/api/proxy?path=komikstation/genre/${encodeURIComponent(g)}`,
    ]
    const res = await Promise.allSettled(
      endpoints.map((url) =>
        fetch(url).then((r) => (r.ok ? r.json() : Promise.reject()))
      )
    )
    for (const r of res) {
      if (r.status === "fulfilled") {
        const extracted = extractResults(r.value)
        if (extracted.length > 0) return extracted
      }
    }
    return []
  }

  async function fetchGenreComics(g: string) {
    currentFetchRef.current?.abort()
    const controller = new AbortController()
    currentFetchRef.current = controller

    const genres = (await loadGenreList()) || []
    const found = genres.find((x) => x.label.toLowerCase() === g)
    setGenreName(found?.label || g)

    const cached = cache.get(g)
    if (cached) {
      setResults(cached)
      setLoading(false)
    }

    const data = await fetchGenreFromApi(g)
    if (controller.signal.aborted) return
    cache.set(g, data)
    setResults(data)
    setLoading(false)
  }

  function switchGenre(g: string) {
    const key = g.toLowerCase()
    window.history.replaceState(null, "", `/search?genre=${key}`)
    setLoading(true)

    const cached = cache.get(key)
    if (cached) {
      setResults(cached)
      setLoading(false)
      const genres = genreListRef.current || []
      const found = genres.find((x) => x.label.toLowerCase() === key)
      setGenreName(found?.label || key)
    }

    fetchGenreComics(key)
  }

  function prefetchGenre(g: string) {
    const key = g.toLowerCase()
    if (cache.has(key)) return
    fetchGenreFromApi(key).then((data) => cache.set(key, data))
  }

  async function doSearch(q: string) {
    if (!q.trim()) return
    currentFetchRef.current?.abort()
    setLoading(true)
    setSearched(true)
    setResults([])
    setGenreName("")
    try {
      const res = await fetch(`/api/proxy?path=search&q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(extractResults(data))
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    window.history.replaceState(null, "", `/search?q=${encodeURIComponent(query)}`)
    doSearch(query)
  }, [query])

  function extractSlug(item: SearchResult): string {
    if (item.slug) return item.slug
    if (item.link) return extractSlugFromLink(item.link)
    return ""
  }

  if (!searched && results.length === 0 && !loading) {
    return (
      <div className="bg-surface text-on-surface min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Search</h1>
            <p className="text-muted text-sm mt-1">Find your favorite comics</p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-2xl">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari judul komik..."
              className="flex-1 px-4 py-3 border-2 border-outline bg-surface text-on-surface focus:border-brand outline-none transition-colors text-sm"
            />
            <button type="submit" disabled={loading} className="px-6 py-3 bg-brand text-white font-bold uppercase tracking-wider text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? "..." : "Cari"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {genreName ? `Genre: ${genreName}` : "Search"}
          </h1>
          <p className="text-muted text-sm mt-1">
            {genreName ? `Menampilkan komik genre ${genreName}` : "Hasil pencarian"}
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
          <button type="submit" disabled={loading} className="px-6 py-3 bg-brand text-white font-bold uppercase tracking-wider text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "..." : "Cari"}
          </button>
        </form>

        {loading && results.length === 0 && <SkeletonGrid />}

        {!loading && searched && results.length === 0 && (
          <p className="text-center text-muted py-10 font-mono">
            {genreName ? `Tidak ada komik untuk genre "${genreName}"` : `Tidak ada hasil untuk "${query}"`}
          </p>
        )}

        <div className={`transition-opacity duration-200 ${loading && results.length === 0 ? "opacity-0" : "opacity-100"}`}>
          {results.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
              {results.map((item, idx) => {
                const slug = extractSlug(item)
                if (!slug) return null
                return (
                  <PixelCard key={slug || idx} variant="pink" className="border-2 border-outline hover:border-brand bg-surface">
                    <Link href={`/comic/${slug}`} className="group block">
                      <div className="aspect-[3/4] overflow-hidden">
                        {isPlaceholder(item.thumbnail || item.image) ? (
                          <span className="flex items-center justify-center w-full h-full text-4xl font-black text-muted bg-surface/50">
                            {item.title.charAt(0)}
                          </span>
                        ) : (
                        <img
                          src={item.thumbnail || item.image}
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
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-sm line-clamp-2 text-on-surface">{item.title}</h3>
                        {(item.type || item.latestChapter || item.chapter) && (
                          <p className="text-xs text-brand mt-1 font-mono">{item.type || item.latestChapter || item.chapter}</p>
                        )}
                      </div>
                    </Link>
                    {item.genre && (
                      <div className="px-3 pb-3">
                        <span
                          onClick={() => switchGenre(item.genre)}
                          onMouseEnter={() => prefetchGenre(item.genre)}
                          className="inline-block px-1.5 py-0.5 bg-brand/10 text-brand text-[10px] font-mono uppercase tracking-wider cursor-pointer hover:bg-brand/20 transition-colors"
                        >
                          {item.genre}
                        </span>
                      </div>
                    )}
                  </PixelCard>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

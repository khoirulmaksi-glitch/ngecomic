"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import PixelCard from "@/components/PixelCard"

interface SearchResult {
  title: string
  altTitle?: string
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

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [genreName, setGenreName] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get("q")
    const g = params.get("genre")
    if (q) {
      setQuery(q)
      doSearch(q)
    } else if (g) {
      fetchGenreComics(g)
    }
  }, [])

  async function fetchGenreComics(g: string) {
    setLoading(true)
    setSearched(true)

    try {
      const genreRes = await fetch("/api/proxy?path=komikstation/genres")
      if (genreRes.ok) {
        const genreData = await genreRes.json()
        const genres: { label: string; value: string }[] = genreData.genres || []
        const found = genres.find((x) => x.label.toLowerCase() === g)
        if (found) setGenreName(found.label)
        else setGenreName(g)
      } else {
        setGenreName(g)
      }
    } catch {
      setGenreName(g)
    }

    const endpoints = [
      `/api/proxy?path=genre/${encodeURIComponent(g)}`,
      `/api/proxy?path=komikstation/genre/${encodeURIComponent(g)}`,
    ]

    for (const url of endpoints) {
      try {
        const res = await fetch(url)
        if (!res.ok) continue
        const data = await res.json()
        const extracted = extractResults(data)
        if (extracted.length > 0) {
          setResults(extracted)
          setLoading(false)
          return
        }
      } catch {
        continue
      }
    }

    setResults([])
    setLoading(false)
  }

  async function doSearch(q: string) {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)
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
    setGenreName("")
    doSearch(query)
  }, [query])

  function extractSlug(item: SearchResult): string {
    if (item.slug) return item.slug
    if (item.link) return extractSlugFromLink(item.link)
    return ""
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

        {loading && (
          <p className="text-center text-muted py-10 font-mono">Loading...</p>
        )}

        {searched && !loading && results.length === 0 && (
          <p className="text-center text-muted py-10 font-mono">
            {genreName
              ? `Tidak ada komik untuk genre "${genreName}"`
              : `Tidak ada hasil untuk "${query}"`
            }
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {results.map((item, idx) => {
            const slug = extractSlug(item)
            if (!slug) return null
            return (
              <PixelCard key={slug || idx} variant="pink" className="border-2 border-outline hover:border-brand bg-surface">
                <Link
                  href={`/comic/${slug}`}
                  className="group block"
                >
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
                    <h3 className="font-bold text-sm line-clamp-2 text-on-surface">
                      {item.title}
                    </h3>
                    {item.genre && (
                      <span
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          router.push(`/search?genre=${item.genre.toLowerCase()}`)
                        }}
                        className="inline-block mt-1.5 px-1.5 py-0.5 bg-brand/10 text-brand text-[10px] font-mono uppercase tracking-wider cursor-pointer hover:bg-brand/20 transition-colors"
                      >
                        {item.genre}
                      </span>
                    )}
                    {(item.type || item.latestChapter || item.chapter) && (
                      <p className="text-xs text-brand mt-1 font-mono">{item.type || item.latestChapter || item.chapter}</p>
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

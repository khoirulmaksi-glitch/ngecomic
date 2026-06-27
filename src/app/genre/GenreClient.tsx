"use client"

import { useState, useRef, useEffect } from "react"
import ComicCard from "@/components/ComicCard"
import type { Comic } from "@/lib/types"

interface GenreItem {
  label: string
  value: string
}

interface Props {
  genres: GenreItem[]
  initialSelected: string
  initialComics: Comic[]
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

function mapItem(item: any): Comic | null {
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

async function fetchGenre(slug: string): Promise<Comic[]> {
  const endpoints = [
    `/api/proxy?path=genre/${encodeURIComponent(slug)}`,
    `/api/proxy?path=komikstation/genre/${encodeURIComponent(slug)}`,
  ]
  const results = await Promise.allSettled(
    endpoints.map(url => fetch(url).then(r => r.ok ? r.json() : Promise.reject()))
  )
  for (const r of results) {
    if (r.status !== "fulfilled") continue
    const items = extractResults(r.value)
    if (items.length > 0) {
      return items.map(mapItem).filter(Boolean) as Comic[]
    }
  }
  return []
}

export default function GenreClient({ genres, initialSelected, initialComics }: Props) {
  const cacheRef = useRef<Map<string, Comic[]>>(new Map())
  const prefetchedRef = useRef(false)

  if (initialComics.length > 0) {
    cacheRef.current.set(initialSelected, initialComics)
  }

  const [selected, setSelected] = useState(initialSelected)
  const [comics, setComics] = useState<Comic[]>(initialComics)
  const [fetching, setFetching] = useState(false)

  function doSelect(slug: string) {
    if (slug === selected) return
    setSelected(slug)
    window.history.replaceState(null, "", `/genre?g=${slug}`)

    const cached = cacheRef.current.get(slug)
    if (cached) {
      setComics(cached)
      return
    }

    setFetching(true)
    fetchGenre(slug).then(data => {
      cacheRef.current.set(slug, data)
      setComics(data)
      setFetching(false)
    })
  }

  async function prefetch(slug: string) {
    if (cacheRef.current.has(slug)) return
    const data = await fetchGenre(slug)
    cacheRef.current.set(slug, data)
  }

  useEffect(() => {
    if (prefetchedRef.current || genres.length === 0) return
    prefetchedRef.current = true
    genres.forEach(g => {
      const s = g.label.toLowerCase()
      if (!cacheRef.current.has(s)) {
        fetchGenre(s).then(data => cacheRef.current.set(s, data))
      }
    })
  }, [genres])

  const selectedLabel = genres.find(g => g.label.toLowerCase() === selected)?.label || selected
  const noData = !fetching && comics.length === 0

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <div className="md:hidden border-b border-outline overflow-x-auto scrollbar-none">
        <div className="flex gap-1 p-3 whitespace-nowrap">
          {genres.map(g => {
            const slug = g.label.toLowerCase()
            const active = slug === selected
            return (
              <button
                key={g.value}
                onClick={() => doSelect(slug)}
                onMouseEnter={() => prefetch(slug)}
                className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded shrink-0 transition-colors ${
                  active
                    ? "bg-brand text-white"
                    : "bg-surface text-on-surface border border-outline hover:border-brand hover:text-brand"
                }`}
              >
                {g.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <aside className="hidden md:flex md:w-48 lg:w-56 shrink-0 flex-col border-r border-outline">
          <div className="p-4 border-b border-outline">
            <h1 className="font-bold text-lg">Genres</h1>
          </div>
          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {genres.map(g => {
              const slug = g.label.toLowerCase()
              const active = slug === selected
              return (
                <button
                  key={g.value}
                  onClick={() => doSelect(slug)}
                  onMouseEnter={() => prefetch(slug)}
                  className={`w-full text-left px-3 py-2 text-sm font-mono uppercase tracking-wider rounded transition-colors ${
                    active
                      ? "bg-brand text-white font-bold"
                      : "text-on-surface hover:bg-brand/10 hover:text-brand"
                  }`}
                >
                  {g.label}
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 min-w-0">
          <div className="hidden md:block mb-6">
            <h2 className="text-2xl font-bold">{selectedLabel}</h2>
            <p className="text-muted text-sm mt-1">Menampilkan komik genre {selectedLabel}</p>
          </div>

          <div className="md:hidden mb-4">
            <h2 className="text-xl font-bold">{selectedLabel}</h2>
            <p className="text-muted text-xs mt-0.5">Menampilkan komik genre {selectedLabel}</p>
          </div>

          {noData && (
            <div className="text-center py-16">
              <p className="text-muted font-mono">Tidak ada komik untuk genre ini</p>
            </div>
          )}

          {comics.length > 0 && (
            <div className={`min-h-[50vh] ${fetching ? "opacity-40" : "opacity-100"} transition-opacity duration-100`}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                {comics.map(comic => (
                  <ComicCard key={comic.slug} comic={comic} />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

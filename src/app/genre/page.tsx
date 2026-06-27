"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import type { Comic } from "@/lib/types"
import GenreSection from "./GenreSection"
import GenreChips from "./GenreChips"

interface GenreData {
  slug: string
  label: string
  comics: Comic[]
}

interface GenreItem {
  label: string
  value: string
}

function Skeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-8 w-32 bg-zinc-800 rounded mb-2" />
      <div className="h-4 w-56 bg-zinc-800 rounded mb-8" />
      <div className="flex gap-2 mb-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-8 w-24 bg-zinc-800 rounded-full" />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, s) => (
        <div key={s} className="mb-14">
          <div className="h-6 w-40 bg-zinc-800 rounded mb-5" />
          <div className="flex gap-4">
            {Array.from({ length: 5 }).map((_, c) => (
              <div key={c} className="flex-1 min-w-0">
                <div className="aspect-[3/4] bg-zinc-800 rounded mb-2" />
                <div className="h-3 bg-zinc-800 rounded w-3/4 mb-1" />
                <div className="h-2 bg-zinc-800 rounded w-1/3" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function GenrePage() {
  const [search, setSearch] = useState("")
  const [grouped, setGrouped] = useState<Map<string, { label: string; comics: Comic[] }>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const genreOrder = useRef<string[]>([])

  useEffect(() => {
    let cancelled = false

    async function loadAll() {
      try {
        const res = await fetch("/api/genre-data")
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (cancelled) return

        const genres: GenreData[] = json.genres || []
        if (genres.length === 0) {
          setLoading(false)
          return
        }

        const map = new Map<string, { label: string; comics: Comic[] }>()
        const order: string[] = []

        for (const g of genres) {
          map.set(g.slug, { label: g.label, comics: g.comics })
          order.push(g.slug)
        }

        genreOrder.current = order
        setGrouped(map)
        setLoading(false)
      } catch {
        if (!cancelled) {
          setError("Failed to load genres")
          setLoading(false)
        }
      }
    }

    loadAll()
    return () => { cancelled = true }
  }, [])

  const chipGenres = useMemo(() => {
    if (!search.trim()) {
      return genreOrder.current
        .map(slug => {
          const entry = grouped.get(slug)
          return entry ? { label: entry.label, value: slug } : null
        })
        .filter(Boolean) as GenreItem[]
    }
    const q = search.toLowerCase()
    return genreOrder.current
      .map(slug => {
        const entry = grouped.get(slug)
        if (!entry || !entry.label.toLowerCase().includes(q)) return null
        return { label: entry.label, value: slug }
      })
      .filter(Boolean) as GenreItem[]
  }, [search, grouped])

  const activeChip = chipGenres[0]?.value || ""

  const handleChipSelect = useCallback((slug: string) => {
    const el = document.getElementById(`genre-${slug}`)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  if (loading) return <Skeleton />

  if (error) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center gap-4">
        <span className="text-5xl">📚</span>
        <p className="text-muted font-mono text-sm">{error}</p>
      </div>
    )
  }

  if (grouped.size === 0) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center gap-4">
        <span className="text-5xl">🔍</span>
        <p className="text-muted font-mono text-sm">No comics available.</p>
      </div>
    )
  }

  const q = search.toLowerCase().trim()

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">Genres</h1>
          <p className="text-muted text-sm mt-1">Discover manga by genre.</p>
        </div>

        <div className="relative mb-8 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search genre..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline text-on-surface text-sm outline-none focus:border-brand transition-colors"
            aria-label="Search genre"
          />
        </div>

        {chipGenres.length > 0 && (
          <GenreChips genres={chipGenres} activeGenre={activeChip} onSelect={handleChipSelect} />
        )}

        {chipGenres.length === 0 && search.trim() && (
          <div className="text-center py-16">
            <p className="text-muted font-mono text-sm">No genres match &ldquo;{search}&rdquo;</p>
          </div>
        )}

        {genreOrder.current.map(slug => {
          const entry = grouped.get(slug)
          if (!entry || entry.comics.length === 0) return null
          const hide = q && !entry.label.toLowerCase().includes(q)
          return (
            <div key={slug} className={hide ? "hidden" : ""}>
              <GenreSection genreSlug={slug} genreLabel={entry.label} comics={entry.comics} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

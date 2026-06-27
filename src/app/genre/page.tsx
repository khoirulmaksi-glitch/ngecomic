"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import type { Comic } from "@/lib/types"
import GenreSection from "./GenreSection"
import GenreChips from "./GenreChips"

interface GenreItem {
  label: string
  value: string
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

async function fetchGenreComics(slug: string): Promise<Comic[]> {
  const endpoints = [
    `/api/proxy?path=genre/${encodeURIComponent(slug)}`,
    `/api/proxy?path=komikstation/genre/${encodeURIComponent(slug)}`,
  ]
  const results = await Promise.allSettled(
    endpoints.map(u => fetch(u).then(r => r.ok ? r.json() : Promise.reject()))
  )
  for (const r of results) {
    if (r.status !== "fulfilled") continue
    const items = extractResults(r.value)
    if (items.length > 0) {
      return items.map(toComic).filter(Boolean) as Comic[]
    }
  }
  return []
}

type GroupedData = Map<string, { label: string; comics: Comic[] }>

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
  const [grouped, setGrouped] = useState<GroupedData>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const genreOrder = useRef<string[]>([])
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    let cancelled = false

    async function loadAll() {
      try {
        const genreRes = await fetch("/api/proxy?path=komikstation/genres")
        const genreData = await genreRes.json()
        const genres: GenreItem[] = genreData.genres || []

        if (cancelled || genres.length === 0) {
          if (!cancelled) setLoading(false)
          return
        }

        const allFetches = genres.map(async (g) => {
          const slug = g.label.toLowerCase()
          const comics = await fetchGenreComics(slug)
          return { slug, label: g.label, comics }
        })

        const results = await Promise.allSettled(allFetches)
        if (cancelled) return

        const map: GroupedData = new Map()
        const order: string[] = []

        for (const r of results) {
          if (r.status === "fulfilled" && r.value.comics.length > 0) {
            map.set(r.value.slug, { label: r.value.label, comics: r.value.comics })
            order.push(r.value.slug)
          }
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

  const filteredOrder = useMemo(() => {
    if (!search.trim()) return genreOrder.current
    const q = search.toLowerCase()
    return genreOrder.current.filter(slug => {
      const entry = grouped.get(slug)
      return entry?.label.toLowerCase().includes(q)
    })
  }, [search, grouped])

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

  const sections = useMemo(() => {
    return filteredOrder
      .map(slug => {
        const entry = grouped.get(slug)
        if (!entry || entry.comics.length === 0) return null
        return { slug, label: entry.label, comics: entry.comics }
      })
      .filter(Boolean) as { slug: string; label: string; comics: Comic[] }[]
  }, [filteredOrder, grouped])

  const chipGenres = useMemo(() => {
    return sections.map(s => ({ label: s.label, value: s.slug }))
  }, [sections])

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
          <GenreChips
            genres={chipGenres}
            activeGenre={sections[0]?.slug || ""}
            onSelect={handleChipSelect}
          />
        )}

        {sections.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted font-mono text-sm">No genres match &ldquo;{search}&rdquo;</p>
          </div>
        )}

        {sections.map(s => (
          <GenreSection
            key={s.slug}
            genreSlug={s.slug}
            genreLabel={s.label}
            comics={s.comics}
          />
        ))}
      </div>
    </div>
  )
}

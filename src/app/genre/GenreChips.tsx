"use client"

import { useRef, useState, useEffect } from "react"

interface GenreItem {
  label: string
  value: string
}

interface Props {
  genres: GenreItem[]
  activeGenre: string
  onSelect: (slug: string) => void
}

export default function GenreChips({ genres, activeGenre, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [spyActive, setSpyActive] = useState(activeGenre)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const chipRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  useEffect(() => {
    const sections = genres.map(g => document.getElementById(`genre-${g.label.toLowerCase()}`)).filter(Boolean) as HTMLElement[]
    if (sections.length === 0) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const slug = entry.target.getAttribute("data-genre")
            if (slug) {
              setSpyActive(slug)
            }
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    )

    sections.forEach(el => observerRef.current?.observe(el))
    return () => observerRef.current?.disconnect()
  }, [genres])

  useEffect(() => {
    const btn = chipRefs.current.get(spyActive)
    if (btn && scrollRef.current) {
      const container = scrollRef.current
      const btnRect = btn.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      if (btnRect.left < containerRect.left || btnRect.right > containerRect.right) {
        btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
      }
    }
  }, [spyActive])

  function handleClick(slug: string) {
    onSelect(slug)
    const el = document.getElementById(`genre-${slug}`)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="mb-8">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-3 flex items-center gap-2">
        <span>🔥</span> Popular Genres
      </h3>
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {genres.map(g => {
          const slug = g.label.toLowerCase()
          const active = slug === spyActive
          return (
            <button
              key={g.value}
              ref={(el) => { if (el) chipRefs.current.set(slug, el) }}
              onClick={() => handleClick(slug)}
              className={`shrink-0 px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-full border transition-all duration-200 ${
                active
                  ? "bg-brand text-white border-brand shadow-md shadow-brand/20 scale-105"
                  : "bg-surface text-muted border-outline hover:border-brand hover:text-brand hover:scale-105"
              }`}
            >
              {g.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

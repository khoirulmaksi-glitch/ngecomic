"use client"

import { memo, useRef, useState, useEffect, useCallback } from "react"

interface GenreItem {
  label: string
  value: string
}

interface Props {
  genres: GenreItem[]
  activeGenre: string
  onSelect: (slug: string) => void
}

function GenreChips({ genres, activeGenre, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [spyActive, setSpyActive] = useState(activeGenre)
  const tickingRef = useRef(false)

  useEffect(() => {
    const sections = genres
      .map(g => document.getElementById(`genre-${g.label.toLowerCase()}`))
      .filter(Boolean) as HTMLElement[]

    if (sections.length === 0) return

    const NAVBAR_H = 80
    const CUSHION = 20

    function onScroll() {
      if (tickingRef.current) return
      tickingRef.current = true

      requestAnimationFrame(() => {
        tickingRef.current = false
        let best = spyActive
        let bestDist = Infinity
        const cy = window.scrollY + NAVBAR_H + CUSHION

        for (const el of sections) {
          const top = el.getBoundingClientRect().top + window.scrollY
          const dist = Math.abs(cy - top)
          if (dist < bestDist) {
            bestDist = dist
            const slug = el.getAttribute("data-genre") || spyActive
            best = slug
          }
        }

        if (best !== spyActive) {
          setSpyActive(best)
        }
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [genres, spyActive])

  useEffect(() => {
    const btn = scrollRef.current?.querySelector(`[data-chip="${activeGenre}"]`) as HTMLButtonElement | null
    if (btn && scrollRef.current) {
      const cr = scrollRef.current.getBoundingClientRect()
      const br = btn.getBoundingClientRect()
      if (br.left < cr.left || br.right > cr.right) {
        btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
      }
    }
  }, [activeGenre])

  const handleClick = useCallback((slug: string) => {
    onSelect(slug)
    const el = document.getElementById(`genre-${slug}`)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [onSelect])

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
              data-chip={slug}
              onClick={() => handleClick(slug)}
              className={`shrink-0 px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-full border transition-all duration-200 ease-out will-change-transform ${
                active
                  ? "bg-brand text-white border-brand scale-105"
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

export default memo(GenreChips)

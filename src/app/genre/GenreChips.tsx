"use client"

import { memo, useRef, useState, useEffect } from "react"

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

  useEffect(() => {
    setSpyActive(activeGenre)
  }, [activeGenre])

  useEffect(() => {
    const els = genres
      .map(g => document.getElementById(`genre-${g.value}`))
      .filter(Boolean) as HTMLElement[]

    if (els.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const slug = entry.target.getAttribute("data-genre")
            if (slug) setSpyActive(slug)
          }
        }
      },
      {
        rootMargin: "-80px 0px -50% 0px",
        threshold: 0,
      }
    )

    for (const el of els) observer.observe(el)
    return () => observer.disconnect()
  }, [genres])

  useEffect(() => {
    const btn = scrollRef.current?.querySelector(`[data-chip="${spyActive}"]`) as HTMLButtonElement | null
    if (btn && scrollRef.current) {
      const cr = scrollRef.current.getBoundingClientRect()
      const br = btn.getBoundingClientRect()
      if (br.left < cr.left || br.right > cr.right) {
        btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
      }
    }
  }, [spyActive])

  return (
    <div className="mb-8">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-3 flex items-center gap-2">
        <span>🔥</span> Popular Genres
      </h3>
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-1 no-scrollbar"
      >
        {genres.map(g => {
          const slug = g.value
          const active = slug === spyActive
          return (
            <button
              key={g.value}
              data-chip={slug}
              onClick={() => onSelect(slug)}
              className={`shrink-0 px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-full border transition-colors duration-200 ease-out ${
                active
                  ? "bg-brand text-white border-brand"
                  : "bg-surface text-muted border-outline hover:border-brand hover:text-brand"
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

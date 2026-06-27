"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import Link from "next/link"
import ComicCard from "@/components/ComicCard"
import type { Comic } from "@/lib/types"

interface Props {
  genreSlug: string
  genreLabel: string
  comics: Comic[]
  sectionRef: React.RefObject<HTMLDivElement | null>
}

const MEDALS = ["🥇", "🥈", "🥉"]

function getTopPicks(comics: Comic[]): Comic[] {
  const sorted = [...comics].sort((a, b) => {
    const ra = parseFloat(a.rating) || 0
    const rb = parseFloat(b.rating) || 0
    if (ra !== rb) return rb - ra
    return 0
  })
  return sorted.slice(0, 3)
}

export default function GenreSection({ genreSlug, genreLabel, comics, sectionRef }: Props) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const dragRef = useRef({ dragging: false, startX: 0, scrollLeft: 0 })

  const topPicks = getTopPicks(comics)

  const updateButtons = useCallback(() => {
    const el = carouselRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }, [])

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    el.addEventListener("scroll", updateButtons, { passive: true })
    updateButtons()
    return () => el.removeEventListener("scroll", updateButtons)
  }, [updateButtons])

  function scrollDir(dir: "left" | "right") {
    const el = carouselRef.current
    if (!el) return
    const vw = el.clientWidth
    let visible: number
    if (vw < 640) visible = 2
    else if (vw < 768) visible = 3
    else if (vw < 1024) visible = 4
    else visible = 5
    const cardW = (vw - (visible - 1) * 16) / visible
    const amount = (cardW + 16) * (dir === "left" ? -visible : visible) * 0.8
    el.scrollBy({ left: amount, behavior: "smooth" })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = carouselRef.current
    if (!el) return
    dragRef.current.dragging = true
    dragRef.current.startX = e.pageX - el.getBoundingClientRect().left
    dragRef.current.scrollLeft = el.scrollLeft
    el.style.cursor = "grabbing"
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.dragging) return
    e.preventDefault()
    const el = carouselRef.current
    if (!el) return
    const x = e.pageX - el.getBoundingClientRect().left
    const walk = (x - dragRef.current.startX) * 1.2
    el.scrollLeft = dragRef.current.scrollLeft - walk
  }

  const handleMouseUp = () => {
    dragRef.current.dragging = false
    if (carouselRef.current) carouselRef.current.style.cursor = "grab"
  }

  function handleWheel(e: React.WheelEvent) {
    if (!carouselRef.current) return
    carouselRef.current.scrollLeft += e.deltaY
  }

  return (
    <section
      ref={sectionRef}
      id={`genre-${genreSlug}`}
      data-genre={genreSlug}
      className="mb-14 scroll-mt-24"
    >
      <div className="flex items-end justify-between mb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-on-surface truncate">{genreLabel}</h2>
            <span className="text-xs text-muted font-mono bg-surface border border-outline px-2 py-0.5 shrink-0">
              {comics.length}
            </span>
          </div>
          {topPicks.length > 0 && (
            <p className="text-xs text-muted flex items-center gap-1 flex-wrap">
              {topPicks.map((c, i) => (
                <span key={c.slug} className="truncate max-w-[180px] sm:max-w-[240px]">
                  {i > 0 && <span className="text-outline mx-0.5">·</span>}
                  {MEDALS[i]} {c.title}
                </span>
              ))}
            </p>
          )}
        </div>
        <Link
          href={`/genre/${genreSlug}`}
          className="group flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-muted hover:text-brand transition-colors shrink-0 ml-4 relative"
        >
          View More
          <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
          <span className="absolute bottom-0 left-0 w-0 h-px bg-brand transition-all group-hover:w-full" />
        </Link>
      </div>

      <div className="relative group/carousel">
        {canScrollLeft && (
          <button
            onClick={() => scrollDir("left")}
            className="absolute left-0 top-0 bottom-0 z-10 w-14 flex items-center justify-start bg-gradient-to-r from-surface via-surface/80 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200"
            aria-label="Scroll left"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white hover:scale-110 hover:bg-black/70 transition-transform ml-1 shadow-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </span>
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scrollDir("right")}
            className="absolute right-0 top-0 bottom-0 z-10 w-14 flex items-center justify-end bg-gradient-to-l from-surface via-surface/80 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200"
            aria-label="Scroll right"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white hover:scale-110 hover:bg-black/70 transition-transform mr-1 shadow-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </span>
          </button>
        )}

        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto scroll-smooth py-1 cursor-grab active:cursor-grabbing"
          style={{
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") scrollDir("left")
            if (e.key === "ArrowRight") scrollDir("right")
          }}
          role="listbox"
          aria-label={`${genreLabel} comics`}
        >
          {comics.map((comic) => (
            <div
              key={comic.slug}
              className="shrink-0 w-[calc(50%-8px)] sm:w-[calc((100%/3)-11px)] md:w-[calc((100%/4)-12px)] lg:w-[calc((100%/5)-13px)]"
              style={{ scrollSnapAlign: "start" }}
              role="option"
            >
              <ComicCard comic={comic} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

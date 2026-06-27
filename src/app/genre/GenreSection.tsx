"use client"

import { memo, useRef, useCallback, useMemo } from "react"
import Link from "next/link"
import ComicCard from "@/components/ComicCard"
import type { Comic } from "@/lib/types"

interface Props {
  genreSlug: string
  genreLabel: string
  comics: Comic[]
}

const MEDALS = ["🥇", "🥈", "🥉"]

function getTopPicks(comics: Comic[]): Comic[] {
  const sorted = [...comics].sort((a, b) => {
    const ra = parseFloat(a.rating) || 0
    const rb = parseFloat(b.rating) || 0
    return ra !== rb ? rb - ra : 0
  })
  return sorted.slice(0, 3)
}

function getVisibleCount(vw: number): number {
  if (vw < 640) return 2
  if (vw < 768) return 3
  if (vw < 1024) return 4
  return 5
}

function GenreSection({ genreSlug, genreLabel, comics }: Props) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({ dragging: false, startX: 0, scrollLeft: 0 })

  const topPicks = useMemo(() => getTopPicks(comics), [comics])

  const scrollDir = useCallback((dir: "left" | "right") => {
    const el = carouselRef.current
    if (!el) return
    const vw = el.clientWidth
    const visible = getVisibleCount(vw)
    const cardW = (vw - (visible - 1) * 16) / visible
    el.scrollBy({ left: (cardW + 16) * (dir === "left" ? -visible : visible) * 0.8, behavior: "smooth" })
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const el = carouselRef.current
    if (!el) return
    dragRef.current.dragging = true
    dragRef.current.startX = e.pageX - el.getBoundingClientRect().left
    dragRef.current.scrollLeft = el.scrollLeft
    el.style.cursor = "grabbing"
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current.dragging) return
    e.preventDefault()
    const el = carouselRef.current
    if (!el) return
    const walk = (e.pageX - el.getBoundingClientRect().left - dragRef.current.startX) * 1.2
    el.scrollLeft = dragRef.current.scrollLeft - walk
  }, [])

  const handleMouseUp = useCallback(() => {
    dragRef.current.dragging = false
    if (carouselRef.current) carouselRef.current.style.cursor = "grab"
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const el = carouselRef.current
    if (!el) return
    el.scrollLeft += e.deltaY
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") scrollDir("left")
    if (e.key === "ArrowRight") scrollDir("right")
  }, [scrollDir])

  return (
    <section id={`genre-${genreSlug}`} data-genre={genreSlug} className="mb-14 scroll-mt-24" style={{ contentVisibility: "auto" }}>
      <div className="flex items-end justify-between mb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-on-surface truncate">{genreLabel}</h2>
            <span className="text-xs text-muted font-mono bg-surface border border-outline px-2 py-0.5 shrink-0">{comics.length}</span>
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
          <span className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-0.5">→</span>
          <span className="absolute bottom-0 left-0 w-0 h-px bg-brand transition-all duration-200 ease-out group-hover:w-full" />
        </Link>
      </div>

      <div
        className="relative group/carousel"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <button
          onClick={() => scrollDir("left")}
          className="absolute left-0 top-0 bottom-0 z-10 w-12 flex items-center justify-start opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 ease-out"
          aria-label="Scroll left"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black/60 text-white ml-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </span>
        </button>
        <button
          onClick={() => scrollDir("right")}
          className="absolute right-0 top-0 bottom-0 z-10 w-12 flex items-center justify-end opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 ease-out"
          aria-label="Scroll right"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black/60 text-white mr-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </span>
        </button>

        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto py-1 cursor-grab active:cursor-grabbing no-scrollbar"
          style={{ scrollBehavior: "smooth" }}
          onWheel={handleWheel}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-label={`${genreLabel} comics`}
        >
          {comics.map((comic) => (
            <div key={comic.slug} className="shrink-0 w-[calc(50%-8px)] sm:w-[calc((100%/3)-11px)] md:w-[calc((100%/4)-12px)] lg:w-[calc((100%/5)-13px)]">
              <ComicCard comic={comic} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default memo(GenreSection)

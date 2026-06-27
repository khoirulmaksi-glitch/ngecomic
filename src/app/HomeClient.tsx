"use client"

import { useState, useRef, useEffect, useCallback, Fragment } from "react"
import Link from "next/link"
import type { HomeComicItem, HomeLatestUpdate, HomeChapterItem } from "@/lib/api"
import ComicImage from "@/components/ComicImage"
import ContinueReading from "@/components/ContinueReading"

// ============================================================
// Constants
// ============================================================

const GENRES = [
  { label: "For You", key: "for-you" },
  { label: "Romance", key: "romance" },
  { label: "BL/GL", key: "bl-gl" },
  { label: "Action", key: "action" },
  { label: "Featured", key: "featured" },
]

interface SectionDef {
  title: string
  subtitle: string
  dataKey: "trending" | "updates" | "ongoing"
  slice: [number, number]
  numbered?: boolean
}

const SECTIONS: SectionDef[] = [
  { title: "Latest Trends", subtitle: "Most popular comics right now", dataKey: "trending", slice: [0, 8], numbered: true },
  { title: "Most Raved Series", subtitle: "Fan favorites", dataKey: "ongoing", slice: [0, 8] },
  { title: "New Arrivals for You", subtitle: "Fresh updates", dataKey: "updates", slice: [0, 8] },
  { title: "Fall for You Now!", subtitle: "Romance picks", dataKey: "trending", slice: [4, 12] },
  { title: "Hotblood Adventure", subtitle: "Action packed", dataKey: "ongoing", slice: [4, 12] },
  { title: "BL/GL - Pride of US", subtitle: "Love is love", dataKey: "trending", slice: [8, 16] },
  { title: "Eastern Love Tales", subtitle: "Asian romance", dataKey: "ongoing", slice: [8, 16] },
  { title: "Specially For You", subtitle: "Recommended just for you", dataKey: "updates", slice: [4, 12] },
]

// ============================================================
// Types
// ============================================================

interface Props {
  trending: HomeComicItem[]
  updates: HomeLatestUpdate[]
  ongoing: HomeComicItem[]
  imageMap: Record<string, string>
}

// ============================================================
// Helpers
// ============================================================

function isUpdateItem(item: HomeComicItem | HomeLatestUpdate): item is HomeLatestUpdate {
  return "chapters" in item
}

function getCoverUrl(item: HomeComicItem | HomeLatestUpdate, imageMap: Record<string, string>): string {
  const slug = isUpdateItem(item) ? item.slug : item.slug
  return imageMap[slug] || item.imageSrc
}

function getChapterLabel(item: HomeComicItem | HomeLatestUpdate): string {
  if (isUpdateItem(item)) {
    return item.chapters[0]?.title || ""
  }
  return item.latestChapter || ""
}

// ============================================================
// Genre Tab
// ============================================================

function GenreTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
        active ? "text-[#303133]" : "text-[#c0c4cc] hover:text-[#606266]"
      }`}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-[#07beb8] rounded-full" />
      )}
    </button>
  )
}

// ============================================================
// Comic Card
// ============================================================

interface ComicCardProps {
  item: HomeComicItem | HomeLatestUpdate
  imageMap: Record<string, string>
  rank?: number
  index?: number
}

function ComicCard({ item, imageMap, rank, index }: ComicCardProps) {
  const title = item.title
  const slug = item.slug
  const img = getCoverUrl(item, imageMap)
  const chapter = getChapterLabel(item)
  const isNew = index !== undefined && index < 2

  return (
    <Link href={`/comic/${slug}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-[#f5f5f5] aspect-[3/4] shadow-sm">
        <ComicImage
          src={img}
          alt={title}
          className="w-full h-full group-hover:scale-105 transition-transform duration-500"
        />

        {/* Rank badge */}
        {rank !== undefined && (
          <div className="absolute top-2 left-2 bg-[#07beb8] text-white text-xs font-bold px-2 py-0.5 rounded-md shadow-lg">
            #{rank}
          </div>
        )}

        {/* New badge */}
        {isNew && rank === undefined && (
          <div className="absolute top-2 left-2 bg-[#ff6b6b] text-white text-xs font-bold px-2 py-0.5 rounded-md shadow-lg">
            New
          </div>
        )}

        {/* Chapter overlay */}
        {chapter && rank === undefined && !isNew && (
          <div className="absolute bottom-2 left-2 right-2">
            <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded inline-block truncate max-w-full">
              {chapter}
            </span>
          </div>
        )}
      </div>

      <div className="mt-2 px-0.5">
        <h3 className="text-sm font-medium text-[#303133] line-clamp-2 leading-tight group-hover:text-[#07beb8] transition-colors">
          {title}
        </h3>
        {chapter && (
          <p className="text-xs text-[#9fa2a8] mt-0.5 truncate">
            {chapter}
          </p>
        )}
      </div>
    </Link>
  )
}

// ============================================================
// Section
// ============================================================

interface SectionProps {
  title: string
  subtitle: string
  items: (HomeComicItem | HomeLatestUpdate)[]
  imageMap: Record<string, string>
  numbered?: boolean
}

function ComicSection({ title, subtitle, items, imageMap, numbered }: SectionProps) {
  if (items.length === 0) return null

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#303133]">{title}</h2>
            <p className="text-sm text-[#9fa2a8] mt-0.5">{subtitle}</p>
          </div>
          <Link
            href="/populer"
            className="text-sm font-medium text-[#07beb8] hover:text-[#059b96] transition-colors shrink-0"
          >
            Read More &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {items.slice(0, numbered ? 8 : 12).map((item, i) => (
            <ComicCard
              key={`${item.slug}-${i}`}
              item={item}
              imageMap={imageMap}
              rank={numbered ? i + 1 : undefined}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================
// Banner Carousel (WebComics card-style)
// ============================================================

function BannerCarousel({ items, imageMap }: { items: (HomeComicItem | HomeLatestUpdate)[]; imageMap: Record<string, string> }) {
  const [current, setCurrent] = useState(0)
  const length = items.length

  const goTo = useCallback((i: number) => {
    setCurrent(((i % length) + length) % length)
  }, [length])

  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  useEffect(() => {
    if (length < 2) return
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [next, length])

  if (length === 0) return null

  const activeItem = items[current]

  return (
    <section className="bg-white pt-6 sm:pt-8 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative">
          {/* Viewport with card peek */}
          <div className="overflow-hidden rounded-3xl">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {items.map((item, i) => {
                const title = item.title
                const slug = item.slug
                const img = getCoverUrl(item, imageMap)
                return (
                  <Link
                    key={slug}
                    href={`/comic/${slug}`}
                    className="relative min-w-full aspect-[21/9] sm:aspect-[21/8] group"
                  >
                    <ComicImage
                      src={img}
                      alt={title}
                      className="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                      <h2 className="text-2xl sm:text-4xl font-bold text-white drop-shadow-lg">
                        {title}
                      </h2>
                      <div className="flex gap-2 mt-3">
                        <span className="bg-[#07beb8] text-white text-xs font-semibold px-3 py-1 rounded-full">
                          POPULAR
                        </span>
                        {"rating" in item && item.rating && (
                          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                            ★ {item.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Arrows */}
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center text-[#303133] hover:text-[#07beb8] transition-all z-10"
            aria-label="Previous"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center text-[#303133] hover:text-[#07beb8] transition-all z-10"
            aria-label="Next"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === current ? "bg-[#07beb8] w-6" : "bg-[#e1e2e6] hover:bg-[#c0c4cc]"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// Main HomeClient
// ============================================================

export default function HomeClient({ trending, updates, ongoing, imageMap }: Props) {
  const [activeGenre, setActiveGenre] = useState("for-you")
  const bannerItems = trending.length >= 5 ? trending.slice(0, 5) : ongoing.slice(0, 5)

  const getSectionData = (dataKey: "trending" | "updates" | "ongoing", slice: [number, number]) => {
    const data: (HomeComicItem | HomeLatestUpdate)[] =
      dataKey === "trending" ? trending
        : dataKey === "updates" ? updates
        : ongoing
    return data.slice(slice[0], slice[1])
  }

  return (
    <div className="bg-white text-[#303133] min-h-screen">
      {/* Sub-header genre tabs */}
      <div className="bg-white/95 border-b border-[#e7e8ec]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center overflow-x-auto no-scrollbar">
            {GENRES.map((g, i) => (
              <Fragment key={g.key}>
                <GenreTab
                  label={g.label}
                  active={activeGenre === g.key}
                  onClick={() => setActiveGenre(g.key)}
                />
                {i < GENRES.length - 1 && (
                  <div className="w-px h-4 bg-[#e1e2e6] shrink-0" />
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Banner Carousel */}
      <BannerCarousel items={bannerItems} imageMap={imageMap} />

      {/* Continue Reading */}
      <ContinueReading />

      {/* Sections */}
      {SECTIONS.map((sec) => (
        <ComicSection
          key={sec.title}
          title={sec.title}
          subtitle={sec.subtitle}
          items={getSectionData(sec.dataKey, sec.slice)}
          imageMap={imageMap}
          numbered={sec.numbered}
        />
      ))}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface ReadItem {
  comic_slug: string
  chapter_slug: string
  comic_title: string | null
  comic_image: string | null
  read_at: string
}

export default function ContinueReading() {
  const { data: session } = useSession()
  const [items, setItems] = useState<ReadItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user) {
      setLoading(false)
      return
    }
    fetch("/api/reading")
      .then(r => r.json())
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [session])

  if (loading || items.length === 0) return null

  return (
    <section className="py-10 border-b border-outline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-on-surface">Lanjut Baca</h2>
            <p className="text-sm text-muted mt-0.5">Lanjutkan dari chapter terakhir kamu</p>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar -mx-4 sm:-mx-6 px-4 sm:px-6">
          {items.map((item) => (
            <Link
              key={item.chapter_slug}
              href={`/chapter/${item.chapter_slug}`}
              className="group flex-shrink-0 w-40 sm:w-44"
            >
              <div className="relative overflow-hidden rounded-2xl bg-card-surface aspect-[3/4] shadow-sm">
                {item.comic_image ? (
                  <img
                    src={item.comic_image}
                    alt={item.comic_title || ""}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted text-sm font-bold">
                    {item.comic_title?.charAt(0) || "?"}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <span className="text-[10px] font-semibold text-white bg-brand px-2 py-0.5 rounded-full">
                    Lanjut
                  </span>
                </div>
              </div>
              <div className="mt-2 px-0.5">
                <h3 className="text-sm font-medium text-on-surface line-clamp-2 leading-tight group-hover:text-brand transition-colors">
                  {item.comic_title || item.comic_slug}
                </h3>
                <p className="text-xs text-muted mt-0.5 truncate">
                  {item.chapter_slug.split("-chapter-").pop()?.replace(/-/g, " ") || item.chapter_slug}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

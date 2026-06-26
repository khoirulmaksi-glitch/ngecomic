"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import type { ChapterData } from "@/lib/api"
import { proxyImage } from "@/lib/api"

interface Props {
  chapter: ChapterData
  comicSlug: string
  comicTitle: string
  chapterSlug: string
}

export default function ChapterReaderClient({ chapter, comicSlug, comicTitle, chapterSlug }: Props) {
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user) {
      fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comic_slug: comicSlug, chapter_slug: chapterSlug }),
      }).catch(() => {})
    }
  }, [session, comicSlug, chapterSlug])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <Link
          href={`/comic/${comicSlug}`}
          className="text-neon-cyan hover:text-neon-pink text-sm mb-2 inline-block transition-colors font-bold uppercase tracking-wider"
        >
          &larr; Back to {comicTitle}
        </Link>
        <h1 className="text-2xl font-bold text-brutal-white">
          {chapter.title}
        </h1>
      </div>

      {chapter.images && chapter.images.length > 0 && (
        <div className="space-y-4">
          {chapter.images.map((img, i) => (
            <img
              key={i}
              src={proxyImage(img)}
              alt={`${chapter.title} - Page ${i + 1}`}
              className="w-full border-2 border-zinc-800"
              loading="lazy"
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-8 pb-8">
        <Link
          href={`/comic/${comicSlug}`}
          className="px-6 py-3 bg-neon-cyan text-brutal-black font-bold uppercase tracking-wider text-sm hover:bg-brutal-white transition-colors"
        >
          Chapter List
        </Link>
      </div>
    </div>
  )
}

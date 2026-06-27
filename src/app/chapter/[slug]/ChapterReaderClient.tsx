"use client"

import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import type { ChapterData } from "@/lib/api"
import { proxyImage } from "@/lib/api"

interface Props {
  chapter: ChapterData
  comicSlug: string
  comicTitle: string
  comicImage: string
  chapterSlug: string
  prevSlug: string
  nextSlug: string
}

export default function ChapterReaderClient({ chapter, comicSlug, comicTitle, comicImage, chapterSlug, prevSlug, nextSlug }: Props) {
  const { data: session } = useSession()
  const topRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (session?.user) {
      fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comic_slug: comicSlug,
          chapter_slug: chapterSlug,
          comic_title: comicTitle,
          comic_image: comicImage,
        }),
      }).catch(() => {})
    }
  }, [session, comicSlug, chapterSlug, comicTitle, comicImage])

  const goTop = () => topRef.current?.scrollIntoView({ behavior: "smooth" })

  return (
    <div ref={topRef} className="max-w-4xl mx-auto px-4 py-6 animate-reveal-up">
      {/* Header info */}
      <div className="mb-6">
        <Link
          href={`/comic/${comicSlug}`}
          className="text-brand hover:text-neon-pink text-sm mb-2 inline-block transition-colors font-bold uppercase tracking-wider"
        >
          &larr; {comicTitle}
        </Link>
        <h1 className="text-2xl font-bold text-on-surface">
          {chapter.title}
        </h1>
      </div>

      {/* Navigation bar - sticky top */}
      <div className="sticky top-20 z-30 -mx-4 px-4 bg-surface/95 backdrop-blur-sm border-b border-outline mb-4">
        <div className="flex items-center justify-between gap-3 py-3">
          {prevSlug ? (
            <Link
              href={`/chapter/${prevSlug}`}
              prefetch={true}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Prev
            </Link>
          ) : (
            <div />
          )}

          <Link
            href={`/comic/${comicSlug}`}
            className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand border-2 border-brand rounded-lg hover:bg-brand hover:text-white transition-colors"
          >
            List
          </Link>

          {nextSlug ? (
            <Link
              href={`/chapter/${nextSlug}`}
              prefetch={true}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity"
            >
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* Chapter images */}
      {chapter.images && chapter.images.length > 0 && (
        <div className="space-y-4">
          {chapter.images.map((img, i) => (
            <img
              key={i}
              src={proxyImage(img)}
              alt={`${chapter.title} - Page ${i + 1}`}
              className="w-full border-2 border-outline"
              loading="lazy"
            />
          ))}
        </div>
      )}

      {/* Bottom navigation */}
      <div className="mt-8 pb-8 space-y-4">
        {/* Sticky nav clone at bottom */}
        <div className="flex items-center justify-between gap-3">
          {prevSlug ? (
            <Link
              href={`/chapter/${prevSlug}`}
              prefetch={true}
              className="flex items-center gap-2 px-5 py-3 bg-brand text-white font-bold uppercase tracking-wider text-sm rounded-lg hover:opacity-90 transition-opacity"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Previous Chapter
            </Link>
          ) : (
            <div />
          )}

          <button
            onClick={goTop}
            className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted hover:text-on-surface transition-colors"
          >
            Top &uarr;
          </button>

          {nextSlug ? (
            <Link
              href={`/chapter/${nextSlug}`}
              prefetch={true}
              className="flex items-center gap-2 px-5 py-3 bg-brand text-white font-bold uppercase tracking-wider text-sm rounded-lg hover:opacity-90 transition-opacity"
            >
              Next Chapter
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ) : (
            <div />
          )}
        </div>

        <div className="text-center">
          <Link
            href={`/comic/${comicSlug}`}
            className="inline-block px-6 py-3 border-2 border-outline text-on-surface font-bold uppercase tracking-wider text-sm rounded-lg hover:border-brand hover:text-brand transition-colors"
          >
            Chapter List
          </Link>
        </div>
      </div>
    </div>
  )
}

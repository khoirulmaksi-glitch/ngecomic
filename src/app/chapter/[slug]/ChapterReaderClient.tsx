"use client"

import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
  const topRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [loadingLabel, setLoadingLabel] = useState("")

  // Prefetch next & prev routes on mount so RSC data is cached
  useEffect(() => {
    if (nextSlug) router.prefetch(`/chapter/${nextSlug}`)
    if (prevSlug) router.prefetch(`/chapter/${prevSlug}`)
  }, [router, nextSlug, prevSlug])

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

  // Keyboard shortcuts: ← prev, → next
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === "ArrowLeft" && prevSlug) {
        e.preventDefault()
        setLoading(true)
        setLoadingLabel("Previous Chapter")
        router.push(`/chapter/${prevSlug}`)
      }
      if (e.key === "ArrowRight" && nextSlug) {
        e.preventDefault()
        setLoading(true)
        setLoadingLabel("Next Chapter")
        router.push(`/chapter/${nextSlug}`)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [router, prevSlug, nextSlug])

  const smoothNav = (href: string, label: string) => {
    setLoading(true)
    setLoadingLabel(label)
    router.push(href)
  }

  const goTop = () => topRef.current?.scrollIntoView({ behavior: "smooth" })

  return (
    <div ref={topRef} className="max-w-4xl mx-auto px-4 py-6">
      {/* Loading bar */}
      <div className={`fixed top-0 left-0 right-0 z-[100] h-0.5 bg-brand transition-all duration-300 ${loading ? "opacity-100" : "opacity-0"}`}>
        <div className="h-full bg-brand/40 w-full animate-loading-bar" />
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-[99] bg-surface/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted mt-3 font-medium">{loadingLabel}...</p>
          </div>
        </div>
      )}

      <div className="animate-reveal-up">
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
            <button
              onClick={() => smoothNav(`/chapter/${prevSlug}`, "Previous Chapter")}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Prev
            </button>
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
            <button
              onClick={() => smoothNav(`/chapter/${nextSlug}`, "Next Chapter")}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* Chapter images - login wall if not authenticated */}
      {chapter.images && chapter.images.length > 0 && (
        <div className="space-y-4 relative min-h-[60vh]">
          {session?.user ? (
            chapter.images.map((img, i) => (
              <img
                key={i}
                src={proxyImage(img)}
                alt={`${chapter.title} - Page ${i + 1}`}
                className="w-full border-2 border-outline"
                loading="lazy"
              />
            ))
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-surface border border-outline rounded-2xl shadow-2xl p-8 max-w-sm mx-4 text-center">
                <div className="w-14 h-14 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2">Login to Read</h3>
                <p className="text-sm text-muted mb-6">
                  Kamu harus login dulu untuk membaca chapter ini.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Login / Register
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom navigation */}
      <div className="mt-8 pb-8 space-y-4">
        {/* Sticky nav clone at bottom */}
        <div className="flex items-center justify-between gap-3">
          {prevSlug ? (
            <button
              onClick={() => smoothNav(`/chapter/${prevSlug}`, "Previous Chapter")}
              className="flex items-center gap-2 px-5 py-3 bg-brand text-white font-bold uppercase tracking-wider text-sm rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Previous Chapter
            </button>
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
            <button
              onClick={() => smoothNav(`/chapter/${nextSlug}`, "Next Chapter")}
              className="flex items-center gap-2 px-5 py-3 bg-brand text-white font-bold uppercase tracking-wider text-sm rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              Next Chapter
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
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
    </div>
  )
}

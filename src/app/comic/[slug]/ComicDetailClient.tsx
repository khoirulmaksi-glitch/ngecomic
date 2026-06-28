"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import Link from "next/link"
import type { MangaDetail } from "@/lib/api"
import ComicImage from "@/components/ComicImage"

interface Props {
  comic: MangaDetail
  slug: string
}

export default function ComicDetailClient({ comic, slug }: Props) {
  const { data: session } = useSession()
  const [favorited, setFavorited] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!session?.user) return
    fetch(`/api/favorites/check?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => setFavorited(d.favorited))
      .catch(() => {})
  }, [session, slug])

  async function toggleFavorite() {
    if (!session?.user) return
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comic_slug: slug,
        comic_title: comic.title,
        comic_image: comic.imageSrc,
      }),
    })
    const data = await res.json()
    setFavorited(data.favorited)
  }

  function shareComic() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: comic.title, url })
    } else {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <ComicImage
            src={comic.imageSrc}
            alt={comic.title}
            className="w-full aspect-[3/4]"
          />
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-brutal-white mb-2">
            {comic.title}
          </h1>

          {comic.alternative && (
            <p className="text-zinc-500 mb-4 text-sm">{comic.alternative}</p>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {session?.user && (
              <button
                onClick={toggleFavorite}
                className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors border-2 ${
                  favorited
                    ? "bg-neon-pink text-brutal-black border-neon-pink"
                    : "bg-transparent text-brutal-white border-brutal-white hover:bg-brutal-white hover:text-brutal-black"
                }`}
              >
                {favorited ? "Favorited" : "Favorite"}
              </button>
            )}
            <button
              onClick={shareComic}
              className="px-4 py-2 text-sm font-bold uppercase tracking-wider border-2 border-brutal-white text-brutal-white hover:bg-brutal-white hover:text-brutal-black transition-colors"
            >
              {copied ? "Copied!" : "Share"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            {comic.type && (
              <div>
                <span className="text-zinc-500">Type:</span>{" "}
                <span className="font-medium text-brutal-white">{comic.type}</span>
              </div>
            )}
            {comic.author && (
              <div>
                <span className="text-zinc-500">Author:</span>{" "}
                <span className="font-medium text-brutal-white">{comic.author}</span>
              </div>
            )}
            {comic.status && (
              <div>
                <span className="text-zinc-500">Status:</span>{" "}
                <span className="font-medium text-brutal-white">{comic.status}</span>
              </div>
            )}
            {comic.rating && (
              <div>
                <span className="text-zinc-500">Rating:</span>{" "}
                <span className="font-medium text-brutal-white">{comic.rating}</span>
              </div>
            )}
          </div>

          {comic.genres && comic.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {comic.genres.map((g) => (
                <Link
                  key={g.slug}
                  href={`/search?genre=${g.slug}`}
                  className="px-2.5 py-1 bg-zinc-800 text-neon-cyan text-xs font-mono border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  {g.name}
                </Link>
              ))}
            </div>
          )}

          {comic.synopsis && (
            <div className="mb-6">
              <h3 className="font-bold uppercase tracking-wider text-sm text-zinc-400 mb-2">Synopsis</h3>
              <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-line">
                {comic.synopsis}
              </p>
            </div>
          )}

          {comic.chapters && comic.chapters.length > 0 && (
            <div>
              <h3 className="font-bold uppercase tracking-wider text-sm text-zinc-400 mb-3">Chapters</h3>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {comic.chapters.map((ch) => (
                  <Link
                    key={ch.slug}
                    href={`/chapter/${ch.slug}`}
                    className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition text-sm group"
                  >
                    <span className="text-zinc-300 group-hover:text-neon-cyan transition-colors">{ch.title}</span>
                    {ch.date && (
                      <span className="text-xs text-zinc-600">{ch.date}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

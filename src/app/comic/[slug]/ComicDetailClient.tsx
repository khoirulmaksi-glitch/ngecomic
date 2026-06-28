"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import type { MangaDetail } from "@/lib/api"
import type { Comment } from "@/lib/types"
import ComicImage from "@/components/ComicImage"

interface Props {
  comic: MangaDetail
  slug: string
}

function CommentSection({ slug }: { slug: string }) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)

  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
      if (res.ok) setComments(await res.json())
    } catch {}
    setLoading(false)
  }, [slug])

  useEffect(() => { loadComments() }, [loadComments])

  async function postComment() {
    if (!content.trim()) return
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comic_slug: slug, content: content.trim() }),
    })
    if (res.ok) {
      setContent("")
      loadComments()
    }
  }

  async function deleteComment(id: number) {
    await fetch(`/api/comments/${id}`, { method: "DELETE" })
    loadComments()
  }

  return (
    <div className="border-t border-zinc-800 pt-8">
      <h3 className="text-lg font-bold text-brutal-white mb-6">Comments ({comments.length})</h3>

      {session?.user ? (
        <div className="flex gap-3 mb-8">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            maxLength={1000}
            rows={3}
            className="flex-1 bg-zinc-900 border border-zinc-700 text-brutal-white px-4 py-3 text-sm outline-none focus:border-neon-cyan transition-colors resize-none"
          />
          <button
            onClick={postComment}
            disabled={!content.trim()}
            className="self-end px-4 py-2 text-xs font-bold uppercase tracking-wider bg-neon-cyan text-black hover:bg-brutal-white transition-colors disabled:opacity-50"
          >
            Post
          </button>
        </div>
      ) : (
        <p className="text-zinc-500 text-sm mb-8">
          <Link href="/login" className="text-neon-cyan hover:underline">Login</Link> to comment.
        </p>
      )}

      {loading ? (
        <p className="text-zinc-500 font-mono text-sm">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-zinc-600 font-mono text-sm">No comments yet.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="border border-zinc-800 px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-neon-cyan">{c.user_name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-600 font-mono">
                    {new Date(c.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                  {(session?.user?.id === String(c.user_id) || session?.user?.role === "admin") && (
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="text-xs text-brutal-red hover:text-red-400"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
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

      <CommentSection slug={slug} />
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ComicImage from "@/components/ComicImage"

interface Favorite {
  id: number
  comic_slug: string
  comic_title: string
  comic_image: string
  created_at: string
}

export default function FavoritesPage() {
  const { status } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    if (status === "authenticated") {
      fetch("/api/favorites")
        .then((r) => r.json())
        .then((data) => setFavorites(data))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [status, router])

  async function removeFavorite(slug: string) {
    await fetch("/api/favorites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comic_slug: slug }),
    })
    setFavorites((prev) => prev.filter((f) => f.comic_slug !== slug))
  }

  if (status === "loading" || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-zinc-500 font-mono">
        Loading...
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-black tracking-tighter mb-8 text-brutal-white">
        My <span className="text-neon-pink">Favorites</span>
      </h1>

      {favorites.length === 0 ? (
        <div className="text-center py-20 text-zinc-600">
          <p className="text-lg font-mono">No favorites yet</p>
          <Link href="/" className="text-neon-cyan hover:text-neon-pink mt-2 inline-block font-bold uppercase tracking-wider text-sm transition-colors">
            Browse projects &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {favorites.map((fav) => (
            <div key={fav.id} className="group relative border-2 border-zinc-800 hover:border-neon-pink transition-colors bg-brutal-black overflow-hidden">
              <Link href={`/comic/${fav.comic_slug}`}>
                <div className="aspect-[3/4] overflow-hidden bg-brutal-gray">
                  <ComicImage
                    src={fav.comic_image}
                    alt={fav.comic_title}
                    className="w-full h-full group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm line-clamp-2 text-brutal-white group-hover:text-neon-pink transition-colors">
                    {fav.comic_title}
                  </h3>
                </div>
              </Link>
              <button
                onClick={() => removeFavorite(fav.comic_slug)}
                className="absolute top-2 right-2 bg-brutal-red text-white w-7 h-7 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

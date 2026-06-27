"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ComicImage from "@/components/ComicImage"
import PixelCard from "@/components/PixelCard"

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
      <div className="bg-surface text-on-surface min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-muted font-mono">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">My Favorites</h1>
          <p className="text-muted text-sm mt-1">Comics you&apos;ve bookmarked</p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <p className="text-lg font-mono">No favorites yet</p>
            <Link href="/" className="text-brand hover:text-accent-hover mt-2 inline-block font-bold uppercase tracking-wider text-sm transition-colors">
              Browse projects &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {favorites.map((fav) => (
              <PixelCard key={fav.id} variant="pink" className="border-2 border-outline hover:border-brand bg-surface">
                <div className="relative">
                  <Link href={`/comic/${fav.comic_slug}`} className="group block">
                    <div className="aspect-[3/4] overflow-hidden bg-card-surface">
                      <ComicImage
                        src={fav.comic_image}
                        alt={fav.comic_title}
                        className="w-full h-full group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-sm line-clamp-2 text-on-surface">
                        {fav.comic_title}
                      </h3>
                    </div>
                  </Link>
                  <button
                    onClick={() => removeFavorite(fav.comic_slug)}
                    className="absolute top-2 right-2 bg-danger text-white w-7 h-7 flex items-center justify-center text-xs font-bold"
                  >
                    X
                  </button>
                </div>
              </PixelCard>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import type { Comic } from "@/lib/types"
import ComicImage from "@/components/ComicImage"
import PixelCard from "@/components/PixelCard"

export default function ComicCard({ comic }: { comic: Comic }) {
  return (
    <PixelCard variant="pink" className="border-2 border-zinc-800 hover:border-neon-cyan bg-brutal-black">
      <Link
        href={`/comic/${comic.slug}`}
        className="group block"
      >
        <div className="aspect-[3/4] overflow-hidden">
          <ComicImage
            src={comic.image}
            alt={comic.title}
            className="w-full h-full group-hover:scale-105 transition duration-300"
          />
        </div>
        <div className="p-3">
          <h3 className="font-bold text-sm line-clamp-2 mb-1 text-brutal-white">
            {comic.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span className="font-mono">{comic.type || "Manga"}</span>
            {comic.rating && (
              <span className="flex items-center gap-1">
                <span className="text-neon-yellow">&#9733;</span>
                <span className="font-mono">{comic.rating}</span>
              </span>
            )}
          </div>
          {comic.chapter && (
            <p className="text-xs text-neon-pink mt-1 font-mono">{comic.chapter}</p>
          )}
        </div>
      </Link>
    </PixelCard>
  )
}

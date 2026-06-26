"use client"

import { useState } from "react"
import Link from "next/link"

interface SearchResult {
  title: string
  altTitle?: string
  slug: string
  href: string
  thumbnail: string
  type: string
  genre: string
  description: string
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setSearched(true)

    try {
      const res = await fetch(`/api/proxy?path=search&q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.data || data.comics || data.results || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function extractSlug(item: SearchResult): string {
    if (item.slug) return item.slug
    const match = item.href?.match(/\/manga\/([^/]+)/)
    return match ? match[1] : ""
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-black tracking-tighter mb-8 text-brutal-white">
        Cari <span className="text-neon-cyan">Komik</span>
      </h1>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari judul komik..."
          className="flex-1 px-4 py-3 border-2 border-zinc-700 bg-transparent text-brutal-white focus:border-neon-cyan outline-none transition-colors font-mono text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-neon-pink text-brutal-black font-bold uppercase tracking-wider text-sm hover:bg-neon-cyan transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "Cari"}
        </button>
      </form>

      {searched && !loading && results.length === 0 && (
        <p className="text-center text-zinc-600 py-10 font-mono">
          Tidak ada hasil untuk &quot;{query}&quot;
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {results.map((item) => {
          const slug = extractSlug(item)
          if (!slug) return null
          return (
            <Link
              key={item.slug || item.href}
              href={`/comic/${slug}`}
              className="group border-2 border-zinc-800 hover:border-neon-cyan transition-colors bg-brutal-black overflow-hidden"
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none"
                    const p = (e.target as HTMLElement).parentElement
                    if (p && !p.querySelector(".fl")) {
                      const s = document.createElement("span")
                      s.className = "fl absolute inset-0 flex items-center justify-center text-3xl font-black text-zinc-700"
                      s.textContent = item.title.charAt(0)
                      p.appendChild(s)
                    }
                  }}
                />
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm line-clamp-2 text-brutal-white group-hover:text-neon-cyan transition-colors">
                  {item.title}
                </h3>
                {item.type && (
                  <p className="text-xs text-neon-pink mt-1 font-mono">{item.type}</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

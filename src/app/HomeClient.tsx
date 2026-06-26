"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import type { HomeComicItem, HomeLatestUpdate } from "@/lib/api"
import ComicImage from "@/components/ComicImage"

interface HomeClientProps {
  trending: HomeComicItem[]
  updates: HomeLatestUpdate[]
  ongoing: HomeComicItem[]
  imageMap: Record<string, string>
}

const genres = [
  "Action", "Romance", "Fantasy", "Horror", "Comedy", "Drama",
  "Sci-Fi", "Slice of Life", "Adventure", "Thriller",
]

function realSrc(item: { slug: string; imageSrc: string }, imageMap: Record<string, string>): string {
  return imageMap[item.slug] || item.imageSrc
}

export default function HomeClient({ trending, updates, ongoing, imageMap }: HomeClientProps) {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" })
  const [submitted, setSubmitted] = useState(false)
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`
      }
    }
    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const trendingTop = trending.slice(0, 6)
  const latestChapters = updates.slice(0, 6)

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed w-2 h-2 bg-neon-pink rounded-full pointer-events-none z-[99999] mix-blend-difference hidden md:block"
      />

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center border-b-3 border-brutal-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,theme(colors.neon.pink/.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,theme(colors.neon.cyan/.03)_50%,transparent_52%)] bg-[length:20px_20px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
          <div className="max-w-4xl">
            <div className="inline-block border-2 border-neon-pink px-4 py-2 mb-6 animate-reveal-up stagger-1">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-neon-pink">
                Baca Manga Gratis
              </span>
            </div>

            <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] animate-reveal-up stagger-2">
              SELAMAT
              <br />
              <span className="text-neon-pink inline-block animate-float">DATANG</span>
              <br />
              DI NGECOMIC
            </h1>

            <p className="text-lg sm:text-xl text-zinc-400 max-w-xl mt-8 animate-reveal-up stagger-3 leading-relaxed">
              Platform baca manga dan komik favoritmu dengan koleksi lengkap, update terbaru, dan pengalaman membaca yang brutal.
            </p>

            <div className="flex flex-wrap gap-4 mt-10 animate-reveal-up stagger-4">
              <Link
                href="#trending"
                className="bg-brutal-white text-brutal-black font-black uppercase tracking-wider text-sm px-8 py-4 hover:bg-neon-pink hover:text-brutal-black transition-colors"
              >
                Mulai Baca
              </Link>
              <Link
                href="/search"
                className="border-3 border-brutal-white text-brutal-white font-black uppercase tracking-wider text-sm px-8 py-4 hover:bg-brutal-white hover:text-brutal-black transition-colors"
              >
                Cari Komik
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-16 text-zinc-600 text-xs font-mono animate-reveal-up stagger-5">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse-glow" />
                {ongoing.length}+ Komik
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse-glow" style={{ animationDelay: "0.5s" }} />
                Update Harian
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-neon-yellow rounded-full animate-pulse-glow" style={{ animationDelay: "1s" }} />
                Gratis Selamanya
              </span>
            </div>
          </div>

          <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:block">
            <div className="space-y-4 text-right">
              {["MANGA", "MANHWA", "MANHUA"].map((word, i) => (
                <div
                  key={word}
                  className="text-7xl font-black text-brutal-white/5 tracking-tighter select-none"
                  style={{ marginTop: i > 0 ? "-0.3em" : undefined }}
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 border-2 border-zinc-700 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-zinc-500 rounded-full mt-2 animate-pulse-glow" />
          </div>
        </div>
      </section>

      {/* Trending */}
      <section id="trending" className="border-b-3 border-brutal-white py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-neon-pink font-mono text-sm font-bold">[01]</span>
            <div className="h-0.5 flex-1 bg-brutal-white/20" />
          </div>
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-4xl sm:text-6xl font-black tracking-tighter mb-4">
                Trending
                <span className="text-neon-pink"> Now</span>
              </h2>
              <p className="text-zinc-400 max-w-xl text-lg">
                Komik paling populer yang lagi ramai dibaca.
              </p>
            </div>
            <Link
              href="/populer"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider border-2 border-brutal-white px-6 py-3 hover:bg-brutal-white hover:text-brutal-black transition-colors"
            >
              Lihat Semua
              <span className="text-lg">&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {trendingTop.map((item) => (
              <Link
                key={item.slug}
                href={`/comic/${item.slug}`}
                className="group border-2 border-zinc-800 hover:border-neon-pink transition-colors bg-brutal-black overflow-hidden"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <ComicImage
                    src={realSrc(item, imageMap)}
                    alt={item.title}
                    className="w-full h-full group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm leading-tight line-clamp-2 text-brutal-white group-hover:text-neon-pink transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <span className="text-zinc-600 font-mono">{item.latestChapter || "-"}</span>
                    {item.rating && (
                      <span className="text-neon-yellow font-mono">{item.rating}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/populer"
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider border-2 border-brutal-white px-6 py-3 hover:bg-brutal-white hover:text-brutal-black transition-colors"
            >
              Lihat Semua
              <span className="text-lg">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Updates */}
      <section className="border-b-3 border-brutal-white py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-neon-cyan font-mono text-sm font-bold">[02]</span>
            <div className="h-0.5 flex-1 bg-brutal-white/20" />
          </div>
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-4xl sm:text-6xl font-black tracking-tighter mb-4">
                Update
                <span className="text-neon-cyan"> Terbaru</span>
              </h2>
              <p className="text-zinc-400 max-w-xl text-lg">
                Chapter terbaru dari komik favoritmu, langsung update tiap hari.
              </p>
            </div>
            <Link
              href="/terbaru"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider border-2 border-brutal-white px-6 py-3 hover:bg-brutal-white hover:text-brutal-black transition-colors"
            >
              Lihat Semua
              <span className="text-lg">&rarr;</span>
            </Link>
          </div>

          <div className="space-y-4">
            {latestChapters.map((update) => (
              <Link
                key={update.slug}
                href={`/comic/${update.slug}`}
                className="group flex items-center gap-4 sm:gap-6 p-4 sm:p-6 border-2 border-zinc-800 hover:border-neon-cyan transition-colors"
              >
                <div className="shrink-0 w-12 h-16 sm:w-16 sm:h-20 overflow-hidden border border-zinc-700">
                  <ComicImage
                    src={imageMap[update.slug] || update.imageSrc}
                    alt={update.title}
                    className="w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold group-hover:text-neon-cyan transition-colors truncate">
                    {update.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {update.chapters.slice(0, 3).map((ch) => (
                      <span
                        key={ch.slug}
                        className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 font-mono"
                      >
                        {ch.title}
                        <span className="text-zinc-700 ml-1.5">{ch.timeAgo}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <span className="shrink-0 text-neon-cyan font-mono text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                  &rarr;
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/terbaru"
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider border-2 border-brutal-white px-6 py-3 hover:bg-brutal-white hover:text-brutal-black transition-colors"
            >
              Lihat Semua
              <span className="text-lg">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b-3 border-brutal-white py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: ongoing.length, label: "Total Komik", suffix: "+" },
              { value: trending.length, label: "Sedang Trending", suffix: "" },
              { value: updates.reduce((a, u) => a + u.chapters.length, 0), label: "Chapter Baru", suffix: "+" },
              { value: "Gratis", label: "Biaya Baca", suffix: "" },
            ].map((stat) => (
              <div key={stat.label} className="text-center brutal-border py-8 px-4 bg-brutal-gray/30">
                <div className="text-4xl sm:text-5xl font-black text-neon-cyan">
                  {stat.value}
                  <span className="text-neon-pink">{stat.suffix}</span>
                </div>
                <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-2">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Genres */}
      <section className="border-b-3 border-brutal-white py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-neon-yellow font-mono text-sm font-bold">[03]</span>
            <div className="h-0.5 flex-1 bg-brutal-white/20" />
          </div>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tighter mb-4">
            Explore
            <span className="text-neon-yellow"> Genre</span>
          </h2>
          <p className="text-zinc-400 max-w-xl mb-16 text-lg">
            Cari komik berdasarkan genre favoritmu.
          </p>

          <div className="flex flex-wrap gap-3">
            {genres.map((genre) => (
              <Link
                key={genre}
                href={`/search?genre=${genre.toLowerCase()}`}
                className="group border-2 border-zinc-800 px-5 py-3 hover:border-neon-yellow hover:bg-neon-yellow/5 transition-colors"
              >
                <span className="text-sm font-bold text-zinc-400 group-hover:text-neon-yellow transition-colors">
                  {genre}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Ongoing Grid */}
      <section className="border-b-3 border-brutal-white py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-neon-green font-mono text-sm font-bold">[04]</span>
            <div className="h-0.5 flex-1 bg-brutal-white/20" />
          </div>
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-4xl sm:text-6xl font-black tracking-tighter mb-4">
                Semua
                <span className="text-neon-green"> Komik</span>
              </h2>
              <p className="text-zinc-400 max-w-xl text-lg">
                Koleksi lengkap komik yang tersedia di Ngecomic.
              </p>
            </div>
            <Link
              href="/search"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider border-2 border-brutal-white px-6 py-3 hover:bg-brutal-white hover:text-brutal-black transition-colors"
            >
              Lihat Semua
              <span className="text-lg">&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {ongoing.slice(0, 15).map((item) => (
              <Link
                key={item.slug}
                href={`/comic/${item.slug}`}
                className="group relative aspect-[3/4] border-2 border-zinc-800 hover:border-neon-green transition-colors overflow-hidden bg-brutal-gray"
              >
                <ComicImage
                  src={realSrc(item, imageMap)}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-brutal-black via-brutal-black/80 to-transparent">
                  <h3 className="text-xs sm:text-sm font-bold leading-tight group-hover:text-neon-green transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-zinc-600 font-mono mt-1">
                    {item.latestChapter || "Ongoing"}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center sm:hidden">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider border-2 border-brutal-white px-6 py-3 hover:bg-brutal-white hover:text-brutal-black transition-colors"
            >
              Lihat Semua Komik
              <span className="text-lg">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Request / Contact */}
      <section id="request" className="border-b-3 border-brutal-white py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-neon-purple font-mono text-sm font-bold">[05]</span>
            <div className="h-0.5 flex-1 bg-brutal-white/20" />
          </div>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tighter mb-4">
            Request
            <span className="text-neon-purple"> Komik</span>
          </h2>
          <p className="text-zinc-400 max-w-xl mb-16 text-lg">
            Komik favoritmu belum ada di sini? Request aja, kami usahakan!
          </p>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    Nama Kamu
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full bg-transparent border-2 border-zinc-700 focus:border-neon-purple px-4 py-3 text-brutal-white outline-none transition-colors font-mono text-sm"
                    placeholder="Nama"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full bg-transparent border-2 border-zinc-700 focus:border-neon-purple px-4 py-3 text-brutal-white outline-none transition-colors font-mono text-sm"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    Judul Komik / Request
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full bg-transparent border-2 border-zinc-700 focus:border-neon-purple px-4 py-3 text-brutal-white outline-none transition-colors font-mono text-sm resize-none"
                    placeholder="Tulis judul komik yang kamu mau..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-neon-purple text-brutal-white font-black uppercase tracking-wider text-sm px-8 py-4 hover:bg-brutal-white hover:text-brutal-black transition-colors"
                >
                  {submitted ? "Request Terkirim!" : "Kirim Request"}
                </button>
              </form>
            </div>

            <div className="space-y-8 lg:pt-0 pt-8">
              <div className="border-2 border-zinc-800 p-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-neon-pink mb-2">
                  Koleksi
                </h4>
                <p className="text-lg font-mono text-brutal-white">
                  {ongoing.length}+ Komik
                </p>
              </div>
              <div className="border-2 border-zinc-800 p-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-neon-cyan mb-2">
                  Update
                </h4>
                <p className="text-lg font-mono text-brutal-white">
                  Setiap Hari
                </p>
              </div>
              <div className="border-2 border-zinc-800 p-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-neon-green mb-2">
                  Harga
                </h4>
                <p className="text-lg font-mono text-neon-green">
                  Gratis
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-block border-2 border-neon-pink px-6 py-3 mb-8">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-neon-pink">
              Yuk Baca
            </span>
          </div>
          <h2 className="text-5xl sm:text-8xl font-black tracking-tighter leading-[0.85]">
            RIBUAN
            <br />
            <span className="text-neon-pink">KOMIK</span>
            <br />
            SIAP DI BACA
          </h2>
          <Link
            href="/search"
            className="inline-block mt-10 bg-brutal-white text-brutal-black font-black uppercase tracking-wider text-sm px-10 py-5 hover:bg-neon-pink transition-colors"
          >
            Mulai Baca Sekarang
          </Link>
        </div>
      </section>
    </>
  )
}

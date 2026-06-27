"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { getLevelName } from "./LevelBadge"
import { useState, useCallback } from "react"
import { useTheme } from "./ThemeProvider"

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    setSearchQuery("")
    setMenuOpen(false)
  }, [searchQuery, router])

  return (
    <nav className="sticky top-0 z-50 bg-brutal-black border-b-3 border-brutal-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          <Link href="/" className="relative group shrink-0">
            <span className="text-2xl sm:text-3xl font-black tracking-tighter text-brutal-white uppercase">
              NGECOMIC
              <span className="text-neon-pink">.</span>
            </span>
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-neon-cyan scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 flex-1 max-w-3xl">
            <div className="flex items-center gap-6 shrink-0">
              {[
                { href: "/", label: "Beranda" },
                { href: "/populer", label: "Populer" },
                { href: "/terbaru", label: "Terbaru" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`text-sm font-bold uppercase tracking-widest hover:text-neon-cyan transition-colors relative group ${
                    pathname === href ? "text-neon-cyan" : "text-brutal-white"
                  }`}
                >
                  {label}
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-neon-pink scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
              ))}
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari komik..."
                className="w-full bg-zinc-900 border-2 border-zinc-700 text-brutal-white px-3 py-1.5 text-sm outline-none focus:border-neon-cyan transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-neon-cyan transition-colors p-1"
                aria-label="Search"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </form>

            <div className="flex items-center gap-2 shrink-0">
              {/* Theme toggle */}
              <button
                onClick={toggle}
                className="text-brutal-white hover:text-neon-cyan transition-colors p-2"
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                )}
              </button>

              {session ? (
                <div className="flex items-center gap-3 pl-2 border-l-3 border-brutal-white">
                  <Link href="/profile" className="text-xs text-zinc-400 hover:text-neon-cyan transition-colors">
                    {session.user.name}
                    <span
                      className="ml-1.5 bg-neon-pink text-black px-1.5 py-0.5 text-[10px] font-bold"
                      title={getLevelName(session.user.level)}
                    >
                      Lv.{session.user.level}
                    </span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-xs font-bold uppercase tracking-wider bg-brutal-red text-white px-3 py-1.5 hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-2 border-l-3 border-brutal-white">
                  <Link
                    href="/login"
                    className="text-xs font-bold uppercase tracking-wider bg-neon-pink text-black px-4 py-2 hover:bg-neon-cyan hover:text-black transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-xs font-bold uppercase tracking-wider border-2 border-brutal-white text-brutal-white px-4 py-2 hover:bg-brutal-white hover:text-brutal-black transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile buttons */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/search"
              className="text-brutal-white hover:text-neon-cyan transition-colors p-2"
              aria-label="Search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </Link>
            <button
              onClick={toggle}
              className="text-brutal-white hover:text-neon-cyan transition-colors p-2"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                )}
            </button>
            <button
              className="flex flex-col gap-1.5 p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`block w-6 h-0.5 bg-brutal-white transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-6 h-0.5 bg-brutal-white transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-6 h-0.5 bg-brutal-white transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t-3 border-brutal-white bg-brutal-black">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari komik..."
                className="w-full bg-zinc-900 border-2 border-zinc-700 text-brutal-white px-3 py-2 text-sm outline-none focus:border-neon-cyan transition-colors"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </form>

            <Link href="/" className="block text-sm font-bold uppercase tracking-widest" onClick={() => setMenuOpen(false)}>Beranda</Link>
            <Link href="/populer" className="block text-sm font-bold uppercase tracking-widest" onClick={() => setMenuOpen(false)}>Populer</Link>
            <Link href="/terbaru" className="block text-sm font-bold uppercase tracking-widest" onClick={() => setMenuOpen(false)}>Terbaru</Link>
            {session ? (
              <>
                <Link href="/favorites" className="block text-sm font-bold uppercase tracking-widest" onClick={() => setMenuOpen(false)}>Favorites</Link>
                <Link href="/profile" className="block text-sm font-bold uppercase tracking-widest" onClick={() => setMenuOpen(false)}>Profile</Link>
                {session.user.role === "admin" && (
                  <Link href="/admin" className="block text-sm font-bold uppercase tracking-widest" onClick={() => setMenuOpen(false)}>Admin</Link>
                )}
                <button onClick={() => signOut()} className="text-sm font-bold uppercase tracking-widest text-brutal-red">Logout</button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link href="/login" className="text-sm font-bold uppercase tracking-wider bg-neon-pink text-black px-4 py-2" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link href="/register" className="text-sm font-bold uppercase tracking-wider border-2 border-brutal-white text-brutal-white px-4 py-2" onClick={() => setMenuOpen(false)}>Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

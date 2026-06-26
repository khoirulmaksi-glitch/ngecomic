"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { getLevelName } from "./LevelBadge"
import { useState } from "react"

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-brutal-black border-b-3 border-brutal-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="relative group">
            <span className="text-2xl sm:text-3xl font-black tracking-tighter text-brutal-white uppercase">
              NGECOMIC
              <span className="text-neon-pink">.</span>
            </span>
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-neon-cyan scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[
              { href: "/", label: "Beranda" },
              { href: "/populer", label: "Populer" },
              { href: "/terbaru", label: "Terbaru" },
              { href: "/search", label: "Cari" },
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

            {session ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/favorites"
                  className={`text-sm font-bold uppercase tracking-widest hover:text-neon-cyan transition-colors ${
                    pathname === "/favorites" ? "text-neon-cyan" : "text-brutal-white"
                  }`}
                >
                  Favorites
                </Link>

                {session.user.role === "admin" && (
                  <Link
                    href="/admin"
                    className={`text-sm font-bold uppercase tracking-widest hover:text-neon-cyan transition-colors ${
                      pathname.startsWith("/admin") ? "text-neon-cyan" : "text-brutal-white"
                    }`}
                  >
                    Admin
                  </Link>
                )}

                <div className="flex items-center gap-3 border-l-3 border-brutal-white pl-4">
                  <span className="text-xs text-zinc-400">
                    {session.user.name}
                    <span
                      className="ml-1.5 bg-neon-pink text-black px-1.5 py-0.5 text-[10px] font-bold"
                      title={getLevelName(session.user.level)}
                    >
                      Lv.{session.user.level}
                    </span>
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="text-xs font-bold uppercase tracking-wider bg-brutal-red text-white px-3 py-1.5 hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
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

          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-brutal-white transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-brutal-white transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-brutal-white transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t-3 border-brutal-white bg-brutal-black">
          <div className="px-4 py-4 space-y-4">
            <Link href="/" className="block text-sm font-bold uppercase tracking-widest" onClick={() => setMenuOpen(false)}>Beranda</Link>
            <Link href="/populer" className="block text-sm font-bold uppercase tracking-widest" onClick={() => setMenuOpen(false)}>Populer</Link>
            <Link href="/terbaru" className="block text-sm font-bold uppercase tracking-widest" onClick={() => setMenuOpen(false)}>Terbaru</Link>
            <Link href="/search" className="block text-sm font-bold uppercase tracking-widest" onClick={() => setMenuOpen(false)}>Cari</Link>
            {session ? (
              <>
                <Link href="/favorites" className="block text-sm font-bold uppercase tracking-widest" onClick={() => setMenuOpen(false)}>Favorites</Link>
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

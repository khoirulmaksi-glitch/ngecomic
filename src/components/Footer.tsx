import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t-3 border-brutal-white bg-brutal-black mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <span className="text-2xl font-black tracking-tighter text-brutal-white uppercase">
              NGECOMIC<span className="text-neon-pink">.</span>
            </span>
            <p className="text-zinc-500 text-sm mt-2 max-w-xs">
              Platform baca manga, manhwa, dan komik favoritmu. Gratis, update tiap hari.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-neon-cyan mb-3">Menu</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-sm text-zinc-400 hover:text-brutal-white transition-colors">Beranda</Link>
              <Link href="/populer" className="block text-sm text-zinc-400 hover:text-brutal-white transition-colors">Populer</Link>
              <Link href="/terbaru" className="block text-sm text-zinc-400 hover:text-brutal-white transition-colors">Terbaru</Link>
              <Link href="/search" className="block text-sm text-zinc-400 hover:text-brutal-white transition-colors">Cari</Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-neon-pink mb-3">Genre</h4>
            <div className="space-y-2">
              <Link href="/search?genre=action" className="block text-sm text-zinc-400 hover:text-brutal-white transition-colors">Action</Link>
              <Link href="/search?genre=romance" className="block text-sm text-zinc-400 hover:text-brutal-white transition-colors">Romance</Link>
              <Link href="/search?genre=fantasy" className="block text-sm text-zinc-400 hover:text-brutal-white transition-colors">Fantasy</Link>
              <Link href="/search?genre=horror" className="block text-sm text-zinc-400 hover:text-brutal-white transition-colors">Horror</Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-neon-green mb-3">Info</h4>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-zinc-400 hover:text-brutal-white transition-colors">Tentang</a>
              <a href="#" className="block text-sm text-zinc-400 hover:text-brutal-white transition-colors">Kebijakan Privasi</a>
              <a href="#" className="block text-sm text-zinc-400 hover:text-brutal-white transition-colors">Syarat & Ketentuan</a>
              <a href="#request" className="block text-sm text-zinc-400 hover:text-brutal-white transition-colors">Request Komik</a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-xs">
            &copy; {new Date().getFullYear()} Ngecomic. All rights reserved.
          </p>
          <p className="text-zinc-700 text-[10px] font-mono">
            Baca manga gratis selamanya
          </p>
        </div>
      </div>
    </footer>
  )
}

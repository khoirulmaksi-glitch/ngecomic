import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-8xl font-black tracking-tighter text-zinc-800 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-zinc-400 mb-2 uppercase tracking-wider">
        Page Not Found
      </h2>
      <p className="text-zinc-600 mb-8 font-mono text-sm">
        This page doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-neon-pink text-brutal-black font-bold uppercase tracking-wider text-sm hover:bg-brutal-white transition-colors"
      >
        Back Home
      </Link>
    </div>
  )
}

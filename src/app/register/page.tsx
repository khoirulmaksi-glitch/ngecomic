"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Registration failed")
        setLoading(false)
        return
      }

      router.push("/login?registered=true")
    } catch {
      setError("Server error")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="border-2 border-brutal-white p-8 bg-brutal-black">
          <h1 className="text-3xl font-black tracking-tighter mb-8 text-brutal-white text-center">
            Register
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="border-2 border-brutal-red text-brutal-red p-3 text-sm font-mono">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-2 border-zinc-700 focus:border-neon-cyan px-4 py-3 text-brutal-white outline-none transition-colors font-mono text-sm"
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-2 border-zinc-700 focus:border-neon-cyan px-4 py-3 text-brutal-white outline-none transition-colors font-mono text-sm"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-2 border-zinc-700 focus:border-neon-cyan px-4 py-3 text-brutal-white outline-none transition-colors font-mono text-sm"
                placeholder="Min 6 characters"
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neon-green text-brutal-black font-bold uppercase tracking-wider text-sm px-8 py-4 hover:bg-neon-cyan transition-colors disabled:opacity-50"
            >
              {loading ? "Processing..." : "Register"}
            </button>

            <p className="text-center text-sm text-zinc-600 font-mono">
              Already have an account?{" "}
              <Link href="/login" className="text-neon-cyan hover:text-neon-pink transition-colors font-bold">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

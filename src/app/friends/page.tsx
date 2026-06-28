"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import type { Friend } from "@/lib/types"

export default function FriendsPage() {
  const { data: session } = useSession()
  if (!session) redirect("/login")

  return <FriendsContent />
}

function FriendsContent() {
  const [tab, setTab] = useState<"friends" | "requests" | "search">("friends")
  const [friends, setFriends] = useState<Friend[]>([])
  const [requests, setRequests] = useState<Friend[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState("")

  const loadFriends = useCallback(async () => {
    try {
      const res = await fetch("/api/friends")
      if (res.ok) setFriends(await res.json())
    } catch {}
  }, [])

  const loadRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/friends/requests")
      if (res.ok) setRequests(await res.json())
    } catch {}
  }, [])

  useEffect(() => {
    Promise.all([loadFriends(), loadRequests()]).then(() => setLoading(false))
  }, [loadFriends, loadRequests])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
        if (res.ok) setSearchResults(await res.json())
      } catch {}
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  async function sendRequest(friendId: number) {
    setMsg("")
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send", friendId }),
    })
    const data = await res.json()
    if (res.ok) setMsg("Request sent!")
    else setMsg(data.error || "Gagal")
    setTimeout(() => setMsg(""), 2000)
  }

  async function respond(requestId: number, action: "accept" | "reject") {
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, requestId }),
    })
    if (res.ok) {
      loadRequests()
      loadFriends()
    }
  }

  async function removeFriend(friendId: number) {
    await fetch("/api/friends", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendId }),
    })
    loadFriends()
  }

  const tabs: { key: "friends" | "requests" | "search"; label: string; count?: number }[] = [
    { key: "friends", label: "Friends", count: friends.length },
    { key: "requests", label: "Requests", count: requests.length },
    { key: "search", label: "Find Users" },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-neon-cyan font-mono text-sm font-bold">[FRIENDS]</span>
        <div className="h-0.5 flex-1 bg-brutal-white/20" />
      </div>

      <h1 className="text-4xl sm:text-6xl font-black tracking-tighter mb-12">
        My<span className="text-neon-cyan"> Friends</span>
      </h1>

      <div className="flex gap-1 mb-8 border-b border-zinc-800">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
              tab === t.key
                ? "text-neon-cyan border-b-2 border-neon-cyan"
                : "text-zinc-500 hover:text-brutal-white"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="ml-2 text-neon-pink">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {msg && (
        <p className="text-neon-green text-xs font-mono mb-4">{msg}</p>
      )}

      {tab === "friends" && (
        <div>
          {loading ? (
            <p className="text-zinc-500 font-mono text-sm">Loading...</p>
          ) : friends.length === 0 ? (
            <p className="text-zinc-500 font-mono text-sm">No friends yet.</p>
          ) : (
            <div className="space-y-2">
              {friends.map((f) => (
                <div key={f.id} className="flex items-center justify-between border border-zinc-800 px-4 py-3">
                  <div>
                    <p className="text-brutal-white font-medium">{f.friend_name}</p>
                    <p className="text-zinc-500 text-xs font-mono">Level {f.friend_level}</p>
                  </div>
                  <button
                    onClick={() => removeFriend(f.friend_id)}
                    className="text-xs text-brutal-red hover:text-red-400 font-bold uppercase tracking-wider"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "requests" && (
        <div>
          {loading ? (
            <p className="text-zinc-500 font-mono text-sm">Loading...</p>
          ) : requests.length === 0 ? (
            <p className="text-zinc-500 font-mono text-sm">No pending requests.</p>
          ) : (
            <div className="space-y-2">
              {requests.map((r) => (
                <div key={r.id} className="flex items-center justify-between border border-zinc-800 px-4 py-3">
                  <div>
                    <p className="text-brutal-white font-medium">{r.friend_name}</p>
                    <p className="text-zinc-500 text-xs font-mono">Level {r.friend_level}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respond(r.id, "accept")}
                      className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-neon-cyan text-black hover:bg-brutal-white transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respond(r.id, "reject")}
                      className="px-3 py-1 text-xs font-bold uppercase tracking-wider border border-zinc-700 text-zinc-400 hover:text-brutal-white transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "search" && (
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-transparent border-2 border-zinc-700 focus:border-neon-cyan px-4 py-3 text-brutal-white outline-none font-mono text-sm mb-4"
          />
          {searchResults.length === 0 && searchQuery.trim() && (
            <p className="text-zinc-500 font-mono text-sm">No users found.</p>
          )}
          <div className="space-y-2">
            {searchResults.map((u) => (
              <div key={u.id} className="flex items-center justify-between border border-zinc-800 px-4 py-3">
                <div>
                  <p className="text-brutal-white font-medium">{u.name}</p>
                  <p className="text-zinc-500 text-xs font-mono">{u.email} · Level {u.level}</p>
                </div>
                <button
                  onClick={() => sendRequest(u.id)}
                  className="px-3 py-1 text-xs font-bold uppercase tracking-wider border border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black transition-colors"
                >
                  Add Friend
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

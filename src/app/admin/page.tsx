"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Stats {
  total_users: number
  total_favorites: number
  total_reads: number
  endpoint_stats: { endpoint: string; method: string; count: string; avg_duration: number }[]
  recent_logs: {
    id: number
    endpoint: string
    method: string
    status_code: number
    duration_ms: number
    user_id: number | null
    ip_address: string
    created_at: string
  }[]
  hourly_stats: { hour: string; total_requests: string; avg_duration: number }[]
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/")
      return
    }
  }, [status, session, router])

  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/admin/stats")
      .then((res) => {
        if (res.status === 401) router.push("/login")
        return res.json()
      })
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status, router])

  function refreshStats() {
    fetch("/api/admin/stats")
      .then((res) => {
        if (res.status === 401) router.push("/login")
        return res.json()
      })
      .then((data) => setStats(data))
      .catch(() => {})
  }

  useEffect(() => {
    if (!autoRefresh || !stats) return
    const interval = setInterval(refreshStats, refreshInterval * 1000)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, stats, refreshStats])

  if (status === "loading" || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center text-zinc-500 font-mono">
        Loading...
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-brutal-white">
            Admin Panel
          </h1>
          <Link
            href="/admin/users"
            className="text-neon-cyan hover:text-neon-pink text-sm mt-1 inline-block transition-colors font-bold uppercase tracking-wider"
          >
            User Management &rarr;
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-500 font-mono">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-neon-cyan"
            />
            Auto-refresh
          </label>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="text-sm border-2 border-zinc-700 px-2 py-1 bg-brutal-black text-brutal-white font-mono"
          >
            <option value={10}>10s</option>
            <option value={30}>30s</option>
            <option value={60}>1m</option>
          </select>
          <button
            onClick={refreshStats}
            className="text-sm bg-neon-pink text-brutal-black font-bold px-4 py-1.5 hover:bg-neon-cyan transition-colors uppercase tracking-wider"
          >
            Refresh
          </button>
        </div>
      </div>

      {stats && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border-2 border-zinc-800 p-6 bg-brutal-black">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Total Users</h3>
              <p className="text-4xl font-black text-neon-cyan">
                {stats.total_users}
              </p>
            </div>
            <div className="border-2 border-zinc-800 p-6 bg-brutal-black">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Total Favorites</h3>
              <p className="text-4xl font-black text-neon-pink">
                {stats.total_favorites}
              </p>
            </div>
            <div className="border-2 border-zinc-800 p-6 bg-brutal-black">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Total Reads</h3>
              <p className="text-4xl font-black text-neon-yellow">
                {stats.total_reads}
              </p>
            </div>
          </div>

          {/* Hourly Stats */}
          {stats.hourly_stats.length > 0 && (
            <div className="border-2 border-zinc-800 p-6 bg-brutal-black mb-8">
              <h2 className="text-lg font-bold text-brutal-white mb-4 uppercase tracking-wider">
                Requests Per Hour (Last 24h)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-zinc-500 border-b border-zinc-800 font-mono">
                      <th className="pb-2">Hour</th>
                      <th className="pb-2">Total Requests</th>
                      <th className="pb-2">Avg Duration (ms)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.hourly_stats.map((h) => (
                      <tr key={h.hour} className="border-b border-zinc-800/50 font-mono text-zinc-400">
                        <td className="py-2">{new Date(h.hour).toLocaleString()}</td>
                        <td className="py-2">{h.total_requests}</td>
                        <td className="py-2">{h.avg_duration} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Endpoint Stats */}
          <div className="border-2 border-zinc-800 p-6 bg-brutal-black mb-8">
            <h2 className="text-lg font-bold text-brutal-white mb-4 uppercase tracking-wider">
              API Endpoint Stats
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-500 border-b border-zinc-800 font-mono">
                    <th className="pb-2">Endpoint</th>
                    <th className="pb-2">Method</th>
                    <th className="pb-2">Count</th>
                    <th className="pb-2">Avg Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.endpoint_stats.map((ep, i) => (
                    <tr key={i} className="border-b border-zinc-800/50 font-mono text-zinc-400">
                      <td className="py-2 text-xs">{ep.endpoint}</td>
                      <td className="py-2">{ep.method}</td>
                      <td className="py-2">{ep.count}</td>
                      <td className="py-2">{ep.avg_duration} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Logs */}
          <div className="border-2 border-zinc-800 p-6 bg-brutal-black">
            <h2 className="text-lg font-bold text-brutal-white mb-4 uppercase tracking-wider">
              Recent Logs
            </h2>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-500 border-b border-zinc-800 font-mono">
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Endpoint</th>
                    <th className="pb-2">Method</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Duration</th>
                    <th className="pb-2">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_logs.map((log) => (
                    <tr key={log.id} className="border-b border-zinc-800/50 font-mono text-zinc-400">
                      <td className="py-2 text-xs">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </td>
                      <td className="py-2 text-xs max-w-[200px] truncate">
                        {log.endpoint}
                      </td>
                      <td className="py-2">{log.method}</td>
                      <td className="py-2">
                        <span
                          className={`px-1.5 py-0.5 text-xs font-bold ${
                            log.status_code >= 200 && log.status_code < 300
                              ? "text-neon-green"
                              : "text-brutal-red"
                          }`}
                        >
                          {log.status_code}
                        </span>
                      </td>
                      <td className="py-2">{log.duration_ms}ms</td>
                      <td className="py-2 text-xs">{log.ip_address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

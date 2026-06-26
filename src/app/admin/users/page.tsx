"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import LevelBadge from "@/components/LevelBadge"

interface AdminUser {
  id: number
  name: string
  email: string
  role: string
  level: number
  total_reads: number
  created_at: string
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/")
      return
    }
    if (status === "authenticated") {
      fetch("/api/admin/users")
        .then((r) => r.json())
        .then(setUsers)
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [status, session, router])

  if (loading) {
    return <div className="text-center py-20 text-zinc-500 font-mono">Loading...</div>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin" className="text-neon-cyan hover:text-neon-pink text-sm transition-colors font-bold uppercase tracking-wider">
          &larr; Back to Dashboard
        </Link>
      </div>
      <h1 className="text-3xl font-black tracking-tighter mb-8 text-brutal-white">
        User Management
      </h1>

      <div className="border-2 border-zinc-800 overflow-hidden bg-brutal-black">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-500 border-b border-zinc-800 bg-brutal-gray/20 font-mono text-xs uppercase tracking-wider">
              <th className="p-4">ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Level</th>
              <th className="p-4">Total Reads</th>
              <th className="p-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-zinc-800/50 text-zinc-400">
                <td className="p-4">{user.id}</td>
                <td className="p-4 font-medium text-brutal-white">{user.name}</td>
                <td className="p-4 text-zinc-500">{user.email}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-0.5 text-xs font-bold uppercase ${
                      user.role === "admin"
                        ? "text-neon-pink border border-neon-pink"
                        : "text-neon-cyan border border-neon-cyan"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <LevelBadge level={user.level} totalReads={user.total_reads} />
                </td>
                <td className="p-4">{user.total_reads}</td>
                <td className="p-4 text-xs text-zinc-600">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

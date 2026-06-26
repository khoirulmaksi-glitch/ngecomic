"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useState } from "react"
import LevelBadge, { getLevelName } from "@/components/LevelBadge"

const LEVEL_THRESHOLDS = [0, 3, 8, 15, 25, 50, 100, 250, 500, 1000]

function getProgress(current: number): { currentLevel: number; nextLevel: number; currentThreshold: number; nextThreshold: number; progress: number } {
  let level = 1
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (current >= LEVEL_THRESHOLDS[i]) level = i + 1
  }
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0
  const nextThreshold = LEVEL_THRESHOLDS[level] || current + 1
  const progress = nextThreshold > currentThreshold ? ((current - currentThreshold) / (nextThreshold - currentThreshold)) * 100 : 100
  return { currentLevel: level, nextLevel: Math.min(level + 1, 10), currentThreshold, nextThreshold: nextThreshold > currentThreshold ? nextThreshold : current, progress }
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")

  if (!session) redirect("/login")

  const user = session.user
  const levelInfo = getProgress(user.total_reads)

  const handleSave = async () => {
    if (!name.trim() || name.trim() === user.name) {
      setEditing(false)
      return
    }
    setSaving(true)
    setMsg("")
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (!res.ok) {
        const d = await res.json()
        setMsg(d.error || "Gagal update")
        return
      }
      await update({ name: name.trim() })
      setEditing(false)
      setMsg("Username berhasil diubah!")
    } catch {
      setMsg("Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  const startEdit = () => {
    setName(user.name || "")
    setEditing(true)
    setMsg("")
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-neon-cyan font-mono text-sm font-bold">[PROFILE]</span>
        <div className="h-0.5 flex-1 bg-brutal-white/20" />
      </div>

      <h1 className="text-4xl sm:text-6xl font-black tracking-tighter mb-12">
        My
        <span className="text-neon-cyan"> Profile</span>
      </h1>

      <div className="grid gap-8">
        {/* Identity Card */}
        <div className="border-2 border-zinc-800 p-6 sm:p-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">Identity</h2>

          <div className="space-y-6">
            <div>
              <label className="text-xs text-zinc-600 font-mono uppercase tracking-wider">Email</label>
              <p className="text-lg font-mono text-brutal-white mt-1">{user.email}</p>
            </div>

            <div>
              <label className="text-xs text-zinc-600 font-mono uppercase tracking-wider">Username</label>
              {editing ? (
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="flex-1 bg-transparent border-2 border-zinc-700 focus:border-neon-cyan px-3 py-2 text-brutal-white outline-none font-mono"
                    autoFocus
                    maxLength={50}
                  />
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-neon-cyan text-black px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-brutal-white transition-colors disabled:opacity-50"
                  >
                    {saving ? "..." : "Simpan"}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="border border-zinc-700 text-zinc-400 px-4 py-2 text-xs font-bold uppercase tracking-wider hover:text-brutal-white transition-colors"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-lg font-mono text-brutal-white">{user.name}</p>
                  <button
                    onClick={startEdit}
                    className="text-xs text-neon-cyan hover:text-neon-pink transition-colors font-bold uppercase tracking-wider"
                  >
                    Ubah
                  </button>
                </div>
              )}
              {msg && <p className={`text-xs mt-2 font-mono ${msg.includes("gagal") || msg.includes("Gagal") ? "text-brutal-red" : "text-neon-green"}`}>{msg}</p>}
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="border-2 border-zinc-800 p-6 sm:p-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">Stats</h2>

          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <div className="text-center brutal-border py-6 px-4 bg-brutal-gray/30">
              <div className="text-3xl font-black text-neon-cyan">{user.level}</div>
              <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-2">Level</div>
            </div>
            <div className="text-center brutal-border py-6 px-4 bg-brutal-gray/30">
              <div className="text-3xl font-black text-neon-pink">{user.total_reads}</div>
              <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-2">Chapter Dibaca</div>
            </div>
            <div className="text-center brutal-border py-6 px-4 bg-brutal-gray/30">
              <div className="text-sm font-black text-neon-yellow uppercase">{getLevelName(levelInfo.nextLevel)}</div>
              <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-2">Next Level</div>
            </div>
          </div>

          {/* Level Badge */}
          <div className="mb-6">
            <LevelBadge level={user.level} totalReads={user.total_reads} />
          </div>

          {/* XP Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-zinc-500 font-mono mb-2">
              <span>Lv.{levelInfo.currentLevel}</span>
              <span>{user.total_reads} / {levelInfo.nextThreshold} reads</span>
              <span>Lv.{levelInfo.nextLevel}</span>
            </div>
            <div className="w-full h-3 border-2 border-zinc-700 bg-brutal-black overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-cyan to-neon-pink transition-all duration-500"
                style={{ width: `${Math.min(levelInfo.progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Level Names */}
          <div className="mt-8 border-t border-zinc-800 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Level Progression</h3>
            <div className="space-y-2">
              {LEVEL_THRESHOLDS.map((threshold, i) => {
                const lv = i + 1
                const unlocked = user.level >= lv
                return (
                  <div key={lv} className={`flex items-center gap-3 text-sm ${unlocked ? "text-brutal-white" : "text-zinc-700"}`}>
                    <span className={`w-6 h-6 flex items-center justify-center border text-xs font-bold ${unlocked ? "border-neon-cyan text-neon-cyan" : "border-zinc-700"}`}>
                      {lv}
                    </span>
                    <span className="font-mono">{getLevelName(lv)}</span>
                    <span className="text-xs text-zinc-600 font-mono ml-auto">{threshold}+ reads</span>
                    {unlocked && <span className="text-neon-green text-xs">✓</span>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Role Card */}
        <div className="border-2 border-zinc-800 p-6 sm:p-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">Account</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-zinc-400">Role:</span>
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 border ${user.role === "admin" ? "border-neon-pink text-neon-pink" : "border-zinc-600 text-zinc-400"}`}>
              {user.role}
            </span>
          </div>
          <p className="text-xs text-zinc-600 font-mono mt-4">
            Member since: {new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long" })}
          </p>
        </div>
      </div>
    </div>
  )
}

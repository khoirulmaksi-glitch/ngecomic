import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const totalUsers = await query("SELECT COUNT(*) FROM users WHERE role = 'user'")
  const totalFavorites = await query("SELECT COUNT(*) FROM favorites")
  const totalReads = await query("SELECT COUNT(*) FROM reading_history")
  const logs = await query(
    "SELECT endpoint, method, COUNT(*) as count, AVG(duration_ms)::int as avg_duration FROM api_logs GROUP BY endpoint, method ORDER BY count DESC LIMIT 50"
  )
  const recentLogs = await query(
    "SELECT * FROM api_logs ORDER BY created_at DESC LIMIT 100"
  )
  const hourlyStats = await query(
    `SELECT 
      DATE_TRUNC('hour', created_at) as hour,
      COUNT(*) as total_requests,
      AVG(duration_ms)::int as avg_duration
    FROM api_logs 
    WHERE created_at > NOW() - INTERVAL '24 hours'
    GROUP BY hour 
    ORDER BY hour`
  )

  return NextResponse.json({
    total_users: parseInt(totalUsers.rows[0].count),
    total_favorites: parseInt(totalFavorites.rows[0].count),
    total_reads: parseInt(totalReads.rows[0].count),
    endpoint_stats: logs.rows,
    recent_logs: recentLogs.rows,
    hourly_stats: hourlyStats.rows,
  })
}

import { NextResponse } from "next/server"
import { initDatabase } from "@/lib/init-db"

export async function GET() {
  try {
    await initDatabase()
    return NextResponse.json({ message: "Database initialized successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to initialize database", details: String(error) },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { query } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Semua field harus diisi" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 })
    }

    const existing = await query("SELECT id FROM users WHERE email = $1", [email])
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 })
    }

    if (email === "admin@gmail.com") {
      return NextResponse.json({ error: "Email tidak dapat digunakan" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    await query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'user')",
      [name, email, hashedPassword]
    )

    return NextResponse.json({ message: "Registrasi berhasil" }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}

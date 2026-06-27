import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { query } from "./db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const password = credentials.password as string

        const result = await query("SELECT * FROM users WHERE email = $1", [email])
        const user = result.rows[0]

        if (!user) return null

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) return null

        if (user.role === 'admin') {
          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            role: user.role,
            level: user.level,
            total_reads: user.total_reads,
          }
        }

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.role,
          level: user.level,
          total_reads: user.total_reads,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        const email = profile?.email as string
        const name = profile?.name as string

        const existing = await query("SELECT * FROM users WHERE email = $1", [email])
        if (existing.rows.length === 0) {
          await query(
            "INSERT INTO users (name, email, password, role, level, total_reads) VALUES ($1, $2, '', 'user', 1, 0) ON CONFLICT (email) DO NOTHING",
            [name, email]
          )
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        const result = await query("SELECT * FROM users WHERE email = $1", [token.email])
        if (result.rows[0]) {
          const u = result.rows[0]
          token.id = String(u.id)
          token.role = u.role
          token.level = u.level
          token.total_reads = u.total_reads
          token.name = u.name
        }
      } else if (user) {
        token.id = user.id
        token.role = user.role as string
        token.level = user.level as number
        token.total_reads = user.total_reads as number
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.level = token.level as number
        session.user.total_reads = token.total_reads as number
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
})

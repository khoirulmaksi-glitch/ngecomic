import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { query } from "./db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
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
    async jwt({ token, user }) {
      if (user) {
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

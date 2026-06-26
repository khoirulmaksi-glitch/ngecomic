import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnAdmin = nextUrl.pathname.startsWith("/admin")
      const isOnFavorites = nextUrl.pathname.startsWith("/favorites")
      const isOnLogin = nextUrl.pathname.startsWith("/login")
      const isOnRegister = nextUrl.pathname.startsWith("/register")

      if (isOnAdmin) {
        if (!isLoggedIn) return false
        if (auth?.user?.role !== "admin") return Response.redirect(new URL("/", nextUrl))
        return true
      }

      if (isOnFavorites) {
        if (!isLoggedIn) return false
        return true
      }

      if (isOnLogin || isOnRegister) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl))
        return true
      }

      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig

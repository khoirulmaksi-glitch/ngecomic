import "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
    level?: number
    total_reads?: number
  }
  interface Session {
    user: {
      id: string
      role: string
      level: number
      total_reads: number
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    level: number
    total_reads: number
  }
}

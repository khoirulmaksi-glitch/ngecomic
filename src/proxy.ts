import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // Protect favorites routes
  if (pathname.startsWith("/favorites")) {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/favorites/:path*"],
}

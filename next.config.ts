import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "thumbnail.komiku.org" },
      { protocol: "https", hostname: "img.komiku.org" },
      { protocol: "https", hostname: "komiku.org" },
      { protocol: "https", hostname: "img.klikcdn.com" },
      { protocol: "https", hostname: "komikstation.org" },
    ],
    unoptimized: true,
  },
  serverExternalPackages: ["@neondatabase/serverless"],
}

export default nextConfig

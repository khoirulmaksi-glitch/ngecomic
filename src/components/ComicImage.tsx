"use client"

import { useState } from "react"

const PROXIED_DOMAINS = ["komikstation.org", "img.klikcdn.com"]

function proxyImage(url: string): string {
  if (!url || url.startsWith("data:")) return url
  if (PROXIED_DOMAINS.some(d => url.includes(d))) {
    return `/api/img?url=${encodeURIComponent(url)}`
  }
  return url
}

interface Props {
  src: string
  alt: string
  className?: string
}

export default function ComicImage({ src, alt, className = "" }: Props) {
  const [broken, setBroken] = useState(false)
  const imgSrc = proxyImage(src)

  if (!src || src.startsWith("data:") || broken) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-zinc-600 via-zinc-800 to-brutal-black w-full h-full ${className}`}>
        <span className="text-3xl sm:text-4xl font-black text-zinc-500 select-none tracking-tighter">
          {alt.charAt(0)}
        </span>
      </div>
    )
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={`object-cover ${className}`}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  )
}

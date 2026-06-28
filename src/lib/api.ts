const BASE = process.env.API_BASE_URL || "https://www.sankavollerei.web.id"

const PROXY_SERVICES = [
  "https://api.allorigins.win/raw?url=",
  "https://corsproxy.io/?url=",
]

type FetcherOptions = {
  cache?: RequestInit["cache"]
  next?: { revalidate?: number; tags?: string[] }
}

const TIMEOUT_MS = 10000
const MAX_RETRIES = 2

async function fetchFromAPI<T>(path: string, options?: FetcherOptions): Promise<T> {
  const targetUrl = `${BASE}/comic${path}`
  const errors: string[] = []

  // Build URLs to try: direct first, then proxy services
  const urls = [targetUrl, ...PROXY_SERVICES.map(s => `${s}${encodeURIComponent(targetUrl)}`)]

  for (let i = 0; i < urls.length; i++) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

      try {
        const fetchOptions: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          },
          signal: controller.signal,
        }

        // Only apply Next.js cache options on direct URL (proxies don't support it)
        if (i === 0) {
          if (options?.next) {
            fetchOptions.next = options.next
          } else {
            fetchOptions.cache = options?.cache || "no-store"
          }
        }

        const res = await fetch(urls[i], fetchOptions)
        clearTimeout(timeout)
        if (!res.ok) {
          errors.push(`URL ${i} attempt ${attempt}: ${res.status}`)
          throw new Error(`API error: ${res.status}`)
        }
        return res.json() as Promise<T>
      } catch (e) {
        clearTimeout(timeout)
        if (i === urls.length - 1 && attempt === MAX_RETRIES) {
          errors.push(`Final: ${e instanceof Error ? e.message : "unknown"}`)
        }
        if (attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, attempt * 1000))
        }
      }
    }
  }

  throw new Error(`All fetch attempts failed: ${errors.join("; ")}`)
}

export interface HomeComicItem {
  title: string
  slug: string
  imageSrc: string
  rating?: string
  latestChapter?: string
}

export interface HomeChapterItem {
  slug: string
  title: string
  timeAgo: string
}

export interface HomeLatestUpdate {
  title: string
  slug: string
  imageSrc: string
  chapters: HomeChapterItem[]
}

export interface HomepageData {
  trending: HomeComicItem[]
  latestUpdates: HomeLatestUpdate[]
}

export interface PaginationInfo {
  currentPage: number
  hasNextPage: boolean
  nextPage: number | null
}

export interface OngoingData {
  pagination: PaginationInfo
  results: HomeComicItem[]
}

export interface MangaDetail {
  title: string
  alternative: string
  imageSrc: string
  rating: string
  synopsis: string
  type: string
  author: string
  status: string
  updatedOn: string
  genres: { name: string; slug: string }[]
  chapters: { title: string; slug: string; date: string }[]
}

export function getHomepage() {
  return fetchFromAPI<HomepageData>("/komikstation/home", { cache: "force-cache" })
}

export function getOngoing(page = 1) {
  return fetchFromAPI<OngoingData>(`/komikstation/ongoing?page=${page}`, { cache: "force-cache" })
}

export function getAZList(letter: string, page = 1) {
  return fetchFromAPI<OngoingData>(`/komikstation/az-list/${letter}?page=${page}`, { cache: "force-cache" })
}

export function getComicDetail(slug: string) {
  return fetchFromAPI<MangaDetail>(`/komikstation/manga/${slug}`, { cache: "force-cache" })
}

export interface ChapterData {
  title: string
  comicSlug: string | null
  images: string[]
}

export function getChapter(chapterSlug: string) {
  return fetchFromAPI<ChapterData>(`/komikstation/chapter/${chapterSlug}`, { cache: "no-store" })
}

const PROXIED_DOMAINS = ["komikstation.org", "img.klikcdn.com", "komiku.org"]

export function proxyImage(url: string): string {
  if (!url || url.startsWith("data:")) return url
  if (PROXIED_DOMAINS.some(d => url.includes(d))) {
    return `/api/img?url=${encodeURIComponent(url)}`
  }
  return url
}

export function extractSlugFromLink(link: string): string {
  const match = link.match(/\/manga\/([^/]+)/)
  return match ? match[1] : link.replace(/\/+$/, "").split("/").pop() || ""
}

export function getComicSlugFromChapterSlug(chapterSlug: string): string {
  return chapterSlug.replace(/-chapter-\d+$/, "")
}

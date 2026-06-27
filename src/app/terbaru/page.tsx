import { getOngoing, getComicDetail } from "@/lib/api"
import ComicCard from "@/components/ComicCard"
import type { Comic } from "@/lib/types"

export const dynamic = 'force-dynamic'

type ImageMap = Record<string, string>

export default async function TerbaruPage() {
  const data = await getOngoing(1)
  const items = data.results || []

  const slugList: string[] = []
  for (const i of items) {
    if (i.imageSrc.startsWith("data:")) {
      slugList.push(i.slug)
    }
  }

  const imageMap: ImageMap = {}
  if (slugList.length > 0) {
    const results = await Promise.allSettled(slugList.map(s => getComicDetail(s)))
    results.forEach((res, i) => {
      if (res.status === "fulfilled" && !res.value.imageSrc.startsWith("data:")) {
        imageMap[slugList[i]] = res.value.imageSrc
      }
    })
  }

  const comics: Comic[] = items.map((item) => ({
    title: item.title,
    slug: item.slug,
    image: imageMap[item.slug] || item.imageSrc,
    rating: item.rating || "",
    type: "",
    chapter: item.latestChapter || "",
  }))

  return (
    <div className="bg-surface text-on-surface min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Latest Updates</h1>
          <p className="text-muted text-sm mt-1">Fresh updates and new chapters</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
          {comics.map((comic) => (
            <ComicCard key={comic.slug} comic={comic} />
          ))}
        </div>
      </div>
    </div>
  )
}

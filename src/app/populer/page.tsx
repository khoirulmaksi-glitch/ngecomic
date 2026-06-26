import { getOngoing } from "@/lib/api"
import ComicCard from "@/components/ComicCard"
import type { Comic } from "@/lib/types"

export const dynamic = 'force-dynamic'

export default async function PopulerPage() {
  const data = await getOngoing(1)
  const comics: Comic[] = (data.results || []).map((item) => ({
    title: item.title,
    slug: item.slug,
    image: item.imageSrc,
    rating: item.rating || "",
    type: "",
    chapter: item.latestChapter || "",
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-brutal-white">Popular Projects</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {comics.map((comic) => (
          <ComicCard key={comic.slug} comic={comic} />
        ))}
      </div>
    </div>
  )
}

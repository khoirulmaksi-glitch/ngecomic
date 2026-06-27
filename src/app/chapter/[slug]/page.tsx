import { getChapter, getComicDetail } from "@/lib/api"
import ChapterReaderClient from "./ChapterReaderClient"

export const dynamic = 'force-dynamic'

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let chapter
  try {
    chapter = await getChapter(slug)
  } catch {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-zinc-500">Chapter not found</h1>
      </div>
    )
  }

  const comicSlug = slug.replace(/-chapter-\d+$/, "")
  let comicTitle = chapter.title
  let comicImage = ""
  let prevSlug = ""
  let nextSlug = ""

  try {
    const comic = await getComicDetail(comicSlug)
    comicTitle = comic.title
    comicImage = comic.imageSrc
    const chapters = comic.chapters || []
    const currentIdx = chapters.findIndex(ch => ch.slug === slug)
    if (currentIdx > 0) prevSlug = chapters[currentIdx - 1].slug
    if (currentIdx >= 0 && currentIdx < chapters.length - 1) nextSlug = chapters[currentIdx + 1].slug
  } catch {
    // use chapter title
  }

  return (
    <ChapterReaderClient
      chapter={chapter}
      comicSlug={comicSlug}
      comicTitle={comicTitle}
      comicImage={comicImage}
      chapterSlug={slug}
      prevSlug={prevSlug}
      nextSlug={nextSlug}
    />
  )
}

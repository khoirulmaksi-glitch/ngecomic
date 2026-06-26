import { getComicDetail } from "@/lib/api"
import ComicDetailClient from "./ComicDetailClient"
import type { Metadata } from "next"

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  try {
    const comic = await getComicDetail(slug)
    return {
      title: `${comic.title} - Ngecomic`,
      description: comic.synopsis?.slice(0, 160),
    }
  } catch {
    return { title: "Komik - Ngecomic" }
  }
}

export default async function ComicDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let comic
  try {
    comic = await getComicDetail(slug)
  } catch {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-zinc-500">Project not found</h1>
      </div>
    )
  }

  return <ComicDetailClient comic={comic} slug={slug} />
}

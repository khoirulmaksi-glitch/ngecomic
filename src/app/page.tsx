import { getHomepage, getOngoing, getComicDetail } from "@/lib/api"
import type { HomeComicItem, HomeLatestUpdate } from "@/lib/api"
import HomeClient from "./HomeClient"

export const dynamic = 'force-dynamic'

type ImageMap = Record<string, string>

async function buildImageMap(items: (HomeComicItem | HomeLatestUpdate)[]): Promise<ImageMap> {
  const slugList: string[] = []
  for (const i of items) {
    if (i.imageSrc.startsWith("data:")) {
      slugList.push("slug" in i ? i.slug : (i as HomeLatestUpdate).slug)
    }
  }

  if (slugList.length === 0) return {}

  const results = await Promise.allSettled(slugList.map(s => getComicDetail(s)))
  const map: ImageMap = {}

  results.forEach((res, i) => {
    if (res.status === "fulfilled" && !res.value.imageSrc.startsWith("data:")) {
      map[slugList[i]] = res.value.imageSrc
    }
  })

  return map
}

export default async function HomePage() {
  const [homeRes, ongoingRes] = await Promise.allSettled([
    getHomepage(),
    getOngoing(),
  ])

  const trending: HomeComicItem[] = homeRes.status === "fulfilled" ? homeRes.value.trending : []
  const updates: HomeLatestUpdate[] = homeRes.status === "fulfilled" ? homeRes.value.latestUpdates : []
  const ongoing: HomeComicItem[] = ongoingRes.status === "fulfilled" ? ongoingRes.value.results : []

  const [trendingMap, updatesMap, ongoingMap] = await Promise.all([
    buildImageMap(trending),
    buildImageMap(updates),
    buildImageMap(ongoing),
  ])

  const imageMap = { ...trendingMap, ...updatesMap, ...ongoingMap }

  return (
    <HomeClient
      trending={trending}
      updates={updates}
      ongoing={ongoing}
      imageMap={imageMap}
    />
  )
}

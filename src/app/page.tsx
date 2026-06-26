import { getHomepage, getOngoing } from "@/lib/api"
import type { HomeComicItem, HomeLatestUpdate } from "@/lib/api"
import HomeClient from "./HomeClient"

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [homeRes, ongoingRes] = await Promise.allSettled([
    getHomepage(),
    getOngoing(),
  ])

  const trending: HomeComicItem[] = homeRes.status === "fulfilled" ? homeRes.value.trending : []
  const updates: HomeLatestUpdate[] = homeRes.status === "fulfilled" ? homeRes.value.latestUpdates : []
  const ongoing: HomeComicItem[] = ongoingRes.status === "fulfilled" ? ongoingRes.value.results : []

  return (
    <HomeClient
      trending={trending}
      updates={updates}
      ongoing={ongoing}
    />
  )
}

export interface User {
  id: number
  name: string
  email: string
  password: string
  role: 'user' | 'admin'
  level: number
  total_reads: number
  created_at: Date
}

export interface Comic {
  title: string
  slug: string
  image: string
  rating: string
  type: string
  chapter: string
  description?: string
  views?: string
  genres?: string[]
  status?: string
  author?: string
  artist?: string
}

export interface Chapter {
  title: string
  slug: string
  images: string[]
  prev?: string
  next?: string
}

export interface ApiLog {
  id: number
  endpoint: string
  method: string
  status_code: number
  duration_ms: number
  user_id: number | null
  ip_address: string
  created_at: Date
}

export interface Friend {
  id: number
  user_id: number
  friend_id: number
  status: "pending" | "accepted"
  created_at: string
  friend_name?: string
  friend_email?: string
  friend_level?: number
}

export interface Comment {
  id: number
  comic_slug: string
  user_id: number
  content: string
  parent_id: number | null
  created_at: string
  user_name?: string
  user_level?: number
}

export interface ComicSource {
  title: string
  slug: string
  image: string
  rating: string
  type: string
  chapter: string
  description?: string
  views?: string
  genres?: string[]
}

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

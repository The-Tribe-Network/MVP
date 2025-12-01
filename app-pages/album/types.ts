export interface Photo {
  id: number | string
  url: string
  caption: string
  likes: number
  comments: number
  date?: string
}

export interface AlbumCreator {
  name: string
  avatar?: string | null
}

export interface AlbumStats {
  photos: number
  views: number
  likes: number
}

export interface Album {
  id: string | string[]
  name: string
  description: string
  date: string
  creator: AlbumCreator
  stats: AlbumStats
}


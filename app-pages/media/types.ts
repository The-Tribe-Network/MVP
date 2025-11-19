export interface Album {
  id: number | string
  name: string
  cover: string
  photoCount: number
  date: string
  trending?: boolean
}

export interface Photo {
  id: number | string
  url: string
  likes: number
  comments: number
  date: string
}


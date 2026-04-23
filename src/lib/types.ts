export type SnailVibe = 'normal' | 'cursed' | 'macro' | 'dark'
export type SnailDistance = 'close' | 'far'
export type SnailQuality = 'low' | 'medium'

export interface SnailItem {
  id: string
  type: 'image' | 'video'
  src: string
  preview?: string
  city?: string
  vibe: SnailVibe
  distance: SnailDistance
  quality: SnailQuality
}

export interface DatasetMeta {
  total: number
  chunks: number
  version: string
  updatedAt: string
}

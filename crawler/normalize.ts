import XXH from 'xxhashjs'
import { classifyVibe, classifyDistance } from './classify'
import type { SnailItem } from '../src/lib/types'

export interface RawEntry {
  imageUrl: string
  sourceUrl: string
  width?: number
  height?: number
  title?: string
}

export function normalize(raw: RawEntry): SnailItem {
  const id = XXH.h32(raw.imageUrl, 0).toString(16)
  const width = raw.width ?? 640
  const height = raw.height ?? 480
  return {
    id,
    type: 'image',
    src: raw.imageUrl,
    vibe: classifyVibe(width, height),
    distance: classifyDistance(width, height),
    quality: width * height > 300_000 ? 'medium' : 'low',
  }
}

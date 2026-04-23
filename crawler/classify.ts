import type { SnailVibe, SnailDistance } from '../src/lib/types'

export function classifyVibe(width: number, height: number): SnailVibe {
  const pixels = width * height
  if (pixels < 100_000) return 'cursed'
  if (width > height * 1.5 || height > width * 1.5) return 'macro'
  return 'normal'
}

export function classifyDistance(width: number, height: number): SnailDistance {
  const ratio = Math.max(width, height) / Math.min(width, height)
  return ratio < 1.4 ? 'close' : 'far'
}

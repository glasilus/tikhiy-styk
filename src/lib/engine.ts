import { SnailRNG } from './rng'
import { BloomFilter } from './bloom'
import type { SnailItem, SnailVibe } from './types'

const VIBE_WEIGHTS: Record<SnailVibe, number> = {
  normal: 0.70,
  macro:  0.15,
  cursed: 0.10,
  dark:   0.05,
}
const VIDEO_CHANCE = 0.08

export class SnailEngine {
  private rng: SnailRNG
  private pool: SnailItem[]
  private history: BloomFilter

  constructor(seed: string, pool: SnailItem[]) {
    this.rng = new SnailRNG(seed)
    this.pool = pool
    this.history = new BloomFilter(50000)
  }

  reseed(seed: string): void {
    this.rng = new SnailRNG(seed)
  }

  addToPool(items: SnailItem[]): void {
    this.pool = [...this.pool, ...items]
  }

  pick(): SnailItem {
    const forceVideo = this.rng.nextFloat() < VIDEO_CHANCE

    for (let attempt = 0; attempt < 20; attempt++) {
      const candidate = this.weightedPick(forceVideo)
      if (!this.history.has(candidate.id)) {
        this.history.add(candidate.id)
        return candidate
      }
    }
    this.history.clear()
    return this.weightedPick(forceVideo)
  }

  private weightedPick(preferVideo: boolean): SnailItem {
    const eligible = preferVideo
      ? this.pool.filter(s => s.type === 'video')
      : this.pool.filter(s => s.type === 'image')

    const candidates = eligible.length > 0 ? eligible : this.pool

    const totalWeight = candidates.reduce((s, c) => s + VIBE_WEIGHTS[c.vibe], 0)
    let roll = this.rng.nextFloat() * totalWeight
    for (const item of candidates) {
      roll -= VIBE_WEIGHTS[item.vibe]
      if (roll <= 0) return item
    }
    return candidates[candidates.length - 1]
  }
}

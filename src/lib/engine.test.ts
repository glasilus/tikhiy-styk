import { describe, it, expect } from 'vitest'
import { SnailEngine } from './engine'
import type { SnailItem } from './types'

function makePool(n: number): SnailItem[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `snail-${i}`,
    type: 'image' as const,
    src: `https://x.avito.st/${i}.jpg`,
    vibe: i % 10 === 0 ? 'cursed' as const : 'normal' as const,
    distance: 'close' as const,
    quality: 'low' as const,
  }))
}

describe('SnailEngine', () => {
  it('pick возвращает элемент из пула', () => {
    const pool = makePool(100)
    const engine = new SnailEngine('test-seed', pool)
    const result = engine.pick()
    expect(pool.find(s => s.id === result.id)).toBeDefined()
  })
  it('одинаковый seed → одинаковая первая выдача', () => {
    const pool = makePool(100)
    const a = new SnailEngine('same', pool)
    const b = new SnailEngine('same', pool)
    expect(a.pick().id).toBe(b.pick().id)
  })
  it('не повторяет недавно показанных (история 10)', () => {
    const pool = makePool(20)
    const engine = new SnailEngine('history-test', pool)
    const seen = new Set<string>()
    for (let i = 0; i < 10; i++) seen.add(engine.pick().id)
    const eleventh = engine.pick()
    expect(eleventh).toBeDefined()
  })
  it('video — редкость: < 15% при пуле 50% видео', () => {
    const pool: SnailItem[] = makePool(50).map((s, i) => ({
      ...s, type: i % 2 === 0 ? 'video' as const : 'image' as const
    }))
    const engine = new SnailEngine('video-test', pool)
    let videos = 0
    for (let i = 0; i < 100; i++) {
      if (engine.pick().type === 'video') videos++
    }
    expect(videos).toBeLessThan(15)
  })
})

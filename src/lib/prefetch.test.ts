import { describe, it, expect } from 'vitest'
import { PrefetchQueue } from './prefetch'
import type { SnailItem } from './types'

const makeItem = (id: string, priority: number): { item: SnailItem; priority: number } => ({
  item: {
    id, type: 'image', src: `https://example.avito.st/${id}.jpg`,
    vibe: 'normal', distance: 'close', quality: 'low',
  },
  priority,
})

describe('PrefetchQueue', () => {
  it('pop возвращает элемент с наивысшим приоритетом', () => {
    const q = new PrefetchQueue()
    q.push(makeItem('a', 5))
    q.push(makeItem('b', 1))
    q.push(makeItem('c', 3))
    expect(q.pop()!.item.id).toBe('b')
  })
  it('isEmpty = true для пустой очереди', () => {
    expect(new PrefetchQueue().isEmpty()).toBe(true)
  })
  it('size отражает количество элементов', () => {
    const q = new PrefetchQueue()
    q.push(makeItem('x', 1))
    q.push(makeItem('y', 2))
    expect(q.size()).toBe(2)
    q.pop()
    expect(q.size()).toBe(1)
  })
})

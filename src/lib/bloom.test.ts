import { describe, it, expect } from 'vitest'
import { BloomFilter } from './bloom'

describe('BloomFilter', () => {
  it('после add → has возвращает true', () => {
    const bf = new BloomFilter(1000)
    bf.add('snail-abc123')
    expect(bf.has('snail-abc123')).toBe(true)
  })
  it('не добавленный ID → has возвращает false', () => {
    const bf = new BloomFilter(1000)
    bf.add('snail-abc123')
    expect(bf.has('snail-xyz999')).toBe(false)
  })
  it('clear сбрасывает фильтр', () => {
    const bf = new BloomFilter(1000)
    bf.add('snail-abc123')
    bf.clear()
    expect(bf.has('snail-abc123')).toBe(false)
  })
  it('false positive rate < 1% для 1000 элементов', () => {
    const bf = new BloomFilter(10000)
    for (let i = 0; i < 1000; i++) bf.add(`snail-${i}`)
    let fp = 0
    for (let i = 1000; i < 2000; i++) {
      if (bf.has(`snail-${i}`)) fp++
    }
    expect(fp / 1000).toBeLessThan(0.01)
  })
})

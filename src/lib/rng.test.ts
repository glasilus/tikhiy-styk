import { describe, it, expect } from 'vitest'
import { xxHash32, SnailRNG } from './rng'

describe('xxHash32', () => {
  it('возвращает одинаковое число для одного инпута', () => {
    expect(xxHash32('ахатина')).toBe(xxHash32('ахатина'))
  })
  it('возвращает разные числа для разных инпутов', () => {
    expect(xxHash32('улитка')).not.toBe(xxHash32('ахатина'))
  })
  it('работает с пустой строкой', () => {
    expect(typeof xxHash32('')).toBe('number')
  })
})

describe('SnailRNG', () => {
  it('одинаковый seed → одинаковая последовательность', () => {
    const a = new SnailRNG('test-seed')
    const b = new SnailRNG('test-seed')
    expect(a.nextFloat()).toBe(b.nextFloat())
    expect(a.nextFloat()).toBe(b.nextFloat())
  })
  it('разные seed → разные числа', () => {
    const a = new SnailRNG('seed-a')
    const b = new SnailRNG('seed-b')
    expect(a.nextFloat()).not.toBe(b.nextFloat())
  })
  it('nextFloat возвращает число в диапазоне [0, 1)', () => {
    const rng = new SnailRNG('range-test')
    for (let i = 0; i < 100; i++) {
      const v = rng.nextFloat()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

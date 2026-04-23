import { describe, it, expect } from 'vitest'
import { classifyVibe, classifyDistance } from './classify'

describe('classifyVibe', () => {
  it('маленькое изображение → cursed', () => {
    expect(classifyVibe(200, 150)).toBe('cursed')
  })
  it('нормальный размер → normal', () => {
    expect(classifyVibe(800, 600)).toBe('normal')
  })
})

describe('classifyDistance', () => {
  it('почти квадратное → close', () => {
    expect(classifyDistance(600, 580)).toBe('close')
  })
  it('широкое панорамное → far', () => {
    expect(classifyDistance(1200, 400)).toBe('far')
  })
})

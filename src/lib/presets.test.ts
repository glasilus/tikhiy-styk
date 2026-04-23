import { describe, it, expect } from 'vitest'
import { PRESETS, pickPreset } from './presets'

describe('presets', () => {
  it('всего 15 пресетов', () => {
    expect(PRESETS).toHaveLength(15)
  })
  it('pickPreset возвращает один из 15', () => {
    const p = pickPreset('fingerprint-test', '2026-04-23')
    expect(PRESETS).toContain(p)
  })
  it('одинаковые входные данные → одинаковый пресет', () => {
    const a = pickPreset('fp', '2026-04-23')
    const b = pickPreset('fp', '2026-04-23')
    expect(a).toBe(b)
  })
  it('каждый пресет имеет card и 4 controls', () => {
    for (const p of PRESETS) {
      expect(p.card).toBeDefined()
      expect(p.controls.spawn).toBeDefined()
      expect(p.controls.download).toBeDefined()
      expect(p.controls.batch).toBeDefined()
      expect(p.controls.filter).toBeDefined()
    }
  })
})

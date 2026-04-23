import { xxHash32 } from './rng'

// MurmurHash3 32-bit finalizer — лавинный эффект
function fmix32(h: number): number {
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0
  return (h ^ (h >>> 16)) >>> 0
}

export class BloomFilter {
  private bits: Uint8Array
  private size: number

  constructor(size: number) {
    // Используем 1.44x больше бит для надёжного <1% FP при k=7
    this.size = Math.ceil(size * 1.44)
    this.bits = new Uint8Array(Math.ceil(this.size / 8))
  }

  private hashes(item: string): number[] {
    // Кирби-Мицзмахер: h_i = fmix(h1 + i * h2) для независимых позиций
    const base = xxHash32(item) >>> 0
    const h1 = fmix32(base)
    const h2 = fmix32(base ^ 0xdeadbeef)
    const result: number[] = []
    for (let i = 0; i < 7; i++) {
      result.push((h1 + Math.imul(i + 1, h2)) % this.size)
    }
    return result
  }

  add(item: string): void {
    for (const pos of this.hashes(item)) {
      this.bits[pos >>> 3] |= 1 << (pos & 7)
    }
  }

  has(item: string): boolean {
    return this.hashes(item).every(pos =>
      (this.bits[pos >>> 3] & (1 << (pos & 7))) !== 0
    )
  }

  clear(): void {
    this.bits.fill(0)
  }
}

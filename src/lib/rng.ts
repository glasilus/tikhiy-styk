import XXH from 'xxhashjs'

export function xxHash32(input: string): number {
  return XXH.h32(input, 0).toNumber()
}

export class SnailRNG {
  private s: Uint32Array

  constructor(seed: string) {
    this.s = new Uint32Array(4)
    const h = xxHash32(seed)
    let x = h
    for (let i = 0; i < 4; i++) {
      x = Math.imul(x ^ (x >>> 16), 0x45d9f3b)
      x = Math.imul(x ^ (x >>> 16), 0x45d9f3b)
      this.s[i] = x ^ (x >>> 16)
    }
  }

  private rotl(x: number, k: number): number {
    return (x << k) | (x >>> (32 - k))
  }

  nextUint32(): number {
    const result = Math.imul(this.rotl(Math.imul(this.s[1], 5), 7), 9)
    const t = this.s[1] << 9
    this.s[2] ^= this.s[0]
    this.s[3] ^= this.s[1]
    this.s[1] ^= this.s[2]
    this.s[0] ^= this.s[3]
    this.s[2] ^= t
    this.s[3] = this.rotl(this.s[3], 11)
    return result >>> 0
  }

  nextFloat(): number {
    return this.nextUint32() / 0x100000000
  }
}

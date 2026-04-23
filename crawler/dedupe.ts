import sharp from 'sharp'
import type { SnailItem } from '../src/lib/types'

async function pHash(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!response.ok) return null
    const buffer = Buffer.from(await response.arrayBuffer())
    const { data } = await sharp(buffer)
      .resize(8, 8, { fit: 'fill' })
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const avg = data.reduce((s, v) => s + v, 0) / data.length
    return Array.from(data).map(v => v > avg ? '1' : '0').join('')
  } catch {
    return null
  }
}

function hammingDistance(a: string, b: string): number {
  let dist = 0
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) dist++
  return dist
}

export async function dedupe(items: SnailItem[]): Promise<SnailItem[]> {
  const hashes: Array<{ hash: string; item: SnailItem }> = []
  const unique: SnailItem[] = []

  for (const item of items) {
    const hash = await pHash(item.src)
    if (!hash) continue

    const isDupe = hashes.some(h => hammingDistance(h.hash, hash) < 8)
    if (!isDupe) {
      hashes.push({ hash, item })
      unique.push(item)
    }
    if (hashes.length % 50 === 0) {
      console.log(`[dedupe] Обработано ${hashes.length}, уникальных: ${unique.length}`)
    }
  }

  return unique
}

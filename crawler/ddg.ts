import https from 'https'
import http from 'http'
import type { RawEntry } from './normalize'

const QUERIES = [
  'ахатина авито', 'улитка авито', 'achatina авито',
  'улитка ахатина продам', 'ахатина фото авито',
  'улитка питомец авито', 'ахатина крупная авито',
  'моллюск авито', 'ахатина детёныш авито',
  'улитка живая авито', 'achatina fulica авито',
  'ахатина ретикулята авито', 'гигантская улитка авито',
  'ахатина альбино авито', 'улитка ахатина взрослая авито',
]

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

function get(url: string, headers: Record<string, string> = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http
    const req = mod.get(url, {
      headers: { 'User-Agent': UA, ...headers },
    }, (res) => {
      // Follow redirects
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(get(res.headers.location, headers))
        return
      }
      const chunks: Buffer[] = []
      res.on('data', (c: Buffer) => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
      res.on('error', reject)
    })
    req.on('error', reject)
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')) })
  })
}

async function getVqd(query: string): Promise<string | null> {
  try {
    const html = await get(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=images`, {
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
    })
    // Современный формат: vqd="4-xxxx"
    const m1 = html.match(/vqd="([^"]+)"/)
    if (m1) return m1[1]
    // Старый формат: vqd=4-xxxx&
    const m2 = html.match(/vqd=([\d-]+)[&,]/)
    if (m2) return m2[1]
    return null
  } catch (e) {
    console.error('[DDG] getVqd error:', e)
    return null
  }
}

interface DDGImageResult {
  image: string
  thumbnail: string
  url: string
  width: number
  height: number
  title: string
}

async function searchImages(query: string, vqd: string): Promise<DDGImageResult[]> {
  const params = new URLSearchParams({
    l: 'ru-ru',
    o: 'json',
    q: query,
    vqd,
    f: ',,,',
    p: '-1',
  })
  const url = `https://duckduckgo.com/i.js?${params}`
  try {
    const raw = await get(url, {
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Referer': 'https://duckduckgo.com/',
      'X-Requested-With': 'XMLHttpRequest',
    })
    const data = JSON.parse(raw)
    return data.results ?? []
  } catch {
    return []
  }
}

function isAvitoUrl(url: string): boolean {
  return url.includes('avito.ru') || url.includes('avito.st') ||
         url.includes('i.avito') || url.includes('img.avito')
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

export async function crawlDDG(): Promise<RawEntry[]> {
  const results: RawEntry[] = []
  const seen = new Set<string>()

  for (const query of QUERIES) {
    console.log(`[DDG] Запрос: "${query}"`)
    try {
      const vqd = await getVqd(query)
      if (!vqd) {
        console.log(`[DDG] Не удалось получить vqd для "${query}"`)
        await sleep(2000)
        continue
      }

      const images = await searchImages(query, vqd)
      let added = 0

      for (const img of images) {
        const imageUrl = img.image
        if (!imageUrl || !imageUrl.startsWith('http')) continue
        if (!isAvitoUrl(img.url) && !isAvitoUrl(imageUrl)) continue
        if (seen.has(imageUrl)) continue
        seen.add(imageUrl)
        results.push({
          imageUrl,
          sourceUrl: img.url,
          width: img.width,
          height: img.height,
          title: img.title,
        })
        added++
      }

      console.log(`[DDG] "${query}" → +${added} (итого: ${results.length})`)
      await sleep(1500)
    } catch (e) {
      console.error(`[DDG] Ошибка "${query}":`, e)
    }
  }

  return results
}

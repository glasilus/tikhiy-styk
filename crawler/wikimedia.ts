import https from 'https'
import type { RawEntry } from './normalize'

function get(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'SnailMachine/1.0 (https://github.com/snailmachine; contact@example.com)',
        'Accept': 'application/json',
      },
    }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(get(res.headers.location))
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

interface WikiImage {
  name: string
  url: string
  width: number
  height: number
  descriptionurl: string
}

const CATEGORIES = [
  'Achatina_fulica',
  'Achatinidae',
  'Achatina_achatina',
  'Lissachatina_fulica',
  'Giant_African_land_snails',
  'Achatina_reticulata',
  'Achatina_albopicta',
  'Helix_pomatia',
  'Cornu_aspersum',
  'Snails_as_pets',
]

async function getCategoryImages(category: string, limit = 80): Promise<WikiImage[]> {
  const params = new URLSearchParams({
    action: 'query',
    list: 'categorymembers',
    cmtitle: `Category:${category}`,
    cmtype: 'file',
    cmlimit: String(limit),
    format: 'json',
    formatversion: '2',
  })
  const url = `https://commons.wikimedia.org/w/api.php?${params}`

  try {
    const raw = await get(url)
    const data = JSON.parse(raw)
    const members: Array<{ title: string }> = data.query?.categorymembers ?? []
    if (!members.length) return []

    const titles = members.map(m => m.title).join('|')
    const infoParams = new URLSearchParams({
      action: 'query',
      titles,
      prop: 'imageinfo',
      iiprop: 'url|size',
      format: 'json',
      formatversion: '2',
    })
    const infoRaw = await get(`https://commons.wikimedia.org/w/api.php?${infoParams}`)
    const infoData = JSON.parse(infoRaw)
    const pages = infoData.query?.pages ?? []

    const results: WikiImage[] = []
    for (const page of pages) {
      const info = page.imageinfo?.[0]
      if (!info?.url) continue
      if (!info.url.match(/\.(jpe?g|png)$/i)) continue
      // Фильтруем слишком маленькие изображения
      if ((info.width ?? 0) < 400 || (info.height ?? 0) < 300) continue
      results.push({
        name: page.title,
        url: info.url,
        width: info.width ?? 640,
        height: info.height ?? 480,
        descriptionurl: info.descriptionurl ?? '',
      })
    }
    return results
  } catch (e) {
    console.error(`[Wiki] Ошибка категории ${category}:`, e)
    return []
  }
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

export async function crawlWikimedia(): Promise<RawEntry[]> {
  const results: RawEntry[] = []
  const seen = new Set<string>()

  for (const category of CATEGORIES) {
    console.log(`[Wiki] Категория: ${category}`)
    const images = await getCategoryImages(category, 80)
    let added = 0
    for (const img of images) {
      if (seen.has(img.url)) continue
      seen.add(img.url)
      results.push({
        imageUrl: img.url,
        sourceUrl: img.descriptionurl,
        width: img.width,
        height: img.height,
        title: img.name,
      })
      added++
    }
    console.log(`[Wiki] ${category} → +${added} (итого: ${results.length})`)
    await sleep(300) // уважаем API лимиты Wikimedia
  }

  return results
}

// Скачивает первые N изображений как файлы в указанную директорию
export async function downloadWikimediaTextures(destDir: string, count = 20): Promise<string[]> {
  const { createWriteStream, mkdirSync } = await import('fs')
  const { join } = await import('path')

  mkdirSync(destDir, { recursive: true })

  // Берём из первых нескольких категорий
  const cats = ['Achatina_fulica', 'Lissachatina_fulica', 'Achatina_achatina', 'Giant_African_land_snails', 'Snails_as_pets']
  const allImages: WikiImage[] = []
  const seen = new Set<string>()

  for (const cat of cats) {
    if (allImages.length >= count * 3) break
    const imgs = await getCategoryImages(cat, 50)
    for (const img of imgs) {
      if (!seen.has(img.url)) {
        seen.add(img.url)
        allImages.push(img)
      }
    }
    await sleep(300)
  }

  const selected = allImages.slice(0, count)
  const downloaded: string[] = []

  for (let i = 0; i < selected.length; i++) {
    const img = selected[i]
    const ext = img.url.match(/\.(jpe?g|png)$/i)?.[1] ?? 'jpg'
    const dest = join(destDir, `snail-${i}.${ext}`)

    try {
      await new Promise<void>((resolve, reject) => {
        const file = createWriteStream(dest)
        const req = https.get(img.url, {
          headers: {
            'User-Agent': 'SnailMachine/1.0',
            'Referer': 'https://commons.wikimedia.org/',
          },
        }, (res) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            file.close()
            // redirect — рекурсивно
            const redReq = https.get(res.headers.location!, {
              headers: { 'User-Agent': 'SnailMachine/1.0' },
            }, (redRes) => {
              redRes.pipe(createWriteStream(dest))
              redRes.on('end', resolve)
              redRes.on('error', reject)
            })
            redReq.on('error', reject)
            return
          }
          res.pipe(file)
          file.on('finish', () => { file.close(); resolve() })
          res.on('error', reject)
        })
        req.on('error', reject)
        req.setTimeout(20000, () => { req.destroy(); reject(new Error('timeout')) })
      })
      console.log(`[Wiki] Скачано: snail-${i}.${ext}`)
      downloaded.push(dest)
    } catch (e) {
      console.error(`[Wiki] Не скачалось snail-${i}:`, e)
    }
    await sleep(200)
  }

  return downloaded
}

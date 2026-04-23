import https from 'https'
import type { RawEntry } from './normalize'

function get(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'SnailMachine/1.0',
        'Accept': 'application/json',
      },
    }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(get(res.headers.location))
        return
      }
      const chunks: Buffer[] = []
      res.on('data', (c: Buffer) => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks).toString()))
      res.on('error', reject)
    })
    req.on('error', reject)
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')) })
  })
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

// Виды улиток для поиска — разнообразие для интересного датасета
const TAXA = [
  { name: 'Achatina fulica',    vibe: 'normal' as const },
  { name: 'Achatina achatina',  vibe: 'macro' as const },
  { name: 'Lissachatina fulica',vibe: 'normal' as const },
  { name: 'Achatina reticulata',vibe: 'cursed' as const },
  { name: 'Helix pomatia',      vibe: 'normal' as const },
  { name: 'Cornu aspersum',     vibe: 'normal' as const },
  { name: 'Archachatina marginata', vibe: 'macro' as const },
]

interface iNatObservation {
  id: number
  photos: Array<{ url: string; attribution: string }>
  place_guess?: string
  quality_grade: string
  taxon?: { name: string; preferred_common_name?: string }
}

async function fetchPage(taxonName: string, page: number, perPage: number): Promise<iNatObservation[]> {
  const params = new URLSearchParams({
    taxon_name: taxonName,
    has: 'photos',
    per_page: String(perPage),
    page: String(page),
    order: 'votes',
    order_by: 'votes',
    quality_grade: 'research',
    photo_license: 'cc-by,cc-by-sa,cc-by-nd,cc0,pd',
  })
  const url = `https://api.inaturalist.org/v1/observations?${params}`
  try {
    const raw = await get(url)
    const data = JSON.parse(raw) as { results: iNatObservation[]; total_results: number }
    return data.results ?? []
  } catch (e) {
    console.error(`[iNat] Ошибка запроса:`, e)
    return []
  }
}

export async function crawlINaturalist(targetCount = 400): Promise<RawEntry[]> {
  const results: RawEntry[] = []
  const seen = new Set<string>()
  const perTaxon = Math.ceil(targetCount / TAXA.length)

  for (const taxon of TAXA) {
    console.log(`[iNat] Таксон: ${taxon.name}`)
    let page = 1
    let collected = 0
    const perPage = 50

    while (collected < perTaxon) {
      const observations = await fetchPage(taxon.name, page, perPage)
      if (!observations.length) break

      for (const obs of observations) {
        for (const photo of obs.photos) {
          // Заменяем 'square' на 'large' для большого разрешения
          const url = photo.url
            .replace('/square.', '/large.')
            .replace('/square/', '/large/')
          if (!url || seen.has(url)) continue
          seen.add(url)
          results.push({
            imageUrl: url,
            sourceUrl: `https://www.inaturalist.org/observations/${obs.id}`,
            // iNaturalist не всегда даёт размеры, ставим стандартные
            width: 1024,
            height: 768,
            title: taxon.name,
          })
          collected++
          if (collected >= perTaxon) break
        }
        if (collected >= perTaxon) break
      }

      page++
      await sleep(300)
    }
    console.log(`[iNat] ${taxon.name} → +${collected} (итого: ${results.length})`)
    await sleep(500)
  }

  return results
}

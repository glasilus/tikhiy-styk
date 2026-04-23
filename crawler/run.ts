import { crawlAvito } from './avito'
import { crawlPexels } from './pexels'
import { crawlWikimedia, downloadWikimediaTextures } from './wikimedia'
import { crawlINaturalist } from './inaturalist'
import { normalize } from './normalize'
import { dedupe } from './dedupe'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import type { SnailItem } from '../src/lib/types'

const CHUNK_SIZE = 500
const OUTPUT_DIR = join(process.cwd(), 'public', 'data')
const TEXTURES_DIR = join(process.cwd(), 'public', 'textures')

async function run() {
  console.log('=== Snail Machine Crawler Start ===\n')
  mkdirSync(OUTPUT_DIR, { recursive: true })
  mkdirSync(TEXTURES_DIR, { recursive: true })

  // 1. Текстуры для UI из Wikimedia (реальные фото, работают с любого IP)
  console.log('--- [1/4] Скачиваю UI текстуры (Wikimedia) ---')
  const textures = await downloadWikimediaTextures(TEXTURES_DIR, 20)
  console.log(`Текстуры: ${textures.length}/20\n`)

  // 2. Авито — основной источник (нужен домашний IP/VPN)
  //    Wikimedia + iNaturalist — резервные (работают с любого IP)
  console.log('--- [2/4] Краулю источники ---')
  console.log('[!] Авито требует домашний IP или VPN — если блокирует, запускайте локально\n')

  const [avitoRaw, wikiRaw, inatRaw, pexelsRaw] = await Promise.all([
    crawlAvito(400),
    crawlWikimedia(),
    crawlINaturalist(200),
    crawlPexels(),
  ])
  console.log(`\nСырых: Avito=${avitoRaw.length}, Wiki=${wikiRaw.length}, iNat=${inatRaw.length}, Pexels=${pexelsRaw.length}`)

  // 3. Нормализация — Авито идёт первым (приоритет)
  console.log('\n--- [3/4] Нормализую ---')
  const allItems: SnailItem[] = [
    ...avitoRaw.map(r => normalize(r)),
    ...wikiRaw.map(r => normalize(r)),
    ...inatRaw.map(r => normalize(r)),
    ...pexelsRaw.map(r => ({ ...normalize(r), type: 'video' as const })),
  ]

  const seenIds = new Set<string>()
  const deduped = allItems.filter(item => {
    if (seenIds.has(item.id)) return false
    seenIds.add(item.id)
    return true
  })
  console.log(`После hash-dedupe: ${deduped.length}`)

  // pHash только если много данных
  let final = deduped
  if (deduped.length > 150) {
    console.log('pHash дедупликация...')
    final = await dedupe(deduped)
    console.log(`После pHash: ${final.length}`)
  }

  // 4. Пишем чанки
  console.log('\n--- [4/4] Пишу датасет ---')
  const chunks: SnailItem[][] = []
  for (let i = 0; i < final.length; i += CHUNK_SIZE) {
    chunks.push(final.slice(i, i + CHUNK_SIZE))
  }

  for (let i = 0; i < chunks.length; i++) {
    writeFileSync(join(OUTPUT_DIR, `dataset-${i}.json`), JSON.stringify(chunks[i]))
    console.log(`dataset-${i}.json → ${chunks[i].length} улиток`)
  }

  const meta = {
    total: final.length,
    chunks: chunks.length,
    version: '1.0',
    updatedAt: new Date().toISOString(),
  }
  writeFileSync(join(OUTPUT_DIR, 'meta.json'), JSON.stringify(meta, null, 2))
  console.log('\n=== DONE ===', meta)
}

run().catch(console.error)

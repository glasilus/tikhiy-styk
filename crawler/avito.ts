import type { RawEntry } from './normalize'

const YANDEX_EXE = 'C:/Program Files/Yandex/YandexBrowser/Application/browser.exe'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 YaBrowser/24.4.0 Safari/537.36'

// Ключевые запросы для поиска улиток на Авито
const QUERIES = [
  'ахатина',
  'улитка ахатина',
  'achatina',
  'архахатина',
  'улитка питомец',
]

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function scrapeSearchPage(page: any, url: string): Promise<RawEntry[]> {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
  await sleep(2000)

  // Scroll to trigger lazy loading
  for (let i = 0; i < 8; i++) {
    await page.evaluate(() => window.scrollBy(0, 600))
    await sleep(200)
  }
  await sleep(1500)

  return page.evaluate((pageUrl: string) => {
    const items: RawEntry[] = []
    document.querySelectorAll('[data-marker="item"]').forEach((card: Element) => {
      const titleEl = card.querySelector('[itemprop="name"], [data-marker="item-title/text"], h3') as HTMLElement | null
      const linkEl = card.querySelector('a[href*="/"]') as HTMLAnchorElement | null
      const title = titleEl?.textContent?.trim() ?? ''

      card.querySelectorAll('img').forEach((img: HTMLImageElement) => {
        const src = img.src || (img as any).dataset?.src || ''
        if (!src.includes('img.avito.st')) return
        // Upgrade to largest available resolution
        const big = src.replace(/\/\d+x\d+\//, '/678x678/').replace(/\d+x\d+\.(jpe?g|png)/i, '678x678.$1')
        items.push({
          imageUrl: big || src,
          sourceUrl: linkEl?.href ?? pageUrl,
          width: 678,
          height: 678,
          title: title || 'Авито улитка',
        } as any)
      })
    })
    return items
  }, url) as Promise<RawEntry[]>
}

export async function crawlAvito(targetCount = 300): Promise<RawEntry[]> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const puppeteer = require('puppeteer-extra')
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const StealthPlugin = require('puppeteer-extra-plugin-stealth')
  puppeteer.use(StealthPlugin())

  const results: RawEntry[] = []
  const seen = new Set<string>()

  let browser: any
  try {
    browser = await puppeteer.launch({
      executablePath: YANDEX_EXE,
      headless: false,
      args: ['--no-sandbox', '--window-position=5000,5000'],
      defaultViewport: null,
    })

    const page = await browser.newPage()
    await page.setUserAgent(UA)

    const perQuery = Math.ceil(targetCount / QUERIES.length)

    for (const query of QUERIES) {
      const encoded = encodeURIComponent(query)
      let collected = 0

      for (let p = 1; p <= 5 && collected < perQuery; p++) {
        const url = `https://www.avito.ru/all/zhivotnye?q=${encoded}&p=${p}`
        console.log(`[Avito] ${query} стр.${p}`)

        let items: RawEntry[]
        try {
          items = await scrapeSearchPage(page, url)
        } catch (e) {
          console.error(`[Avito] Ошибка страницы:`, (e as Error).message)
          break
        }

        let added = 0
        for (const item of items) {
          if (!item.imageUrl || seen.has(item.imageUrl)) continue
          seen.add(item.imageUrl)
          results.push(item)
          added++
          collected++
          if (collected >= perQuery) break
        }

        console.log(`[Avito] +${added} (итого: ${results.length})`)
        if (items.length < 5) break // нет следующей страницы
        await sleep(1200)
      }

      await sleep(800)
    }
  } catch (e) {
    console.error('[Avito] Критическая ошибка:', (e as Error).message)
  } finally {
    if (browser) await browser.close().catch(() => {})
  }

  return results
}

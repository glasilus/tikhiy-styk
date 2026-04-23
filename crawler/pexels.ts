import type { RawEntry } from './normalize'

const API_KEY = process.env.PEXELS_API_KEY ?? ''
const SEARCH_TERMS = ['snail crawling', 'achatina snail', 'snail timelapse', 'garden snail']

interface PexelsVideo {
  id: number
  duration: number
  video_files: Array<{ link: string; width: number; height: number; quality: string }>
}

export async function crawlPexels(): Promise<RawEntry[]> {
  const results: RawEntry[] = []

  for (const query of SEARCH_TERMS) {
    console.log(`[Pexels] Запрос: "${query}"`)
    let page = 1
    while (page <= 5) {
      const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=40&page=${page}`
      const res = await fetch(url, { headers: { Authorization: API_KEY } })
      if (!res.ok) break
      const data = await res.json() as { videos: PexelsVideo[] }
      if (!data.videos?.length) break

      for (const v of data.videos) {
        if (v.duration < 10) continue
        const best = v.video_files.find(f => f.quality === 'hd') ?? v.video_files[0]
        if (!best) continue
        results.push({
          imageUrl: best.link,
          sourceUrl: `https://www.pexels.com/video/${v.id}/`,
          width: best.width,
          height: best.height,
        })
      }
      page++
      await new Promise(r => setTimeout(r, 500))
    }
  }

  return results
}

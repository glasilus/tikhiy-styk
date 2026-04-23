import type { SnailItem, DatasetMeta } from '@/lib/types'

type WorkerMessage =
  | { type: 'LOAD'; totalChunks: number }
  | { type: 'CHUNK_LOADED'; items: SnailItem[]; chunkIndex: number; done: boolean }
  | { type: 'ERROR'; error: string }

async function loadMeta(): Promise<DatasetMeta> {
  const res = await fetch('/data/meta.json')
  if (!res.ok) throw new Error('meta.json not found')
  return res.json()
}

async function loadChunk(index: number): Promise<SnailItem[]> {
  const res = await fetch(`/data/dataset-${index}.json`)
  if (!res.ok) throw new Error(`dataset-${index}.json not found`)
  return res.json()
}

self.onmessage = async (e: MessageEvent) => {
  if (e.data.type !== 'START') return

  try {
    const meta = await loadMeta()
    self.postMessage({ type: 'META', meta })

    const first = await loadChunk(0)
    self.postMessage({
      type: 'CHUNK_LOADED',
      items: first,
      chunkIndex: 0,
      done: meta.chunks === 1,
    } satisfies WorkerMessage)

    for (let i = 1; i < meta.chunks; i++) {
      await new Promise(r => setTimeout(r, 50))
      const chunk = await loadChunk(i)
      self.postMessage({
        type: 'CHUNK_LOADED',
        items: chunk,
        chunkIndex: i,
        done: i === meta.chunks - 1,
      } satisfies WorkerMessage)
    }
  } catch (err) {
    self.postMessage({
      type: 'ERROR',
      error: String(err),
    } satisfies WorkerMessage)
  }
}

import type { SnailItem } from './types'

interface Entry {
  item: SnailItem
  priority: number
}

export class PrefetchQueue {
  private heap: Entry[] = []

  push(entry: Entry): void {
    this.heap.push(entry)
    this.bubbleUp(this.heap.length - 1)
  }

  pop(): Entry | undefined {
    if (this.heap.length === 0) return undefined
    const top = this.heap[0]
    const last = this.heap.pop()!
    if (this.heap.length > 0) {
      this.heap[0] = last
      this.sinkDown(0)
    }
    return top
  }

  isEmpty(): boolean { return this.heap.length === 0 }
  size(): number { return this.heap.length }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >>> 1
      if (this.heap[parent].priority <= this.heap[i].priority) break
      ;[this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]]
      i = parent
    }
  }

  private sinkDown(i: number): void {
    const n = this.heap.length
    while (true) {
      let min = i
      const l = 2 * i + 1, r = 2 * i + 2
      if (l < n && this.heap[l].priority < this.heap[min].priority) min = l
      if (r < n && this.heap[r].priority < this.heap[min].priority) min = r
      if (min === i) break
      ;[this.heap[min], this.heap[i]] = [this.heap[i], this.heap[min]]
      i = min
    }
  }
}

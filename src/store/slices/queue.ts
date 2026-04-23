import type { StateCreator } from 'zustand'
import type { SnailItem } from '@/lib/types'
import type { StoreState } from '../index'

const RING_SIZE = 50

export interface QueueSlice {
  queue: SnailItem[]
  current: SnailItem | null
  nextSnail: () => void
  enqueue: (items: SnailItem[]) => void
}

export const createQueueSlice: StateCreator<StoreState, [], [], QueueSlice> = (set, get) => ({
  queue: [],
  current: null,

  nextSnail: () => {
    const { queue } = get()
    if (queue.length === 0) return
    const [next, ...rest] = queue
    get().addToHistory(next.id)
    set({ current: next, queue: rest })
  },

  enqueue: (items) => {
    set(state => {
      const merged = [...state.queue, ...items].slice(0, RING_SIZE)
      return { queue: merged }
    })
  },
})

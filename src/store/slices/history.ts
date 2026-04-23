import type { StateCreator } from 'zustand'
import { BloomFilter } from '@/lib/bloom'
import type { StoreState } from '../index'

export interface HistorySlice {
  history: BloomFilter
  addToHistory: (id: string) => void
  clearHistory: () => void
}

export const createHistorySlice: StateCreator<StoreState, [], [], HistorySlice> = (set, get) => ({
  history: new BloomFilter(50000),

  addToHistory: (id) => {
    get().history.add(id)
  },

  clearHistory: () => {
    set({ history: new BloomFilter(50000) })
  },
})

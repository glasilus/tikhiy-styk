import type { StateCreator } from 'zustand'
import type { SnailItem } from '@/lib/types'
import type { StoreState } from '../index'

export interface PocketSlice {
  pocket: SnailItem[]
  addToPocket: (item: SnailItem) => void
  removeFromPocket: (id: string) => void
  clearPocket: () => void
}

export const createPocketSlice: StateCreator<StoreState, [], [], PocketSlice> = (set) => ({
  pocket: [],

  addToPocket: (item) => set(state => {
    if (state.pocket.length >= 50) return state
    if (state.pocket.find(s => s.id === item.id)) return state
    return { pocket: [...state.pocket, item] }
  }),

  removeFromPocket: (id) => set(state => ({
    pocket: state.pocket.filter(s => s.id !== id)
  })),

  clearPocket: () => set({ pocket: [] }),
})

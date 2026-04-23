import type { StateCreator } from 'zustand'
import type { LayoutPreset } from '@/lib/presets'
import type { SnailVibe } from '@/lib/types'
import type { StoreState } from '../index'

export type UIMode = 'browse' | 'flow' | 'filter'

export interface UISlice {
  mode: UIMode
  seed: string
  activePreset: LayoutPreset | null
  vibeFilter: SnailVibe | 'all'
  setMode: (mode: UIMode) => void
  setSeed: (seed: string) => void
  setPreset: (preset: LayoutPreset) => void
  setVibeFilter: (vibe: SnailVibe | 'all') => void
}

export const createUISlice: StateCreator<StoreState, [], [], UISlice> = (set) => ({
  mode: 'browse',
  seed: '',
  activePreset: null,
  vibeFilter: 'all',
  setMode: (mode) => set({ mode }),
  setSeed: (seed) => set({ seed }),
  setPreset: (preset) => set({ activePreset: preset }),
  setVibeFilter: (vibe) => set({ vibeFilter: vibe }),
})

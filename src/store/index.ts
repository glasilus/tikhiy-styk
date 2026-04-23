import { create } from 'zustand'
import { createQueueSlice, type QueueSlice } from './slices/queue'
import { createHistorySlice, type HistorySlice } from './slices/history'
import { createPocketSlice, type PocketSlice } from './slices/pocket'
import { createUISlice, type UISlice } from './slices/ui'

export type StoreState = QueueSlice & HistorySlice & PocketSlice & UISlice

export const useSnailStore = create<StoreState>()((...a) => ({
  ...createQueueSlice(...a),
  ...createHistorySlice(...a),
  ...createPocketSlice(...a),
  ...createUISlice(...a),
}))

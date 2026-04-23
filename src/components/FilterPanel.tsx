'use client'
import { useSnailStore } from '@/store'
import type { SnailVibe } from '@/lib/types'

const VIBES: Array<SnailVibe | 'all'> = ['all', 'normal', 'cursed', 'macro', 'dark']

export function FilterPanel() {
  const mode = useSnailStore(s => s.mode)
  const seed = useSnailStore(s => s.seed)
  const setSeed = useSnailStore(s => s.setSeed)
  const vibeFilter = useSnailStore(s => s.vibeFilter)
  const setVibeFilter = useSnailStore(s => s.setVibeFilter)

  if (mode !== 'filter') return null

  return (
    <div
      className="fixed z-40 bottom-8 left-1/2 -translate-x-1/2 flex flex-col gap-4 items-center"
      style={{ fontFamily: 'monospace' }}
    >
      <input
        value={seed}
        onChange={e => setSeed(e.target.value)}
        placeholder="..."
        className="bg-transparent border-b border-white/30 text-white/80 text-center
                   outline-none w-40 pb-1 text-sm placeholder:text-white/20"
        style={{
          backgroundImage: 'url(/textures/snail-4.jpg)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      />

      <div className="flex gap-2">
        {VIBES.map(v => (
          <button
            key={v}
            onClick={() => setVibeFilter(v)}
            className="w-8 h-8 rounded-sm active:scale-90 transition-transform"
            style={{
              backgroundImage: `url(/textures/snail-${VIBES.indexOf(v) + 5}.jpg)`,
              backgroundSize: 'cover',
              opacity: vibeFilter === v ? 1 : 0.35,
              outline: vibeFilter === v ? '1px solid rgba(255,255,255,0.5)' : 'none',
            }}
          />
        ))}
      </div>
    </div>
  )
}

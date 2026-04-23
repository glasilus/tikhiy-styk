'use client'
import { useSnailStore } from '@/store'
import type { ControlPos } from '@/lib/presets'

function ControlButton({
  pos, onClick, mask, texture,
}: {
  pos: ControlPos
  onClick: () => void
  mask: string
  texture: string
}) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick() }}
      onMouseDown={e => e.stopPropagation()}
      className="fixed z-30 w-14 h-14 active:scale-90 transition-all hover:brightness-125"
      style={{
        left: pos.x,
        top: pos.y,
        transform: `translate(-50%, -50%) rotate(${pos.rotate}deg)`,
        backgroundImage: `url(${texture})`,
        backgroundSize: 'cover',
        WebkitMaskImage: `url(${mask})`,
        maskImage: `url(${mask})`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.45))',
      }}
    />
  )
}

export function Controls() {
  const activePreset = useSnailStore(s => s.activePreset)
  const current = useSnailStore(s => s.current)
  const nextSnail = useSnailStore(s => s.nextSnail)
  const addToPocket = useSnailStore(s => s.addToPocket)
  const setMode = useSnailStore(s => s.setMode)
  const mode = useSnailStore(s => s.mode)

  if (!activePreset) return null
  const { controls } = activePreset

  return (
    <>
      <ControlButton
        pos={controls.spawn}
        mask="/masks/circle.svg"
        texture="/textures/snail-0.jpg"
        onClick={nextSnail}
      />

      <ControlButton
        pos={controls.download}
        mask="/masks/arrow-down.svg"
        texture="/textures/snail-1.jpg"
        onClick={() => {
          if (!current) return
          const a = document.createElement('a')
          a.href = `/api/dl?url=${encodeURIComponent(current.src)}`
          const ext = current.src.split('.').pop()?.split('?')[0] ?? 'jpg'
          a.download = `snail-${current.id}.${ext}`
          a.click()
        }}
      />

      <ControlButton
        pos={controls.batch}
        mask="/masks/grid.svg"
        texture="/textures/snail-2.jpg"
        onClick={() => { if (current) addToPocket(current) }}
      />

      <ControlButton
        pos={controls.filter}
        mask="/masks/warp.svg"
        texture="/textures/snail-3.jpg"
        onClick={() => setMode(mode === 'filter' ? 'browse' : 'filter')}
      />
    </>
  )
}

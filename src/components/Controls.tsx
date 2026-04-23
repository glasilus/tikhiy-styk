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
      onClick={onClick}
      className="fixed z-30 w-12 h-12 active:scale-90 transition-transform"
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
        texture="/textures/snail-0.svg"
        onClick={nextSnail}
      />

      <ControlButton
        pos={controls.download}
        mask="/masks/arrow-down.svg"
        texture="/textures/snail-1.svg"
        onClick={() => {
          if (!current) return
          const a = document.createElement('a')
          a.href = `/api/dl?url=${encodeURIComponent(current.src)}`
          a.download = `snail-${current.id}.svg`
          a.click()
        }}
      />

      <ControlButton
        pos={controls.batch}
        mask="/masks/grid.svg"
        texture="/textures/snail-2.svg"
        onClick={() => { if (current) addToPocket(current) }}
      />

      <ControlButton
        pos={controls.filter}
        mask="/masks/warp.svg"
        texture="/textures/snail-3.svg"
        onClick={() => setMode(mode === 'filter' ? 'browse' : 'filter')}
      />
    </>
  )
}

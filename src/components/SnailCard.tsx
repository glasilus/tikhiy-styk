'use client'
import { useSnailStore } from '@/store'

function proxySrc(src: string) {
  return `/api/dl?url=${encodeURIComponent(src)}`
}

export function SnailCard() {
  const current = useSnailStore(s => s.current)
  const activePreset = useSnailStore(s => s.activePreset)

  if (!current || !activePreset) return null

  const { x, y, rotate, scale } = activePreset.card

  return (
    <div
      className="fixed z-20 overflow-hidden rounded-sm shadow-2xl"
      style={{
        left: x, top: y,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`,
        width: 'clamp(280px, 38vw, 560px)',
        aspectRatio: '4/3',
        transition: 'none',
      }}
    >
      {current.type === 'image' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={proxySrc(current.src)}
          alt=""
          className="w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <video
          src={proxySrc(current.src)}
          className="w-full h-full object-cover"
          muted
          playsInline
          loop
          autoPlay={false}
          onMouseEnter={e => (e.target as HTMLVideoElement).play()}
          onMouseLeave={e => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0 }}
        />
      )}
    </div>
  )
}

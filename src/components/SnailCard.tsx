'use client'
import Image from 'next/image'
import { useSnailStore } from '@/store'

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
        <Image
          src={current.src}
          alt=""
          fill
          className="object-cover"
          priority
          unoptimized={false}
        />
      ) : (
        <video
          src={current.src}
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

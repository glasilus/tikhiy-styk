'use client'
import { useSnailStore } from '@/store'
import JSZip from 'jszip'

export function BatchPocket() {
  const pocket = useSnailStore(s => s.pocket)
  const removeFromPocket = useSnailStore(s => s.removeFromPocket)

  if (pocket.length === 0) return null

  async function downloadAll() {
    const zip = new JSZip()
    for (let i = 0; i < pocket.length; i++) {
      try {
        const res = await fetch(`/api/dl?url=${encodeURIComponent(pocket[i].src)}`)
        if (!res.ok) continue
        const blob = await res.blob()
        zip.file(`snail-${i + 1}-${pocket[i].id.slice(0, 8)}.svg`, blob)
      } catch { /* пропускаем нескачанные */ }
    }
    const content = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(content)
    a.download = 'snails.zip'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
      <div className="flex gap-1 flex-wrap max-w-40 justify-end">
        {pocket.map(s => (
          <div
            key={s.id}
            onClick={() => removeFromPocket(s.id)}
            className="w-8 h-8 cursor-pointer hover:opacity-60 transition-opacity rounded-sm overflow-hidden"
            style={{ backgroundImage: `url(${s.src})`, backgroundSize: 'cover' }}
          />
        ))}
      </div>
      <button
        onClick={downloadAll}
        className="w-8 h-8 rounded-sm"
        style={{
          backgroundImage: 'url(/textures/snail-0.svg)',
          backgroundSize: 'cover',
          WebkitMaskImage: 'url(/masks/arrow-down.svg)',
          maskImage: 'url(/masks/arrow-down.svg)',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
        }}
      />
    </div>
  )
}

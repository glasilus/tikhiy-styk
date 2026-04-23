'use client'
import { useEffect, useRef } from 'react'
import { useSnailStore } from '@/store'
import { SnailEngine } from '@/lib/engine'
import { pickPreset } from '@/lib/presets'
import { getBrowserFingerprint, getTodayString } from '@/lib/fingerprint'
import { SnailCard } from '@/components/SnailCard'
import { Controls } from '@/components/Controls'
import { FilterPanel } from '@/components/FilterPanel'
import { BatchPocket } from '@/components/BatchPocket'
import { WebGLCanvas } from '@/components/WebGLCanvas'
import { SnailCursor } from '@/components/SnailCursor'
import type { SnailItem } from '@/lib/types'

export default function Home() {
  const setPreset = useSnailStore(s => s.setPreset)
  const enqueue = useSnailStore(s => s.enqueue)
  const nextSnail = useSnailStore(s => s.nextSnail)
  const setMode = useSnailStore(s => s.setMode)
  const seed = useSnailStore(s => s.seed)
  const vibeFilter = useSnailStore(s => s.vibeFilter)

  const engineRef = useRef<SnailEngine | null>(null)
  const poolRef = useRef<SnailItem[]>([])
  const flowIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFlowingRef = useRef(false)

  useEffect(() => {
    const fp = getBrowserFingerprint()
    const preset = pickPreset(fp, getTodayString())
    setPreset(preset)
  }, [setPreset])

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/dataset-loader.worker.ts', import.meta.url)
    )

    worker.onmessage = (e) => {
      if (e.data.type === 'CHUNK_LOADED') {
        const items: SnailItem[] = e.data.items
        poolRef.current = [...poolRef.current, ...items]

        if (!engineRef.current) {
          engineRef.current = new SnailEngine(seed || Date.now().toString(), items)
          const batch = Array.from({ length: 15 }, () => engineRef.current!.pick())
          enqueue(batch)
          nextSnail()
        } else {
          engineRef.current.addToPool(items)
        }
      }
    }

    worker.postMessage({ type: 'START' })
    return () => worker.terminate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (engineRef.current && seed) {
      engineRef.current.reseed(seed)
    }
  }, [seed])

  useEffect(() => {
    return () => {
      if (flowIntervalRef.current) clearInterval(flowIntervalRef.current)
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
    }
  }, [])

  function handleSpawn() {
    if (!engineRef.current) return
    const batch = Array.from({ length: 10 }, () => engineRef.current!.pick())
    enqueue(batch.filter(s => vibeFilter === 'all' || s.vibe === vibeFilter))
    nextSnail()
  }

  function startFlow() {
    isFlowingRef.current = true
    setMode('flow')
    flowIntervalRef.current = setInterval(() => {
      if (!engineRef.current) return
      const next = engineRef.current.pick()
      if (vibeFilter !== 'all' && next.vibe !== vibeFilter) return
      enqueue([next])
      nextSnail()
    }, 400)
  }

  function stopFlow() {
    if (!isFlowingRef.current) return
    isFlowingRef.current = false
    setMode('browse')
    if (flowIntervalRef.current) {
      clearInterval(flowIntervalRef.current)
      flowIntervalRef.current = null
    }
  }

  function handleMouseDown() {
    holdTimerRef.current = setTimeout(startFlow, 350)
  }

  function handleMouseUp() {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
    stopFlow()
  }

  function handleClick(e: React.MouseEvent) {
    if (isFlowingRef.current) return
    // Не стреляем по кнопкам управления
    if ((e.target as HTMLElement).tagName === 'BUTTON') return
    handleSpawn()
  }

  return (
    <main
      className="w-full h-full relative"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <WebGLCanvas />
      <SnailCard />
      <SnailCursor />
      <Controls />
      <FilterPanel />
      <BatchPocket />
    </main>
  )
}

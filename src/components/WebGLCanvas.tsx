'use client'
import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { ShaderOrchestrator, type EffectState } from '@/gl/ShaderOrchestrator'
import { useSnailStore } from '@/store'

export function WebGLCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const orchestratorRef = useRef<ShaderOrchestrator | null>(null)
  const rafRef = useRef<number>(0)
  const stateRef = useRef<EffectState>({
    glitchIntensity: 0,
    sortProgress: 0,
    warpAmp: 0.04,
    smearIntensity: 0,
    distortProgress: 0,
  })
  const textureRef = useRef<THREE.Texture | null>(null)
  const prevTimeRef = useRef<number>(0)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const current = useSnailStore(s => s.current)
  const mode = useSnailStore(s => s.mode)

  useEffect(() => {
    stateRef.current.smearIntensity = mode === 'flow' ? 1.0 : 0.0
  }, [mode])

  useEffect(() => {
    if (!current) return

    stateRef.current.glitchIntensity = 1.0

    const loader = new THREE.TextureLoader()
    loader.load(`/api/dl?url=${encodeURIComponent(current.src)}`, (tex) => {
      const old = textureRef.current
      textureRef.current = tex
      old?.dispose()
    })
  }, [current?.id])

  const resetIdleTimer = useCallback(() => {
    stateRef.current.sortProgress = 0
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => {
      stateRef.current.sortProgress = 0.001
    }, 3000)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    orchestratorRef.current = new ShaderOrchestrator(canvas)

    let running = true

    function loop(time: number) {
      if (!running) return
      const dt = Math.min((time - prevTimeRef.current) / 1000, 0.05)
      prevTimeRef.current = time

      const state = stateRef.current
      const orc = orchestratorRef.current!

      state.glitchIntensity = Math.max(0, state.glitchIntensity - dt * 1.4)

      if (state.sortProgress > 0) {
        state.sortProgress = Math.min(1, state.sortProgress + dt * 0.15)
      }

      if (textureRef.current) {
        orc.render(textureRef.current, state, dt)
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    const handleMouseEnter = () => { stateRef.current.warpAmp = 0.14 }
    const handleMouseLeave = () => { stateRef.current.warpAmp = 0.04 }
    window.addEventListener('mousemove', resetIdleTimer)
    window.addEventListener('click', resetIdleTimer)
    canvas.addEventListener('mouseenter', handleMouseEnter)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      running = false
      cancelAnimationFrame(rafRef.current)
      orchestratorRef.current?.dispose()
      textureRef.current?.dispose()
      window.removeEventListener('mousemove', resetIdleTimer)
      window.removeEventListener('click', resetIdleTimer)
      canvas.removeEventListener('mouseenter', handleMouseEnter)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [resetIdleTimer])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}

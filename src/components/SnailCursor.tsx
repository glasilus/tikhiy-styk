'use client'
import { useEffect, useRef } from 'react'

export function SnailCursor() {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    function move(e: MouseEvent) {
      el!.style.left = e.clientX + 'px'
      el!.style.top = e.clientY + 'px'
    }

    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <svg
      ref={ref}
      id="snail-cursor"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 28 28"
      fill="none"
      style={{ left: '-100px', top: '-100px' }}
    >
      {/* shell */}
      <circle cx="17" cy="15" r="8" stroke="white" strokeWidth="1.5" fill="none" opacity="0.9"/>
      <circle cx="17" cy="15" r="5" stroke="white" strokeWidth="1" fill="none" opacity="0.6"/>
      <circle cx="17" cy="15" r="2" fill="white" opacity="0.8"/>
      {/* body */}
      <path d="M10 15 Q6 12 7 8 Q8 4 12 5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.9"/>
      {/* antennae */}
      <line x1="12" y1="5" x2="9" y2="2" stroke="white" strokeWidth="1" opacity="0.7"/>
      <line x1="12" y1="5" x2="14" y2="2" stroke="white" strokeWidth="1" opacity="0.7"/>
      <circle cx="9" cy="2" r="1" fill="white" opacity="0.8"/>
      <circle cx="14" cy="2" r="1" fill="white" opacity="0.8"/>
    </svg>
  )
}

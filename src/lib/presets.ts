import { xxHash32 } from './rng'

export interface ControlPos {
  x: string
  y: string
  right?: string
  bottom?: string
  rotate: number
}

export interface LayoutPreset {
  card: { x: string; y: string; rotate: number; scale: number }
  controls: {
    spawn: ControlPos
    download: ControlPos
    batch: ControlPos
    filter: ControlPos
  }
}

export const PRESETS: LayoutPreset[] = [
  {
    card: { x: '50%', y: '48%', rotate: -3, scale: 1 },
    controls: {
      spawn:    { x: '8%',  y: '50%', rotate: 15  },
      download: { x: '82%', y: '72%', rotate: -8  },
      batch:    { x: '15%', y: '20%', rotate: 20  },
      filter:   { x: '78%', y: '18%', rotate: -12 },
    },
  },
  {
    card: { x: '38%', y: '52%', rotate: 5, scale: 0.95 },
    controls: {
      spawn:    { x: '72%', y: '30%', rotate: -5  },
      download: { x: '80%', y: '65%', rotate: 10  },
      batch:    { x: '68%', y: '80%', rotate: -18 },
      filter:   { x: '10%', y: '15%', rotate: 25  },
    },
  },
  {
    card: { x: '62%', y: '45%', rotate: -8, scale: 1.05 },
    controls: {
      spawn:    { x: '12%', y: '60%', rotate: 30  },
      download: { x: '18%', y: '25%', rotate: -15 },
      batch:    { x: '8%',  y: '82%', rotate: 5   },
      filter:   { x: '82%', y: '82%', rotate: -20 },
    },
  },
  {
    card: { x: '50%', y: '35%', rotate: 2, scale: 1.1 },
    controls: {
      spawn:    { x: '20%', y: '78%', rotate: -10 },
      download: { x: '78%', y: '78%', rotate: 12  },
      batch:    { x: '8%',  y: '40%', rotate: 22  },
      filter:   { x: '85%', y: '35%', rotate: -6  },
    },
  },
  {
    card: { x: '50%', y: '65%', rotate: -5, scale: 0.9 },
    controls: {
      spawn:    { x: '50%', y: '10%', rotate: 0   },
      download: { x: '25%', y: '12%', rotate: -20 },
      batch:    { x: '75%', y: '12%', rotate: 18  },
      filter:   { x: '10%', y: '50%', rotate: 35  },
    },
  },
  {
    card: { x: '55%', y: '55%', rotate: 7, scale: 1 },
    controls: {
      spawn:    { x: '15%', y: '15%', rotate: -30 },
      download: { x: '82%', y: '82%', rotate: 15  },
      batch:    { x: '80%', y: '20%', rotate: -5  },
      filter:   { x: '12%', y: '80%', rotate: 10  },
    },
  },
  {
    card: { x: '50%', y: '50%', rotate: -2, scale: 0.8 },
    controls: {
      spawn:    { x: '20%', y: '50%', rotate: 5   },
      download: { x: '80%', y: '50%', rotate: -5  },
      batch:    { x: '50%', y: '15%', rotate: 15  },
      filter:   { x: '50%', y: '82%', rotate: -15 },
    },
  },
  {
    card: { x: '50%', y: '50%', rotate: 0, scale: 1.15 },
    controls: {
      spawn:    { x: '6%',  y: '6%',  rotate: 20  },
      download: { x: '88%', y: '6%',  rotate: -20 },
      batch:    { x: '6%',  y: '88%', rotate: -20 },
      filter:   { x: '88%', y: '88%', rotate: 20  },
    },
  },
  {
    card: { x: '40%', y: '60%', rotate: 10, scale: 1 },
    controls: {
      spawn:    { x: '75%', y: '20%', rotate: -8  },
      download: { x: '82%', y: '50%', rotate: 5   },
      batch:    { x: '70%', y: '75%', rotate: -25 },
      filter:   { x: '15%', y: '15%', rotate: 12  },
    },
  },
  {
    card: { x: '45%', y: '42%', rotate: -6, scale: 0.95 },
    controls: {
      spawn:    { x: '5%',  y: '30%', rotate: 40  },
      download: { x: '88%', y: '60%', rotate: -30 },
      batch:    { x: '60%', y: '88%', rotate: 15  },
      filter:   { x: '30%', y: '5%',  rotate: -18 },
    },
  },
  {
    card: { x: '52%', y: '50%', rotate: 14, scale: 1 },
    controls: {
      spawn:    { x: '10%', y: '45%', rotate: -14 },
      download: { x: '88%', y: '45%', rotate: 14  },
      batch:    { x: '45%', y: '10%', rotate: 8   },
      filter:   { x: '45%', y: '85%', rotate: -8  },
    },
  },
  {
    card: { x: '58%', y: '48%', rotate: -4, scale: 1.05 },
    controls: {
      spawn:    { x: '8%',  y: '70%', rotate: 18  },
      download: { x: '8%',  y: '25%', rotate: -22 },
      batch:    { x: '82%', y: '25%', rotate: 5   },
      filter:   { x: '75%', y: '82%', rotate: -12 },
    },
  },
  {
    card: { x: '48%', y: '68%', rotate: 3, scale: 0.9 },
    controls: {
      spawn:    { x: '25%', y: '20%', rotate: -5  },
      download: { x: '70%', y: '15%', rotate: 10  },
      batch:    { x: '85%', y: '45%', rotate: -20 },
      filter:   { x: '10%', y: '45%', rotate: 28  },
    },
  },
  {
    card: { x: '50%', y: '50%', rotate: -11, scale: 1 },
    controls: {
      spawn:    { x: '22%', y: '32%', rotate: 25  },
      download: { x: '72%', y: '68%', rotate: -8  },
      batch:    { x: '18%', y: '72%', rotate: -30 },
      filter:   { x: '78%', y: '22%', rotate: 15  },
    },
  },
  {
    card: { x: '42%', y: '55%', rotate: 18, scale: 0.85 },
    controls: {
      spawn:    { x: '78%', y: '10%', rotate: -35 },
      download: { x: '5%',  y: '55%', rotate: 12  },
      batch:    { x: '85%', y: '80%', rotate: 8   },
      filter:   { x: '40%', y: '5%',  rotate: -20 },
    },
  },
]

export function pickPreset(fingerprint: string, dateStr: string): LayoutPreset {
  const idx = xxHash32(fingerprint + dateStr) % PRESETS.length
  return PRESETS[Math.abs(idx)]
}

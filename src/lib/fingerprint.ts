export function getBrowserFingerprint(): string {
  if (typeof window === 'undefined') return 'ssr'
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  return `${navigator.userAgent}|${screen.width}|${screen.height}|${tz}`
}

export function getTodayString(): string {
  return new Date().toDateString()
}

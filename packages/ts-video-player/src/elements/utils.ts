/**
 * ts-video-player Element Utilities
 *
 * Shared helpers for custom elements.
 *
 * @module elements/utils
 */

/**
 * Format time in seconds to MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number, guide = 0): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00'

  const s = Math.floor(seconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60

  const showHours = h > 0 || guide >= 3600

  if (showHours) {
    return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  return `${m}:${sec.toString().padStart(2, '0')}`
}

/**
 * Format time as a human-readable phrase for screen readers.
 * e.g., "1 minute, 30 seconds"
 */
export function formatTimePhrase(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0 seconds'

  const s = Math.floor(seconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60

  const parts: string[] = []
  if (h > 0) parts.push(`${h} ${h === 1 ? 'hour' : 'hours'}`)
  if (m > 0) parts.push(`${m} ${m === 1 ? 'minute' : 'minutes'}`)
  if (sec > 0 || parts.length === 0) parts.push(`${sec} ${sec === 1 ? 'second' : 'seconds'}`)

  return parts.join(', ')
}

/**
 * Convert seconds to ISO 8601 duration string.
 * e.g., 90 -> "PT1M30S"
 */
export function toISODuration(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return 'PT0S'

  const s = Math.floor(seconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60

  let result = 'PT'
  if (h > 0) result += `${h}H`
  if (m > 0) result += `${m}M`
  if (sec > 0 || result === 'PT') result += `${sec}S`

  return result
}

/**
 * Resolve the player instance from an element.
 * Uses `for` attribute to find by ID, or walks up the DOM to find `<video-player>`.
 */
export function resolvePlayer(el: HTMLElement): any | null {
  const forId = el.getAttribute('for')
  if (forId) {
    const target = document.getElementById(forId)
    return (target as any)?.player ?? null
  }

  const host = el.closest('video-player')
  return (host as any)?.player ?? null
}

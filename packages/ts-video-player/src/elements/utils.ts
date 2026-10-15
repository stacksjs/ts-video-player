/**
 * ts-video-player Element Utilities
 *
 * Shared helpers for custom elements.
 *
 * @module elements/utils
 */

import type { TranslationKey } from '../core/i18n'
import { englishStrings, getI18n } from '../core/i18n'

/**
 * The language a control speaks: the nearest `lang` attribute above it,
 * through shadow roots (`<html lang="de">`, or `lang` on the `<video-player>`
 * itself), then the browser's. A German page gets German button names and
 * screen-reader announcements without configuring the player.
 */
export function languageOf(el: Node | null | undefined): string {
  let node: Node | null | undefined = el
  while (node) {
    const tagged = (node as Element).closest?.('[lang]')?.getAttribute('lang')
    if (tagged) return tagged.toLowerCase()
    const root = node.getRootNode?.()
    node = root && (root as ShadowRoot).host ? (root as ShadowRoot).host : null
  }
  if (typeof navigator !== 'undefined' && navigator.language) return navigator.language.toLowerCase()
  return 'en'
}

/**
 * A control's words in its language (languageOf): the built-in translations
 * plus any an app added with getI18n().addTranslations(), English for a
 * language or key that has none.
 */
export function label(el: Node | null | undefined, key: TranslationKey, params?: Record<string, string | number>): string {
  const lang = languageOf(el)
  const i18n = getI18n()
  const text = i18n.getTranslations(lang)?.[key] || i18n.getTranslations(lang.split('-')[0]!)?.[key] || englishStrings[key] || key
  return params ? text.replace(/\{(\w+)\}/g, (match, name) => (params[name] !== undefined ? String(params[name]) : match)) : text
}

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
 * e.g., "1 minute, 30 seconds", in the language of `el` when one is given.
 */
export function formatTimePhrase(seconds: number, el?: Node | null): string {
  const say = (n: number, one: TranslationKey, other: TranslationKey): string => label(el, n === 1 ? one : other, { n })
  if (!isFinite(seconds) || isNaN(seconds)) return say(0, 'secondOne', 'secondOther')

  const s = Math.floor(seconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60

  const parts: string[] = []
  if (h > 0) parts.push(say(h, 'hourOne', 'hourOther'))
  if (m > 0) parts.push(say(m, 'minuteOne', 'minuteOther'))
  if (sec > 0 || parts.length === 0) parts.push(say(sec, 'secondOne', 'secondOther'))

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

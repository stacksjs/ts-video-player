/**
 * ts-video-player Event System
 *
 * Event emitter and media event normalization.
 *
 * @module core/events
 */

import type { PlayerEventMap, ProviderEventMap, MediaError, TimeRange, PlayerState } from '../types'

// =============================================================================
// Event Emitter
// =============================================================================

type EventMap = PlayerEventMap | ProviderEventMap

/**
 * Type-safe event emitter
 */
export class EventEmitter<T extends Record<string, (...args: any[]) => void>> {
  private listeners = new Map<keyof T, Set<T[keyof T]>>()
  private onceListeners = new Map<keyof T, Set<T[keyof T]>>()

  /**
   * Add an event listener
   */
  on<K extends keyof T>(event: K, handler: T[K]): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)

    return () => this.off(event, handler)
  }

  /**
   * Add a one-time event listener
   */
  once<K extends keyof T>(event: K, handler: T[K]): () => void {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set())
    }
    this.onceListeners.get(event)!.add(handler)

    return () => this.onceListeners.get(event)?.delete(handler)
  }

  /**
   * Remove an event listener
   */
  off<K extends keyof T>(event: K, handler: T[K]): void {
    this.listeners.get(event)?.delete(handler)
    this.onceListeners.get(event)?.delete(handler)
  }

  /**
   * Emit an event
   */
  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void {
    // Call regular listeners
    this.listeners.get(event)?.forEach((handler) => {
      try {
        ;(handler as (...args: any[]) => void)(...args)
      } catch (error) {
        console.error(`[ts-video-player] Error in event handler for "${String(event)}":`, error)
      }
    })

    // Call and remove once listeners
    const onceHandlers = this.onceListeners.get(event)
    if (onceHandlers) {
      onceHandlers.forEach((handler) => {
        try {
          ;(handler as (...args: any[]) => void)(...args)
        } catch (error) {
          console.error(`[ts-video-player] Error in once handler for "${String(event)}":`, error)
        }
      })
      onceHandlers.clear()
    }
  }

  /**
   * Remove all listeners for an event (or all events)
   */
  removeAllListeners(event?: keyof T): void {
    if (event) {
      this.listeners.delete(event)
      this.onceListeners.delete(event)
    } else {
      this.listeners.clear()
      this.onceListeners.clear()
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: keyof T): number {
    return (this.listeners.get(event)?.size || 0) + (this.onceListeners.get(event)?.size || 0)
  }
}

// =============================================================================
// Media Events Normalizer
// =============================================================================

/**
 * Normalize HTMLMediaElement events to our event system
 */
export class MediaEventsNormalizer {
  private media: HTMLMediaElement
  private emitter: EventEmitter<ProviderEventMap>
  private listeners: Array<() => void> = []

  constructor(media: HTMLMediaElement, emitter: EventEmitter<ProviderEventMap>) {
    this.media = media
    this.emitter = emitter
    this.attachListeners()
  }

  private attachListeners(): void {
    const on = (event: string, handler: (e: Event) => void) => {
      this.media.addEventListener(event, handler)
      this.listeners.push(() => this.media.removeEventListener(event, handler))
    }

    // Loading events
    on('loadstart', () => this.emitter.emit('loadstart'))
    on('loadedmetadata', () => this.emitter.emit('loadedmetadata'))
    on('loadeddata', () => this.emitter.emit('loadeddata'))
    on('canplay', () => this.emitter.emit('canplay'))
    on('canplaythrough', () => this.emitter.emit('canplaythrough'))

    // Playback events
    on('play', () => this.emitter.emit('play'))
    on('pause', () => this.emitter.emit('pause'))
    on('playing', () => this.emitter.emit('playing'))
    on('waiting', () => this.emitter.emit('waiting'))
    on('ended', () => this.emitter.emit('ended'))

    // Seeking events
    on('seeking', () => this.emitter.emit('seeking'))
    on('seeked', () => this.emitter.emit('seeked'))

    // Time/duration events
    on('timeupdate', () => this.emitter.emit('timeupdate', this.media.currentTime))
    on('durationchange', () => this.emitter.emit('durationchange', this.media.duration))

    // Volume events
    on('volumechange', () => this.emitter.emit('volumechange', this.media.volume, this.media.muted))

    // Rate events
    on('ratechange', () => this.emitter.emit('ratechange', this.media.playbackRate))

    // Progress events
    on('progress', () => {
      const buffered = this.getTimeRanges(this.media.buffered)
      this.emitter.emit('progress', buffered)
    })

    // Error events
    on('error', () => {
      const error = this.normalizeError(this.media.error)
      this.emitter.emit('error', error)
    })
  }

  private getTimeRanges(ranges: TimeRanges): TimeRange[] {
    const result: TimeRange[] = []
    for (let i = 0; i < ranges.length; i++) {
      result.push({
        start: ranges.start(i),
        end: ranges.end(i),
      })
    }
    return result
  }

  private normalizeError(error: globalThis.MediaError | null): MediaError {
    if (!error) {
      return { code: 0, message: 'Unknown error' }
    }

    const messages: Record<number, string> = {
      1: 'The fetching of the media resource was aborted by the user agent.',
      2: 'A network error occurred while fetching the media resource.',
      3: 'An error occurred while decoding the media resource.',
      4: 'The media resource is not supported.',
    }

    return {
      code: error.code,
      message: messages[error.code] || error.message || 'Unknown error',
    }
  }

  /**
   * Destroy the normalizer
   */
  destroy(): void {
    this.listeners.forEach((remove) => remove())
    this.listeners = []
  }
}

// =============================================================================
// Fullscreen Events
// =============================================================================

/**
 * Normalize fullscreen change events
 */
export function onFullscreenChange(handler: (fullscreen: boolean) => void): () => void {
  const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange']

  const listener = () => {
    const fullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    )
    handler(fullscreen)
  }

  events.forEach((event) => document.addEventListener(event, listener))

  return () => {
    events.forEach((event) => document.removeEventListener(event, listener))
  }
}

// =============================================================================
// Picture-in-Picture Events
// =============================================================================

/**
 * Normalize PiP change events
 */
export function onPiPChange(video: HTMLVideoElement, handler: (pip: boolean) => void): () => void {
  const enterHandler = () => handler(true)
  const leaveHandler = () => handler(false)

  video.addEventListener('enterpictureinpicture', enterHandler)
  video.addEventListener('leavepictureinpicture', leaveHandler)

  return () => {
    video.removeEventListener('enterpictureinpicture', enterHandler)
    video.removeEventListener('leavepictureinpicture', leaveHandler)
  }
}

// =============================================================================
// Keyboard Events
// =============================================================================

/**
 * Default keyboard shortcuts
 */
export const DEFAULT_KEYBOARD_SHORTCUTS: Record<string, string> = {
  ' ': 'togglePlay',
  k: 'togglePlay',
  m: 'toggleMute',
  f: 'toggleFullscreen',
  i: 'togglePiP',
  c: 'toggleCaptions',
  ArrowLeft: 'seekBackward',
  ArrowRight: 'seekForward',
  j: 'seekBackward',
  l: 'seekForward',
  ArrowUp: 'volumeUp',
  ArrowDown: 'volumeDown',
  '>': 'speedUp',
  '<': 'speedDown',
  Home: 'seekStart',
  End: 'seekEnd',
  '0': 'seek0',
  '1': 'seek10',
  '2': 'seek20',
  '3': 'seek30',
  '4': 'seek40',
  '5': 'seek50',
  '6': 'seek60',
  '7': 'seek70',
  '8': 'seek80',
  '9': 'seek90',
}

/**
 * Action handlers for keyboard shortcuts
 */
export interface KeyboardActions {
  togglePlay(): void
  toggleMute(): void
  toggleFullscreen(): void
  togglePiP(): void
  toggleCaptions(): void
  seekBackward(): void
  seekForward(): void
  volumeUp(): void
  volumeDown(): void
  speedUp(): void
  speedDown(): void
  seekStart(): void
  seekEnd(): void
  seekPercent(percent: number): void
}

/**
 * Create keyboard event handler
 */
export function createKeyboardHandler(
  actions: KeyboardActions,
  options: { seekStep?: number; volumeStep?: number; speedStep?: number } = {},
): (event: KeyboardEvent) => void {
  const { seekStep = 5, volumeStep = 0.1, speedStep = 0.25 } = options

  return (event: KeyboardEvent) => {
    // Ignore if in input field
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target as HTMLElement)?.isContentEditable
    ) {
      return
    }

    const key = event.key
    const action = DEFAULT_KEYBOARD_SHORTCUTS[key]

    if (!action) return

    // Prevent default for handled keys
    event.preventDefault()

    switch (action) {
      case 'togglePlay':
        actions.togglePlay()
        break
      case 'toggleMute':
        actions.toggleMute()
        break
      case 'toggleFullscreen':
        actions.toggleFullscreen()
        break
      case 'togglePiP':
        actions.togglePiP()
        break
      case 'toggleCaptions':
        actions.toggleCaptions()
        break
      case 'seekBackward':
        actions.seekBackward()
        break
      case 'seekForward':
        actions.seekForward()
        break
      case 'volumeUp':
        actions.volumeUp()
        break
      case 'volumeDown':
        actions.volumeDown()
        break
      case 'speedUp':
        actions.speedUp()
        break
      case 'speedDown':
        actions.speedDown()
        break
      case 'seekStart':
        actions.seekStart()
        break
      case 'seekEnd':
        actions.seekEnd()
        break
      default:
        // Handle number keys for percentage seeking
        if (action.startsWith('seek')) {
          const percent = parseInt(action.replace('seek', ''), 10)
          if (!isNaN(percent)) {
            actions.seekPercent(percent)
          }
        }
    }
  }
}

// =============================================================================
// User Activity Detection
// =============================================================================

/**
 * Create user activity detector
 */
export function createActivityDetector(
  element: HTMLElement,
  options: { timeout?: number; onActive?: () => void; onInactive?: () => void } = {},
): () => void {
  const { timeout = 3000, onActive, onInactive } = options

  let timer: ReturnType<typeof setTimeout> | null = null
  let active = true

  const setActive = () => {
    if (!active) {
      active = true
      onActive?.()
    }
    resetTimer()
  }

  const setInactive = () => {
    if (active) {
      active = false
      onInactive?.()
    }
  }

  const resetTimer = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(setInactive, timeout)
  }

  // Events that indicate activity
  const events = ['mousemove', 'mouseenter', 'mouseleave', 'mousedown', 'keydown', 'touchstart', 'touchmove']

  events.forEach((event) => element.addEventListener(event, setActive))

  // Start timer
  resetTimer()

  // Return cleanup function
  return () => {
    if (timer) clearTimeout(timer)
    events.forEach((event) => element.removeEventListener(event, setActive))
  }
}

// =============================================================================
// Gesture Detection
// =============================================================================

export interface GestureHandlers {
  onTap?: (x: number, y: number) => void
  onDoubleTap?: (x: number, y: number) => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onScrub?: (progress: number) => void
  onScrubEnd?: () => void
}

/**
 * Create touch gesture detector
 */
export function createGestureDetector(element: HTMLElement, handlers: GestureHandlers): () => void {
  let startX = 0
  let startY = 0
  let startTime = 0
  let lastTap = 0
  let isScrubbing = false
  let cachedRect: DOMRect | null = null

  const SWIPE_THRESHOLD = 50
  const TAP_THRESHOLD = 200
  const DOUBLE_TAP_THRESHOLD = 300

  const onTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    startX = touch.clientX
    startY = touch.clientY
    startTime = Date.now()
    isScrubbing = false
    cachedRect = element.getBoundingClientRect()
  }

  const onTouchMove = (e: TouchEvent) => {
    if (!startTime) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY

    // Horizontal scrubbing
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
      isScrubbing = true
      const rect = cachedRect || element.getBoundingClientRect()
      const progress = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width))
      handlers.onScrub?.(progress)
    }
  }

  const onTouchEnd = (e: TouchEvent) => {
    const endTime = Date.now()
    const duration = endTime - startTime

    if (isScrubbing) {
      handlers.onScrubEnd?.()
      isScrubbing = false
      startTime = 0
      return
    }

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY

    // Check for swipe
    if (duration < 500) {
      if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          handlers.onSwipeRight?.()
        } else {
          handlers.onSwipeLeft?.()
        }
        startTime = 0
        return
      }

      if (Math.abs(deltaY) > SWIPE_THRESHOLD && Math.abs(deltaY) > Math.abs(deltaX)) {
        if (deltaY > 0) {
          handlers.onSwipeDown?.()
        } else {
          handlers.onSwipeUp?.()
        }
        startTime = 0
        return
      }
    }

    // Check for tap
    if (duration < TAP_THRESHOLD && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      const now = Date.now()
      if (now - lastTap < DOUBLE_TAP_THRESHOLD) {
        handlers.onDoubleTap?.(touch.clientX, touch.clientY)
        lastTap = 0
      } else {
        handlers.onTap?.(touch.clientX, touch.clientY)
        lastTap = now
      }
    }

    startTime = 0
  }

  element.addEventListener('touchstart', onTouchStart, { passive: true })
  element.addEventListener('touchmove', onTouchMove, { passive: true })
  element.addEventListener('touchend', onTouchEnd, { passive: true })

  return () => {
    element.removeEventListener('touchstart', onTouchStart)
    element.removeEventListener('touchmove', onTouchMove)
    element.removeEventListener('touchend', onTouchEnd)
  }
}

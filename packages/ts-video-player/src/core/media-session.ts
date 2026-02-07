/**
 * ts-video-player Media Session API Integration
 *
 * Provides lock screen / notification controls via navigator.mediaSession.
 *
 * @module core/media-session
 */

import type { PlayerState } from '../types'
import type { StateStore } from './state'

export interface MediaSessionOptions {
  /** Title to display */
  title?: string
  /** Artist name */
  artist?: string
  /** Album name */
  album?: string
  /** Artwork images for lock screen */
  artwork?: MediaImage[]
}

/**
 * Check if Media Session API is available
 */
export function isMediaSessionSupported(): boolean {
  return typeof navigator !== 'undefined' && 'mediaSession' in navigator
}

/**
 * Create a Media Session controller that syncs player state to the browser's
 * media session (lock screen controls, notification area, etc.)
 */
export function createMediaSession(
  store: StateStore,
  actions: {
    play: () => void
    pause: () => void
    seekTo: (time: number) => void
    seekBy: (offset: number) => void
    stop: () => void
  },
  options?: MediaSessionOptions,
): () => void {
  if (!isMediaSessionSupported()) return () => {}

  const session = navigator.mediaSession

  // Set metadata
  if (options) {
    updateMetadata(options)
  }

  // Action handlers
  const handlers: Array<[MediaSessionAction, MediaSessionActionHandler]> = [
    ['play', () => actions.play()],
    ['pause', () => actions.pause()],
    ['stop', () => actions.stop()],
    ['seekbackward', (details) => {
      const offset = (details as MediaSessionActionDetails & { seekOffset?: number }).seekOffset || -10
      actions.seekBy(offset)
    }],
    ['seekforward', (details) => {
      const offset = (details as MediaSessionActionDetails & { seekOffset?: number }).seekOffset || 10
      actions.seekBy(offset)
    }],
    ['seekto', (details) => {
      const seekTime = (details as MediaSessionActionDetails & { seekTime?: number }).seekTime
      if (seekTime !== undefined) actions.seekTo(seekTime)
    }],
  ]

  for (const [action, handler] of handlers) {
    try {
      session.setActionHandler(action, handler)
    } catch {
      // Some actions may not be supported on all platforms
    }
  }

  // Sync playback state
  const unsubPaused = store.subscribe('paused', (state) => {
    session.playbackState = state.paused ? 'paused' : 'playing'
  })

  // Sync position state
  let positionTimer: ReturnType<typeof setInterval> | null = null

  const updatePosition = () => {
    const state = store.getState()
    if (!isFinite(state.duration) || state.duration <= 0) return
    try {
      session.setPositionState({
        duration: state.duration,
        playbackRate: state.playbackRate,
        position: Math.min(state.currentTime, state.duration),
      })
    } catch {
      // Position state may fail if values are invalid
    }
  }

  const unsubPlaying = store.subscribe('playing', (state) => {
    if (state.playing) {
      updatePosition()
      positionTimer = setInterval(updatePosition, 1000)
    } else {
      if (positionTimer) { clearInterval(positionTimer); positionTimer = null }
      updatePosition()
    }
  })

  return () => {
    if (positionTimer) clearInterval(positionTimer)
    unsubPaused()
    unsubPlaying()

    // Clear action handlers
    for (const [action] of handlers) {
      try { session.setActionHandler(action, null) } catch { /* ignore */ }
    }
  }
}

/**
 * Update media session metadata
 */
export function updateMetadata(options: MediaSessionOptions): void {
  if (!isMediaSessionSupported()) return
  navigator.mediaSession.metadata = new MediaMetadata({
    title: options.title || '',
    artist: options.artist || '',
    album: options.album || '',
    artwork: options.artwork || [],
  })
}

/**
 * Composable Player Factory
 *
 * Creates a lightweight player with only the features you need.
 *
 * @module features/create-player
 */

import type { Feature, FeatureContext } from './types'
import type { PlayerState } from '../types'
import { StateStore } from '../core/state'

export interface ComposablePlayer {
  /** The container element */
  el: HTMLElement
  /** Current state */
  readonly state: PlayerState
  /** Subscribe to state changes */
  subscribe: StateStore['subscribe']
  /** Get the media element */
  getMediaElement: () => HTMLMediaElement | null
  /** Destroy the player and all features */
  destroy: () => void
}

export interface ComposablePlayerOptions {
  /** Features to enable */
  features: Feature[]
  /** Initial state overrides */
  state?: Partial<PlayerState>
  /** Player options */
  options?: Record<string, unknown>
}

/**
 * Create a composable player with only the specified features.
 *
 * @example
 * ```ts
 * import { createComposablePlayer } from 'ts-video-player/features'
 * import { playback, volume, fullscreen } from 'ts-video-player/features'
 *
 * const player = createComposablePlayer(container, {
 *   features: [playback, volume, fullscreen],
 * })
 * ```
 */
export function createComposablePlayer(
  container: HTMLElement,
  opts: ComposablePlayerOptions,
): ComposablePlayer {
  const store = new StateStore(opts.state)
  const cleanups: Array<() => void> = []

  let mediaElement: HTMLMediaElement | null = null

  const getMediaElement = (): HTMLMediaElement | null => {
    if (!mediaElement) {
      mediaElement = container.querySelector('video, audio')
    }
    return mediaElement
  }

  const ctx: FeatureContext = {
    container,
    store,
    options: opts.options || {},
    getMediaElement,
  }

  // Setup all features
  for (const feature of opts.features) {
    const cleanup = feature.setup(ctx)
    if (cleanup) cleanups.push(cleanup)
  }

  return {
    el: container,
    get state() {
      return store.getState()
    },
    subscribe: store.subscribe.bind(store),
    getMediaElement,
    destroy() {
      for (const cleanup of cleanups) cleanup()
      cleanups.length = 0
      store.reset()
      mediaElement = null
    },
  }
}

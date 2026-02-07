/**
 * ts-video-player Feature Types
 *
 * @module features/types
 */

import type { PlayerState } from '../types'
import type { StateStore } from '../core/state'

export interface FeatureContext {
  /** The player container element */
  container: HTMLElement
  /** The state store */
  store: StateStore
  /** Options passed to the player */
  options: Record<string, unknown>
  /** Get the current media element (may be null before load) */
  getMediaElement: () => HTMLMediaElement | null
}

export interface Feature {
  /** Unique feature name */
  name: string
  /** State keys this feature manages */
  stateKeys?: (keyof PlayerState)[]
  /** Initialize the feature. Returns a cleanup function. */
  setup(ctx: FeatureContext): (() => void) | void
}

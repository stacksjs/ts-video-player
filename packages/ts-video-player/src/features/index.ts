/**
 * ts-video-player Composable Features
 *
 * Tree-shakeable feature composition system.
 *
 * @module features
 */

// Feature implementations
export { playback } from './playback'
export { volume } from './volume'
export { fullscreen } from './fullscreen'
export { pip } from './pip'
export { captions } from './captions'
export { quality } from './quality'
export { keyboard } from './keyboard'
export { gestures } from './gestures'

// Types
export type { Feature, FeatureContext } from './types'

// Factory
export { createComposablePlayer } from './create-player'
export type { ComposablePlayer, ComposablePlayerOptions } from './create-player'

// Feature bundles
import { playback } from './playback'
import { volume } from './volume'
import { fullscreen } from './fullscreen'
import { pip } from './pip'
import { captions } from './captions'
import { quality } from './quality'
import { keyboard } from './keyboard'
import { gestures } from './gestures'
import type { Feature } from './types'

/** All features for video playback */
export const videoFeatures: Feature[] = [playback, volume, fullscreen, pip, captions, quality, keyboard, gestures]

/** Features for audio-only playback */
export const audioFeatures: Feature[] = [playback, volume, keyboard]

/** Minimal features (playback only) */
export const minimalFeatures: Feature[] = [playback]

/**
 * ts-video-player Custom Elements
 *
 * Web Components for building video player interfaces.
 *
 * @module elements
 */

export { VideoPlayerElement } from './video-player'
export { MediaPlayButton } from './media-play-button'
export { MediaMuteButton } from './media-mute-button'
export { MediaFullscreenButton } from './media-fullscreen-button'
export { MediaPipButton } from './media-pip-button'
export { MediaTimeDisplay } from './media-time-display'
export { MediaProgressBar } from './media-progress-bar'
export { MediaVolumeSlider } from './media-volume-slider'
export { MediaSettingsMenu } from './media-settings-menu'
export { formatTime, formatTimePhrase, toISODuration, resolvePlayer } from './utils'

import { VideoPlayerElement } from './video-player'
import { MediaPlayButton } from './media-play-button'
import { MediaMuteButton } from './media-mute-button'
import { MediaFullscreenButton } from './media-fullscreen-button'
import { MediaPipButton } from './media-pip-button'
import { MediaTimeDisplay } from './media-time-display'
import { MediaProgressBar } from './media-progress-bar'
import { MediaVolumeSlider } from './media-volume-slider'
import { MediaSettingsMenu } from './media-settings-menu'

const elements = [
  ['video-player', VideoPlayerElement],
  ['media-play-button', MediaPlayButton],
  ['media-mute-button', MediaMuteButton],
  ['media-fullscreen-button', MediaFullscreenButton],
  ['media-pip-button', MediaPipButton],
  ['media-time-display', MediaTimeDisplay],
  ['media-progress-bar', MediaProgressBar],
  ['media-volume-slider', MediaVolumeSlider],
  ['media-settings-menu', MediaSettingsMenu],
] as const

/**
 * Register all custom elements.
 * Safe to call multiple times — skips already-defined elements.
 */
export function registerElements(): void {
  for (const [name, ctor] of elements) {
    if (!customElements.get(name)) {
      customElements.define(name, ctor)
    }
  }
}

/**
 * ts-video-player Custom Elements
 *
 * Web Components for building video player interfaces.
 *
 * @module elements
 */

export { VideoPlayerElement } from './video-player'
export { VideoSkin } from './video-skin'
export { MediaPlayButton } from './media-play-button'
export { MediaMuteButton } from './media-mute-button'
export { MediaFullscreenButton } from './media-fullscreen-button'
export { MediaPipButton } from './media-pip-button'
export { MediaTimeDisplay } from './media-time-display'
export { MediaTimeGroup } from './media-time-group'
export { MediaTimeSeparator } from './media-time-separator'
export { MediaPreviewTime } from './media-preview-time'
export { MediaProgressBar } from './media-progress-bar'
export { MediaVolumeSlider } from './media-volume-slider'
export { MediaSettingsMenu } from './media-settings-menu'
export { formatTime, formatTimePhrase, toISODuration, resolvePlayer } from './utils'

import { VideoPlayerElement } from './video-player'
import { VideoSkin } from './video-skin'
import { MediaPlayButton } from './media-play-button'
import { MediaMuteButton } from './media-mute-button'
import { MediaFullscreenButton } from './media-fullscreen-button'
import { MediaPipButton } from './media-pip-button'
import { MediaTimeDisplay } from './media-time-display'
import { MediaTimeGroup } from './media-time-group'
import { MediaTimeSeparator } from './media-time-separator'
import { MediaPreviewTime } from './media-preview-time'
import { MediaProgressBar } from './media-progress-bar'
import { MediaVolumeSlider } from './media-volume-slider'
import { MediaSettingsMenu } from './media-settings-menu'

const elements = [
  ['video-player', VideoPlayerElement],
  ['video-skin', VideoSkin],
  ['media-play-button', MediaPlayButton],
  ['media-mute-button', MediaMuteButton],
  ['media-fullscreen-button', MediaFullscreenButton],
  ['media-pip-button', MediaPipButton],
  ['media-time-display', MediaTimeDisplay],
  ['media-time-group', MediaTimeGroup],
  ['media-time-separator', MediaTimeSeparator],
  ['media-preview-time', MediaPreviewTime],
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

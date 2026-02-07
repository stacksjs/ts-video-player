/**
 * Gestures feature — touch gesture detection.
 *
 * @module features/gestures
 */

import type { Feature, FeatureContext } from './types'
import { createGestureDetector } from '../core/events'

export const gestures: Feature = {
  name: 'gestures',

  setup(ctx: FeatureContext) {
    const { container, options } = ctx

    if (options.gestures === false) return

    const cleanup = createGestureDetector(container, {
      onDoubleTapLeft: () => {
        const media = ctx.getMediaElement()
        if (media) media.currentTime = Math.max(0, media.currentTime - 10)
      },
      onDoubleTapRight: () => {
        const media = ctx.getMediaElement()
        if (media) media.currentTime = Math.min(media.duration, media.currentTime + 10)
      },
      onDoubleTapCenter: () => {
        // Toggle fullscreen — handled by player
      },
      onSwipeUp: () => {
        const media = ctx.getMediaElement()
        if (media) media.volume = Math.min(1, media.volume + 0.1)
      },
      onSwipeDown: () => {
        const media = ctx.getMediaElement()
        if (media) media.volume = Math.max(0, media.volume - 0.1)
      },
    })

    return cleanup
  },
}

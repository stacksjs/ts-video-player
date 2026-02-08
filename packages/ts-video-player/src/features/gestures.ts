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
      onDoubleTap: (x) => {
        // Double-tap left third: seek back, right third: seek forward
        const rect = container.getBoundingClientRect()
        const third = rect.width / 3
        const relX = x - rect.left
        const media = ctx.getMediaElement()
        if (!media) return
        if (relX < third) {
          media.currentTime = Math.max(0, media.currentTime - 10)
        } else if (relX > third * 2) {
          media.currentTime = Math.min(media.duration, media.currentTime + 10)
        }
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

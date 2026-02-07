/**
 * Fullscreen feature — fullscreen state + availability detection.
 *
 * @module features/fullscreen
 */

import type { Feature, FeatureContext } from './types'
import { detectFullscreenAvailability } from '../core/features'
import { onFullscreenChange } from '../core/events'

export const fullscreen: Feature = {
  name: 'fullscreen',
  stateKeys: ['fullscreen', 'fullscreenAvailability', 'canFullscreen'],

  setup(ctx: FeatureContext) {
    const { store, container, getMediaElement } = ctx

    const update = () => {
      const video = getMediaElement() as HTMLVideoElement | null
      const availability = detectFullscreenAvailability(container, video)
      store.batch({
        fullscreenAvailability: availability,
        canFullscreen: availability === 'available',
      })
    }

    update()

    const cleanup = onFullscreenChange((fs) => {
      store.set('fullscreen', fs)
    })

    // Re-detect after metadata loaded
    const onMeta = () => update()
    const media = getMediaElement()
    media?.addEventListener('loadedmetadata', onMeta)

    return () => {
      cleanup()
      const m = getMediaElement()
      m?.removeEventListener('loadedmetadata', onMeta)
    }
  },
}

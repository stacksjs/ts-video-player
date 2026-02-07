/**
 * Picture-in-Picture feature — PiP state + availability detection.
 *
 * @module features/pip
 */

import type { Feature, FeatureContext } from './types'
import { detectPipAvailability } from '../core/features'
import { onPiPChange } from '../core/events'

export const pip: Feature = {
  name: 'pip',
  stateKeys: ['pictureInPicture', 'pipAvailability', 'canPictureInPicture'],

  setup(ctx: FeatureContext) {
    const { store, getMediaElement } = ctx

    const update = () => {
      const video = getMediaElement() as HTMLVideoElement | null
      const availability = detectPipAvailability(video)
      store.batch({
        pipAvailability: availability,
        canPictureInPicture: availability === 'available',
      })
    }

    update()

    let cleanupPiP: (() => void) | null = null
    const media = getMediaElement()
    if (media instanceof HTMLVideoElement) {
      cleanupPiP = onPiPChange(media, (isPiP) => {
        store.set('pictureInPicture', isPiP)
      })
    }

    // Re-detect after metadata loaded
    const onMeta = () => update()
    media?.addEventListener('loadedmetadata', onMeta)

    return () => {
      cleanupPiP?.()
      const m = getMediaElement()
      m?.removeEventListener('loadedmetadata', onMeta)
    }
  },
}

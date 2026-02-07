/**
 * Volume feature — volume state + availability detection.
 *
 * @module features/volume
 */

import type { Feature, FeatureContext } from './types'
import { detectVolumeAvailability, probeVolumeAvailability } from '../core/features'

export const volume: Feature = {
  name: 'volume',
  stateKeys: ['volume', 'muted', 'volumeAvailability'],

  setup(ctx: FeatureContext) {
    const { store, getMediaElement } = ctx

    // Initial sync detection
    const media = getMediaElement()
    store.set('volumeAvailability', detectVolumeAvailability(media))

    const onVolumeChange = () => {
      const m = getMediaElement()
      if (m) store.batch({ volume: m.volume, muted: m.muted })
    }

    const onLoadedData = () => {
      const m = getMediaElement()
      if (!m) return
      probeVolumeAvailability(m).then((availability) => {
        store.set('volumeAvailability', availability)
      })
    }

    if (media) {
      media.addEventListener('volumechange', onVolumeChange)
      media.addEventListener('loadeddata', onLoadedData)
    }

    return () => {
      const m = getMediaElement()
      if (!m) return
      m.removeEventListener('volumechange', onVolumeChange)
      m.removeEventListener('loadeddata', onLoadedData)
    }
  },
}

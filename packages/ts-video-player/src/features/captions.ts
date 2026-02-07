/**
 * Captions feature — text track management.
 *
 * @module features/captions
 */

import type { Feature, FeatureContext } from './types'
import type { TextTrack } from '../types'

export const captions: Feature = {
  name: 'captions',
  stateKeys: ['textTracks'],

  setup(ctx: FeatureContext) {
    const { store, getMediaElement } = ctx

    const syncTracks = () => {
      const media = getMediaElement()
      if (!media) return

      const tracks: TextTrack[] = []
      const textTracks = media.textTracks

      for (let i = 0; i < textTracks.length; i++) {
        const track = textTracks[i]
        tracks.push({
          id: String(i),
          kind: track.kind as TextTrack['kind'],
          label: track.label || `Track ${i + 1}`,
          language: track.language || '',
          mode: track.mode as TextTrack['mode'],
          cues: [],
        })
      }

      store.set('textTracks', tracks)
    }

    const media = getMediaElement()
    if (media) {
      media.textTracks.addEventListener('change', syncTracks)
      media.textTracks.addEventListener('addtrack', syncTracks)
      media.textTracks.addEventListener('removetrack', syncTracks)
    }

    syncTracks()

    return () => {
      const m = getMediaElement()
      if (!m) return
      m.textTracks.removeEventListener('change', syncTracks)
      m.textTracks.removeEventListener('addtrack', syncTracks)
      m.textTracks.removeEventListener('removetrack', syncTracks)
    }
  },
}

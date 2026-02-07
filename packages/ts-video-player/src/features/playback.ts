/**
 * Playback feature — core playback state management.
 *
 * @module features/playback
 */

import type { Feature, FeatureContext } from './types'

export const playback: Feature = {
  name: 'playback',
  stateKeys: ['paused', 'playing', 'ended', 'seeking', 'waiting', 'currentTime', 'duration', 'playbackRate', 'loop', 'autoplay', 'playbackState'],

  setup(ctx: FeatureContext) {
    const { store, getMediaElement } = ctx

    const onPlay = () => store.batch({ paused: false, ended: false })
    const onPause = () => store.set('paused', true)
    const onPlaying = () => store.batch({ playing: true, waiting: false, playbackState: 'playing' })
    const onWaiting = () => store.batch({ waiting: true, playbackState: 'buffering' })
    const onSeeking = () => store.set('seeking', true)
    const onSeeked = () => store.set('seeking', false)
    const onEnded = () => store.batch({ ended: true, playing: false, playbackState: 'ended' })
    const onTimeUpdate = () => {
      const media = getMediaElement()
      if (media) store.set('currentTime', media.currentTime)
    }
    const onDurationChange = () => {
      const media = getMediaElement()
      if (media) store.set('duration', media.duration)
    }
    const onRateChange = () => {
      const media = getMediaElement()
      if (media) store.set('playbackRate', media.playbackRate)
    }

    const bind = () => {
      const media = getMediaElement()
      if (!media) return
      media.addEventListener('play', onPlay)
      media.addEventListener('pause', onPause)
      media.addEventListener('playing', onPlaying)
      media.addEventListener('waiting', onWaiting)
      media.addEventListener('seeking', onSeeking)
      media.addEventListener('seeked', onSeeked)
      media.addEventListener('ended', onEnded)
      media.addEventListener('timeupdate', onTimeUpdate)
      media.addEventListener('durationchange', onDurationChange)
      media.addEventListener('ratechange', onRateChange)
    }

    bind()

    return () => {
      const media = getMediaElement()
      if (!media) return
      media.removeEventListener('play', onPlay)
      media.removeEventListener('pause', onPause)
      media.removeEventListener('playing', onPlaying)
      media.removeEventListener('waiting', onWaiting)
      media.removeEventListener('seeking', onSeeking)
      media.removeEventListener('seeked', onSeeked)
      media.removeEventListener('ended', onEnded)
      media.removeEventListener('timeupdate', onTimeUpdate)
      media.removeEventListener('durationchange', onDurationChange)
      media.removeEventListener('ratechange', onRateChange)
    }
  },
}

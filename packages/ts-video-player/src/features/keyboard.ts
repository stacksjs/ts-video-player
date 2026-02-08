/**
 * Keyboard feature — keyboard shortcut handling.
 *
 * @module features/keyboard
 */

import type { Feature, FeatureContext } from './types'
import { createKeyboardHandler, type KeyboardActions } from '../core/events'

export const keyboard: Feature = {
  name: 'keyboard',

  setup(ctx: FeatureContext) {
    const { container, options } = ctx

    if (options.keyboard === false) return

    const actions: KeyboardActions = {
      togglePlay: () => {
        const media = ctx.getMediaElement()
        if (!media) return
        if (media.paused) media.play()
        else media.pause()
      },
      toggleMute: () => {
        const media = ctx.getMediaElement()
        if (media) media.muted = !media.muted
      },
      toggleFullscreen: () => {
        // Handled at player level
      },
      togglePiP: () => {
        // Handled at player level
      },
      toggleCaptions: () => {
        // Handled at player level
      },
      seekBackward: () => {
        const media = ctx.getMediaElement()
        if (media) media.currentTime = Math.max(0, media.currentTime - 5)
      },
      seekForward: () => {
        const media = ctx.getMediaElement()
        if (media) media.currentTime = Math.min(media.duration, media.currentTime + 5)
      },
      volumeUp: () => {
        const media = ctx.getMediaElement()
        if (media) media.volume = Math.min(1, media.volume + 0.1)
      },
      volumeDown: () => {
        const media = ctx.getMediaElement()
        if (media) media.volume = Math.max(0, media.volume - 0.1)
      },
      speedUp: () => {
        const media = ctx.getMediaElement()
        if (media) media.playbackRate = Math.min(4, media.playbackRate + 0.25)
      },
      speedDown: () => {
        const media = ctx.getMediaElement()
        if (media) media.playbackRate = Math.max(0.25, media.playbackRate - 0.25)
      },
      seekStart: () => {
        const media = ctx.getMediaElement()
        if (media) media.currentTime = 0
      },
      seekEnd: () => {
        const media = ctx.getMediaElement()
        if (media) media.currentTime = media.duration
      },
      seekPercent: (percent) => {
        const media = ctx.getMediaElement()
        if (media) media.currentTime = (percent / 100) * media.duration
      },
    }

    const config = typeof options.keyboard === 'object' ? options.keyboard as Record<string, any> : {}
    const handler = createKeyboardHandler(actions, {
      seekStep: config.seekStep,
      volumeStep: config.volumeStep,
    })

    const target = config.global ? document : container
    target.addEventListener('keydown', handler as EventListener)

    return () => {
      target.removeEventListener('keydown', handler as EventListener)
    }
  },
}

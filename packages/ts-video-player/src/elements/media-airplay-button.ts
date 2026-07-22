/**
 * ts-video-player <media-airplay-button> Custom Element
 *
 * @module elements/media-airplay-button
 */

import { HTMLElementBase } from './base'
import { resolvePlayer } from './utils'

const AIRPLAY_ICON = 'M6.2 19h11.6L12 13.2 6.2 19zM19 3H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2v-2H5V5h14v10h-2v2h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z'

interface AirPlayVideo extends HTMLVideoElement {
  webkitShowPlaybackTargetPicker?: () => void
  webkitCurrentPlaybackTargetIsWireless?: boolean
}

export class MediaAirplayButton extends HTMLElementBase {
  private cleanup: (() => void) | null = null

  connectedCallback(): void {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: 'open' })
      shadow.innerHTML = `
        <style>
          :host { display: none; }
          :host([available]) { display: inline-flex; }
          button { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; padding: 8px; background: transparent; border: 0; color: inherit; cursor: pointer; }
          button:hover { opacity: 0.8; }
          :host([connected]) button { color: var(--media-airplay-active-color, #38bdf8); }
        </style>
        <button part="button" type="button" aria-label="Play on AirPlay">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" part="icon"><path d="${AIRPLAY_ICON}"/></svg>
        </button>
      `
    }
    queueMicrotask(() => this.attach())
  }

  disconnectedCallback(): void {
    this.cleanup?.()
    this.cleanup = null
  }

  private attach(): void {
    const player = resolvePlayer(this)
    const button = this.shadowRoot?.querySelector('button')
    if (!player || !button) return

    let video: AirPlayVideo | null = null
    const availability = (): void => update()
    const update = (): void => {
      const media = player.provider?.mediaElement
      const nextVideo = media instanceof HTMLVideoElement ? media as AirPlayVideo : null
      if (nextVideo !== video) {
        video?.removeEventListener('webkitplaybacktargetavailabilitychanged', availability)
        video?.removeEventListener('webkitcurrentplaybacktargetiswirelesschanged', availability)
        nextVideo?.addEventListener('webkitplaybacktargetavailabilitychanged', availability)
        nextVideo?.addEventListener('webkitcurrentplaybacktargetiswirelesschanged', availability)
        video = nextVideo
      }
      const available = typeof video?.webkitShowPlaybackTargetPicker === 'function'
      this.toggleAttribute('available', available)
      this.toggleAttribute('connected', video?.webkitCurrentPlaybackTargetIsWireless === true)
      button.setAttribute('aria-pressed', String(video?.webkitCurrentPlaybackTargetIsWireless === true))
    }
    const click = (): void => video?.webkitShowPlaybackTargetPicker?.()
    button.addEventListener('click', click)
    const unsubscribe = player.subscribe(update)
    update()

    this.cleanup = () => {
      unsubscribe()
      button.removeEventListener('click', click)
      video?.removeEventListener('webkitplaybacktargetavailabilitychanged', availability)
      video?.removeEventListener('webkitcurrentplaybacktargetiswirelesschanged', availability)
    }
  }
}

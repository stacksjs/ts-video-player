/**
 * ts-video-player <media-mute-button> Custom Element
 *
 * @module elements/media-mute-button
 */

import { resolvePlayer } from './utils'

const ICON_MUTED = 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z'
const ICON_LOW = 'M18.5 12A4.5 4.5 0 0 0 16 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z'
const ICON_HIGH = 'M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z'

function getVolumeIcon(muted: boolean, volume: number): string {
  if (muted || volume === 0) return ICON_MUTED
  if (volume < 0.5) return ICON_LOW
  return ICON_HIGH
}

export class MediaMuteButton extends HTMLElement {
  private _cleanup: (() => void) | null = null

  connectedCallback(): void {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: 'open' })
      shadow.innerHTML = `
        <style>
          :host { display: inline-flex; }
          button {
            display: inline-flex; align-items: center; justify-content: center;
            width: 40px; height: 40px; padding: 8px;
            background: transparent; border: none; color: inherit; cursor: pointer;
          }
          button:hover { opacity: 0.8; }
        </style>
        <button part="button" type="button" aria-label="Mute">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" part="icon">
            <path d="${ICON_HIGH}"/>
          </svg>
        </button>
      `
    }

    queueMicrotask(() => this.attach())
  }

  disconnectedCallback(): void {
    this._cleanup?.()
    this._cleanup = null
  }

  private attach(): void {
    const player = resolvePlayer(this)
    if (!player) return

    const btn = this.shadowRoot!.querySelector('button')!
    btn.addEventListener('click', () => player.toggleMute())

    const unsub = player.subscribe((state: any) => {
      const icon = getVolumeIcon(state.muted, state.volume)
      btn.setAttribute('aria-label', state.muted ? 'Unmute' : 'Mute')
      const path = this.shadowRoot!.querySelector('path')!
      path.setAttribute('d', icon)
    })

    this._cleanup = unsub
  }
}

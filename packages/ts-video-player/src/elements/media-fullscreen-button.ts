/**
 * ts-video-player <media-fullscreen-button> Custom Element
 *
 * @module elements/media-fullscreen-button
 */

import { resolvePlayer } from './utils'

const ENTER_FS = 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z'
const EXIT_FS = 'M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z'

export class MediaFullscreenButton extends HTMLElement {
  private _cleanup: (() => void) | null = null

  connectedCallback(): void {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: 'open' })
      shadow.innerHTML = `
        <style>
          :host { display: inline-flex; }
          :host([hidden]) { display: none; }
          button {
            display: inline-flex; align-items: center; justify-content: center;
            width: 40px; height: 40px; padding: 8px;
            background: transparent; border: none; color: inherit; cursor: pointer;
          }
          button:hover { opacity: 0.8; }
          button:disabled { opacity: 0.4; cursor: not-allowed; }
        </style>
        <button part="button" type="button" aria-label="Enter fullscreen">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" part="icon">
            <path d="${ENTER_FS}"/>
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
    btn.addEventListener('click', () => player.toggleFullscreen())

    const unsub = player.subscribe((state: any) => {
      const avail = state.fullscreenAvailability
      if (avail === 'unsupported') {
        this.setAttribute('hidden', '')
      } else {
        this.removeAttribute('hidden')
      }
      btn.disabled = avail !== 'available'

      const fs = state.fullscreen
      btn.setAttribute('aria-label', fs ? 'Exit fullscreen' : 'Enter fullscreen')
      const path = this.shadowRoot!.querySelector('path')!
      path.setAttribute('d', fs ? EXIT_FS : ENTER_FS)
    })

    this._cleanup = unsub
  }
}

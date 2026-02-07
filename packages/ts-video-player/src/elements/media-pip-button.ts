/**
 * ts-video-player <media-pip-button> Custom Element
 *
 * @module elements/media-pip-button
 */

import { resolvePlayer } from './utils'

const PIP_ICON = 'M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z'

export class MediaPipButton extends HTMLElement {
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
        <button part="button" type="button" aria-label="Picture in picture">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" part="icon">
            <path d="${PIP_ICON}"/>
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
    btn.addEventListener('click', () => player.togglePiP())

    const unsub = player.subscribe((state: any) => {
      const avail = state.pipAvailability
      if (avail === 'unsupported') {
        this.setAttribute('hidden', '')
      } else {
        this.removeAttribute('hidden')
      }
      btn.disabled = avail !== 'available'
    })

    this._cleanup = unsub
  }
}

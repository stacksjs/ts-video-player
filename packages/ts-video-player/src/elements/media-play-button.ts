/**
 * ts-video-player <media-play-button> Custom Element
 *
 * @module elements/media-play-button
 */

import { resolvePlayer } from './utils'

const PLAY_ICON = 'M8 5v14l11-7z'
const PAUSE_ICON = 'M6 19h4V5H6v14zm8-14v14h4V5h-4z'

export class MediaPlayButton extends HTMLElement {
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
        <button part="button" type="button" aria-label="Play">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" part="icon">
            <path d="${PLAY_ICON}"/>
          </svg>
        </button>
      `
    }

    // Defer player resolution to next microtask (player may not be ready yet)
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
    btn.addEventListener('click', () => player.togglePlay())

    const unsub = player.subscribe('paused', (state: any) => {
      const paused = state.paused
      btn.setAttribute('aria-label', paused ? 'Play' : 'Pause')
      btn.setAttribute('aria-pressed', String(!paused))
      const path = this.shadowRoot!.querySelector('path')!
      path.setAttribute('d', paused ? PLAY_ICON : PAUSE_ICON)
    })

    this._cleanup = unsub
  }
}

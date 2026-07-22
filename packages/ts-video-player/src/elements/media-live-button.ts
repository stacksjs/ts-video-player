/**
 * ts-video-player <media-live-button> Custom Element
 *
 * @module elements/media-live-button
 */

import { HTMLElementBase } from './base'
import { resolvePlayer } from './utils'

export class MediaLiveButton extends HTMLElementBase {
  private cleanup: (() => void) | null = null

  connectedCallback(): void {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: 'open' })
      shadow.innerHTML = `
        <style>
          :host { display: none; }
          :host([available]) { display: inline-flex; }
          button { display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 8px; background: transparent; border: 0; color: inherit; cursor: pointer; font: inherit; font-size: 12px; font-weight: 700; }
          i { width: 8px; height: 8px; border-radius: 9999px; background: #ef4444; }
          :host(:not([at-live-edge])) button { opacity: 0.72; }
        </style>
        <button part="button" type="button" aria-label="Go to live edge"><i aria-hidden="true"></i><span>LIVE</span></button>
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
    const threshold = Math.max(0, Number(this.getAttribute('threshold') || 10))
    const update = (): void => {
      const state = player.state
      const end = state.seekable.at(-1)?.end
      const providerLive = (player.provider as { isLive?: boolean } | null)?.isLive === true
      const available = end !== undefined && (providerLive || !Number.isFinite(state.duration))
      const atLiveEdge = available && end - state.currentTime <= threshold
      this.toggleAttribute('available', available)
      this.toggleAttribute('at-live-edge', atLiveEdge)
      button.setAttribute('aria-pressed', String(atLiveEdge))
    }
    const click = (): void => {
      const end = player.state.seekable.at(-1)?.end
      if (end !== undefined) {
        player.seekTo(end)
        void player.play()
      }
    }
    button.addEventListener('click', click)
    const unsubscribe = player.subscribe(update)
    update()
    this.cleanup = () => {
      unsubscribe()
      button.removeEventListener('click', click)
    }
  }
}

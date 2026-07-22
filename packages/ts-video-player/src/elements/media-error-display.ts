/**
 * ts-video-player <media-error-display> Custom Element
 *
 * @module elements/media-error-display
 */

import { HTMLElementBase } from './base'
import { resolvePlayer } from './utils'

export class MediaErrorDisplay extends HTMLElementBase {
  private cleanup: (() => void) | null = null

  connectedCallback(): void {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: 'open' })
      shadow.innerHTML = `
        <style>
          :host { display: none; position: absolute; inset: 0; z-index: 5; place-items: center; padding: 24px; background: rgba(0, 0, 0, 0.76); color: white; text-align: center; }
          :host([open]) { display: grid; }
          p { max-width: 42rem; margin: 0; font: 500 14px/1.5 system-ui, sans-serif; }
        </style>
        <p part="message" role="alert" aria-live="assertive"></p>
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
    const message = this.shadowRoot?.querySelector('p')
    if (!player || !message) return
    const update = (): void => {
      const error = player.state.error
      this.toggleAttribute('open', !!error)
      message.textContent = error?.message || ''
      if (error?.code !== undefined) this.setAttribute('data-code', String(error.code))
      else this.removeAttribute('data-code')
    }
    this.cleanup = player.subscribe(update)
    update()
  }
}

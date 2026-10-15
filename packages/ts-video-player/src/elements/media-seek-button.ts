import { label, resolvePlayer } from './utils'
import type { PlayerState } from '../types'

import { HTMLElementBase } from './base'

export class MediaSeekButton extends HTMLElementBase {
  private cleanup: (() => void) | null = null
  private onClick: (() => void) | null = null

  connectedCallback(): void {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: 'open' })
      shadow.innerHTML = `
        <style>
          :host { display: inline-flex; }
          button { min-width: 40px; height: 40px; padding: 0 8px; border: 0; background: transparent; color: inherit; cursor: pointer; font: inherit; }
          button:hover { opacity: .8; }
          button:focus-visible { outline: 2px solid currentColor; outline-offset: -2px; }
          button:disabled { cursor: default; opacity: .45; }
          /* 44px, the smallest a finger hits reliably, on a touch screen. */
          @media (pointer: coarse) { button { min-width: 44px; min-height: 44px; } }
        </style>
        <button part="button" type="button"></button>
      `
    }
    queueMicrotask(() => this.attach())
  }

  disconnectedCallback(): void {
    const button = this.shadowRoot?.querySelector('button')
    if (button && this.onClick) button.removeEventListener('click', this.onClick)
    this.cleanup?.()
    this.cleanup = null
    this.onClick = null
  }

  private attach(): void {
    const player = resolvePlayer(this)
    const button = this.shadowRoot?.querySelector('button')
    if (!player || !button) return
    const seconds = Number.parseFloat(this.getAttribute('seconds') ?? '10')
    const offset = Number.isFinite(seconds) && seconds !== 0 ? seconds : 10
    button.textContent = offset > 0 ? `+${offset}` : String(offset)
    button.setAttribute('aria-label', label(this, offset > 0 ? 'seekForward' : 'seekBackward', { seconds: Math.abs(offset) }))
    this.onClick = () => player.seekBy(offset)
    button.addEventListener('click', this.onClick)
    this.cleanup = player.subscribe((state: PlayerState) => {
      button.disabled = offset < 0 ? state.currentTime <= 0 : state.duration > 0 && state.currentTime >= state.duration
    })
  }
}

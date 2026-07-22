import { resolvePlayer } from './utils'
import type { PlayerState } from '../types'

const defaultRates = [0.5, 0.75, 1, 1.25, 1.5, 2]

import { HTMLElementBase } from './base'

export class MediaPlaybackRateButton extends HTMLElementBase {
  private cleanup: (() => void) | null = null
  private onClick: (() => void) | null = null

  connectedCallback(): void {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: 'open' })
      shadow.innerHTML = `
        <style>
          :host { display: inline-flex; }
          button { min-width: 42px; height: 40px; padding: 0 8px; border: 0; background: transparent; color: inherit; cursor: pointer; font: inherit; font-variant-numeric: tabular-nums; }
          button:hover { opacity: .8; }
          button:focus-visible { outline: 2px solid currentColor; outline-offset: -2px; }
        </style>
        <button part="button" type="button" aria-label="Playback speed"></button>
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

  private getRates(): number[] {
    const rates = (this.getAttribute('rates') ?? '')
      .split(',')
      .map(value => Number.parseFloat(value.trim()))
      .filter(value => Number.isFinite(value) && value >= 0.25 && value <= 4)
    return [...new Set(rates.length > 0 ? rates : defaultRates)].sort((a, b) => a - b)
  }

  private attach(): void {
    const player = resolvePlayer(this)
    const button = this.shadowRoot?.querySelector('button')
    if (!player || !button) return
    const rates = this.getRates()
    this.onClick = () => {
      const currentIndex = rates.findIndex(rate => rate > player.state.playbackRate + 0.001)
      player.setPlaybackRate(rates[currentIndex < 0 ? 0 : currentIndex])
    }
    button.addEventListener('click', this.onClick)
    this.cleanup = player.subscribe('playbackRate', (state: PlayerState) => {
      button.textContent = `${state.playbackRate}x`
      button.setAttribute('aria-label', `Playback speed ${state.playbackRate}x`)
    })
  }
}

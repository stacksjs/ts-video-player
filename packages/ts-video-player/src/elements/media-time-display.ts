/**
 * ts-video-player <media-time-display> Custom Element
 *
 * Displays current time, duration, or remaining time with semantic markup.
 * Attributes: type="current|duration|remaining"
 *
 * @module elements/media-time-display
 */

import { resolvePlayer, formatTime, formatTimePhrase, toISODuration } from './utils'

export class MediaTimeDisplay extends HTMLElement {
  private _cleanup: (() => void) | null = null
  private _showRemaining = false

  static get observedAttributes(): string[] {
    return ['type']
  }

  get type(): string {
    return this.getAttribute('type') || 'current'
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: 'open' })
      shadow.innerHTML = `
        <style>
          :host {
            display: inline-flex;
            font-size: 14px;
            font-variant-numeric: tabular-nums;
            user-select: none;
            cursor: pointer;
            color: inherit;
          }
          time { color: inherit; }
          .separator { margin: 0 2px; }
        </style>
        <time part="time" datetime="PT0S" aria-valuetext="0 seconds">0:00</time>
      `
    }

    this.addEventListener('click', this.handleClick)

    queueMicrotask(() => this.attach())
  }

  disconnectedCallback(): void {
    this._cleanup?.()
    this._cleanup = null
    this.removeEventListener('click', this.handleClick)
  }

  private handleClick = (): void => {
    if (this.type === 'duration') {
      this._showRemaining = !this._showRemaining
      // Re-render with current state
      const player = resolvePlayer(this)
      if (player) this.render(player.state)
    }
  }

  private attach(): void {
    const player = resolvePlayer(this)
    if (!player) return

    const unsub = player.subscribe((state: any) => {
      this.render(state)
    })

    this._cleanup = unsub
  }

  private render(state: any): void {
    const timeEl = this.shadowRoot?.querySelector('time')
    if (!timeEl) return

    const type = this.type
    let seconds: number

    if (type === 'remaining' || (type === 'duration' && this._showRemaining)) {
      seconds = Math.max(state.duration - state.currentTime, 0)
      const formatted = `-${formatTime(seconds, state.duration)}`
      timeEl.textContent = formatted
    } else if (type === 'duration') {
      seconds = state.duration
      timeEl.textContent = formatTime(seconds)
    } else {
      seconds = state.currentTime
      timeEl.textContent = formatTime(seconds, state.duration)
    }

    timeEl.setAttribute('datetime', toISODuration(seconds))
    timeEl.setAttribute('aria-valuetext', formatTimePhrase(seconds))
  }
}

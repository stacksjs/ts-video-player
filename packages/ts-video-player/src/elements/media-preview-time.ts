/**
 * ts-video-player <media-preview-time> Custom Element
 *
 * Displays the time at the current pointer position on the seek bar.
 * Intended to be placed inside or near a <media-progress-bar>.
 * Listens for custom 'previewtime' events or pointer events on the progress bar.
 *
 * @module elements/media-preview-time
 */

import { resolvePlayer, formatTime } from './utils'

export class MediaPreviewTime extends HTMLElement {
  private _cleanups: Array<() => void> = []

  connectedCallback(): void {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: 'open' })
      shadow.innerHTML = `
        <style>
          :host {
            display: inline-block;
            font-variant-numeric: tabular-nums;
            font-family: monospace;
            font-size: 12px;
            color: inherit;
            pointer-events: none;
          }
        </style>
        <span part="value">0:00</span>
      `
    }

    queueMicrotask(() => this.attach())
  }

  disconnectedCallback(): void {
    this._cleanups.forEach((fn) => fn())
    this._cleanups = []
  }

  private attach(): void {
    const player = resolvePlayer(this)
    if (!player) return

    // Find sibling or parent progress bar to listen for pointer events
    const progressBar =
      this.closest('media-progress-bar') ||
      this.parentElement?.querySelector('media-progress-bar')

    if (progressBar) {
      const onPointerMove = (e: Event) => {
        const pe = e as PointerEvent
        const track = (progressBar.shadowRoot?.querySelector('.track') ||
          progressBar) as HTMLElement
        const rect = track.getBoundingClientRect()
        const percent = Math.max(0, Math.min(1, (pe.clientX - rect.left) / rect.width))
        const time = percent * (player.state.duration || 0)
        this.updateTime(time, player.state.duration)
      }

      progressBar.addEventListener('pointermove', onPointerMove)
      this._cleanups.push(() => progressBar.removeEventListener('pointermove', onPointerMove))
    }
  }

  private updateTime(time: number, duration: number): void {
    const span = this.shadowRoot?.querySelector('span')
    if (span) {
      span.textContent = formatTime(time, duration)
    }
  }
}

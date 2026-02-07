/**
 * ts-video-player <media-progress-bar> Custom Element
 *
 * Seek bar with buffered overlay, pointer/keyboard interaction.
 *
 * @module elements/media-progress-bar
 */

import { resolvePlayer, formatTime, formatTimePhrase } from './utils'

export class MediaProgressBar extends HTMLElement {
  private _cleanups: Array<() => void> = []
  private _isDragging = false

  connectedCallback(): void {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: 'open' })
      shadow.innerHTML = `
        <style>
          :host { display: flex; flex: 1; align-items: center; }
          .container {
            position: relative; width: 100%; height: 20px;
            cursor: pointer; touch-action: none;
          }
          .track {
            position: absolute; top: 50%; left: 0; right: 0;
            height: 4px; background: rgba(255,255,255,0.3);
            border-radius: 2px; transform: translateY(-50%);
          }
          .buffered {
            position: absolute; top: 0; left: 0;
            height: 100%; background: rgba(255,255,255,0.4);
            border-radius: 2px; width: 0%;
          }
          .fill {
            position: absolute; top: 0; left: 0;
            height: 100%; background: #fff;
            border-radius: 2px; width: 0%;
          }
          .thumb {
            position: absolute; top: 50%; left: 0%;
            width: 12px; height: 12px; background: #fff;
            border-radius: 50%; transform: translate(-50%, -50%);
            transition: transform 0.1s;
          }
          .container:hover .thumb { transform: translate(-50%, -50%) scale(1.2); }
        </style>
        <div class="container" part="container" role="slider"
             aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"
             aria-label="Seek" tabindex="0">
          <div class="track" part="track">
            <div class="buffered" part="buffered"></div>
            <div class="fill" part="fill"></div>
            <div class="thumb" part="thumb"></div>
          </div>
        </div>
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

    const container = this.shadowRoot!.querySelector('.container') as HTMLElement
    const track = this.shadowRoot!.querySelector('.track') as HTMLElement
    const fill = this.shadowRoot!.querySelector('.fill') as HTMLElement
    const thumb = this.shadowRoot!.querySelector('.thumb') as HTMLElement
    const buffered = this.shadowRoot!.querySelector('.buffered') as HTMLElement

    const seekFromEvent = (e: PointerEvent) => {
      const rect = track.getBoundingClientRect()
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const time = percent * (player.state.duration || 0)
      player.seekTo(time)
    }

    const onPointerDown = (e: PointerEvent) => {
      this._isDragging = true
      container.setPointerCapture(e.pointerId)
      seekFromEvent(e)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!this._isDragging) return
      seekFromEvent(e)
    }

    const onPointerUp = (e: PointerEvent) => {
      if (!this._isDragging) return
      this._isDragging = false
      container.releasePointerCapture(e.pointerId)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const step = 5
      let newTime = player.state.currentTime

      switch (e.key) {
        case 'ArrowRight': newTime = Math.min(player.state.duration, newTime + step); break
        case 'ArrowLeft': newTime = Math.max(0, newTime - step); break
        case 'Home': newTime = 0; break
        case 'End': newTime = player.state.duration; break
        default: return
      }

      e.preventDefault()
      player.seekTo(newTime)
    }

    container.addEventListener('pointerdown', onPointerDown)
    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerup', onPointerUp)
    container.addEventListener('keydown', onKeyDown)

    this._cleanups.push(
      () => container.removeEventListener('pointerdown', onPointerDown),
      () => container.removeEventListener('pointermove', onPointerMove),
      () => container.removeEventListener('pointerup', onPointerUp),
      () => container.removeEventListener('keydown', onKeyDown),
    )

    const unsub = player.subscribe((state: any) => {
      if (this._isDragging) return

      const duration = state.duration || 0
      const percent = duration > 0 ? (state.currentTime / duration) * 100 : 0

      fill.style.width = `${percent}%`
      thumb.style.left = `${percent}%`

      container.setAttribute('aria-valuenow', String(Math.round(percent)))
      container.setAttribute('aria-valuetext', `${formatTimePhrase(state.currentTime)} of ${formatTimePhrase(duration)}`)

      // Buffered
      const bufferedPct = (state.bufferedAmount || 0) * 100
      buffered.style.width = `${bufferedPct}%`
    })

    this._cleanups.push(unsub)
  }
}

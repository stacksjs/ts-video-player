/**
 * ts-video-player <media-volume-slider> Custom Element
 *
 * Volume control slider. Hidden when volume is unsupported (iOS Safari).
 *
 * @module elements/media-volume-slider
 */

import { resolvePlayer } from './utils'

export class MediaVolumeSlider extends HTMLElement {
  private _cleanups: Array<() => void> = []
  private _isDragging = false

  connectedCallback(): void {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: 'open' })
      shadow.innerHTML = `
        <style>
          :host { display: inline-flex; align-items: center; width: 80px; }
          :host([hidden]) { display: none; }
          .container {
            position: relative; width: 100%; height: 20px;
            cursor: pointer; touch-action: none;
          }
          .track {
            position: absolute; top: 50%; left: 0; right: 0;
            height: 4px; background: rgba(255,255,255,0.3);
            border-radius: 2px; transform: translateY(-50%);
          }
          .fill {
            position: absolute; top: 0; left: 0;
            height: 100%; background: #fff;
            border-radius: 2px; width: 100%;
          }
          .thumb {
            position: absolute; top: 50%; left: 100%;
            width: 12px; height: 12px; background: #fff;
            border-radius: 50%; transform: translate(-50%, -50%);
            transition: transform 0.1s;
          }
          .container:hover .thumb { transform: translate(-50%, -50%) scale(1.2); }
        </style>
        <div class="container" part="container" role="slider"
             aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"
             aria-label="Volume" tabindex="0">
          <div class="track" part="track">
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

    const setFromEvent = (e: PointerEvent) => {
      const rect = track.getBoundingClientRect()
      const volume = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      player.setVolume(volume)
      if (volume > 0 && player.state.muted) player.setMuted(false)
    }

    const onPointerDown = (e: PointerEvent) => {
      this._isDragging = true
      container.setPointerCapture(e.pointerId)
      setFromEvent(e)
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!this._isDragging) return
      setFromEvent(e)
    }
    const onPointerUp = (e: PointerEvent) => {
      if (!this._isDragging) return
      this._isDragging = false
      container.releasePointerCapture(e.pointerId)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      let volume = player.state.volume
      const step = 0.05

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp': volume = Math.min(1, volume + step); break
        case 'ArrowLeft':
        case 'ArrowDown': volume = Math.max(0, volume - step); break
        default: return
      }

      e.preventDefault()
      player.setVolume(volume)
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
      if (state.volumeAvailability === 'unsupported') {
        this.setAttribute('hidden', '')
        return
      }
      this.removeAttribute('hidden')

      const vol = state.muted ? 0 : state.volume
      const percent = vol * 100

      fill.style.width = `${percent}%`
      thumb.style.left = `${percent}%`
      container.setAttribute('aria-valuenow', String(Math.round(percent)))
    })

    this._cleanups.push(unsub)
  }
}

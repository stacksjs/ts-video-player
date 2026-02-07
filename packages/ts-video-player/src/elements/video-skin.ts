/**
 * ts-video-player <video-skin> Custom Element
 *
 * Adaptive skin wrapper that provides a default layout for player controls.
 * Adjusts visibility of controls based on available features.
 *
 * Follows the v10 layered model:
 *   <video-player>       ← Behavior
 *     <video-skin>       ← Appearance (this element)
 *       <media-*>        ← UI controls
 *     </video-skin>
 *   </video-player>
 *
 * @module elements/video-skin
 */

import { resolvePlayer } from './utils'

export class VideoSkin extends HTMLElement {
  private _cleanups: Array<() => void> = []

  connectedCallback(): void {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: 'open' })
      shadow.innerHTML = `
        <style>
          :host {
            display: flex;
            flex-direction: column;
            position: absolute;
            inset: 0;
            z-index: 1;
            pointer-events: none;
            color: white;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
          }

          /* Click-to-play overlay */
          .overlay {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: auto;
          }

          /* Bottom controls bar */
          .controls {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 8px 12px;
            background: linear-gradient(transparent, rgba(0,0,0,0.7));
            pointer-events: auto;
            transition: opacity 0.3s, visibility 0.3s;
          }

          :host([controls-hidden]) .controls {
            opacity: 0;
            visibility: hidden;
          }

          /* Spacer pushes right-aligned controls */
          .spacer {
            flex: 1;
          }

          /* Slots for left/center/right control groups */
          ::slotted(*) {
            pointer-events: auto;
          }
        </style>
        <div class="overlay" part="overlay">
          <slot name="overlay"></slot>
        </div>
        <div class="controls" part="controls">
          <slot name="left"></slot>
          <slot name="center"></slot>
          <div class="spacer"></div>
          <slot name="right"></slot>
          <slot></slot>
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

    // Sync controls visibility
    const unsub = player.subscribe((state: any) => {
      if (state.controlsVisible) {
        this.removeAttribute('controls-hidden')
      } else {
        this.setAttribute('controls-hidden', '')
      }

      // Propagate feature availability as data attributes for CSS adaptation
      this.dataset.fullscreen = state.fullscreenAvailability
      this.dataset.pip = state.pipAvailability
      this.dataset.volume = state.volumeAvailability
      this.dataset.captions = String(state.textTracks.length > 0)
      this.dataset.qualities = String(state.qualities.length > 0)
    })

    // Click overlay to toggle play
    const overlay = this.shadowRoot!.querySelector('.overlay')!
    const onOverlayClick = () => player.togglePlay()
    overlay.addEventListener('click', onOverlayClick)

    this._cleanups.push(
      unsub,
      () => overlay.removeEventListener('click', onOverlayClick),
    )
  }
}

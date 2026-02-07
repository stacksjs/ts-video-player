/**
 * ts-video-player <media-time-separator> Custom Element
 *
 * Visual separator between time displays (typically "/" or ":").
 * Hidden from screen readers via aria-hidden.
 *
 * @module elements/media-time-separator
 */

export class MediaTimeSeparator extends HTMLElement {
  connectedCallback(): void {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: 'open' })
      shadow.innerHTML = `
        <style>
          :host {
            display: inline-flex;
            align-items: center;
            padding: 0 2px;
            font-family: inherit;
            font-size: inherit;
            color: inherit;
            opacity: 0.7;
          }
        </style>
        <span aria-hidden="true" part="separator"><slot>/</slot></span>
      `
    }

    this.setAttribute('role', 'separator')
    this.setAttribute('aria-hidden', 'true')
  }
}

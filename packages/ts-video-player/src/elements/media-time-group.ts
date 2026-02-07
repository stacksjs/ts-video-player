/**
 * ts-video-player <media-time-group> Custom Element
 *
 * Container for composing time display elements (current / separator / duration).
 * Provides layout and semantic grouping.
 *
 * @example
 * ```html
 * <media-time-group>
 *   <media-time-display type="current"></media-time-display>
 *   <media-time-separator></media-time-separator>
 *   <media-time-display type="duration"></media-time-display>
 * </media-time-group>
 * ```
 *
 * @module elements/media-time-group
 */

export class MediaTimeGroup extends HTMLElement {
  connectedCallback(): void {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: 'open' })
      shadow.innerHTML = `
        <style>
          :host {
            display: inline-flex;
            align-items: center;
            gap: 2px;
            font-variant-numeric: tabular-nums;
            font-family: inherit;
            font-size: inherit;
            color: inherit;
          }
        </style>
        <slot></slot>
      `
    }
  }
}

/**
 * Player Layouts
 *
 * Pre-built player layouts for quick setup.
 *
 * @module layouts
 */

import type { PlayerOptions } from '../types'

// =============================================================================
// Types
// =============================================================================

export interface LayoutConfig {
  /** Layout name */
  name: string
  /** Layout description */
  description: string
  /** CSS styles to inject */
  styles: string
  /** HTML structure template */
  template: string
  /** Default player options for this layout */
  defaultOptions?: Partial<PlayerOptions>
  /** Initialize layout-specific behavior */
  init?: (container: HTMLElement) => void
  /** Cleanup layout */
  destroy?: (container: HTMLElement) => void
}

export type LayoutName = 'default' | 'minimal' | 'cinema' | 'youtube' | 'vimeo' | 'audio'

// =============================================================================
// Default Layout
// =============================================================================

export const defaultLayout: LayoutConfig = {
  name: 'default',
  description: 'Full-featured default layout with all controls',
  styles: `
    .tsvp-layout-default {
      --tsvp-controls-height: 48px;
    }

    .tsvp-layout-default .tsvp-controls {
      display: flex;
      flex-direction: column;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--tsvp-controls-bg);
      padding: var(--tsvp-controls-padding);
      opacity: 0;
      transition: opacity var(--tsvp-transition-normal) var(--tsvp-transition-easing);
    }

    .tsvp-layout-default:hover .tsvp-controls,
    .tsvp-layout-default.tsvp-controls-visible .tsvp-controls {
      opacity: 1;
    }

    .tsvp-layout-default .tsvp-controls-row {
      display: flex;
      align-items: center;
      gap: var(--tsvp-spacing-sm);
    }

    .tsvp-layout-default .tsvp-controls-row-progress {
      padding: 0 var(--tsvp-spacing-sm);
    }

    .tsvp-layout-default .tsvp-controls-row-buttons {
      height: var(--tsvp-controls-height);
    }

    .tsvp-layout-default .tsvp-controls-left,
    .tsvp-layout-default .tsvp-controls-right {
      display: flex;
      align-items: center;
      gap: var(--tsvp-spacing-xs);
    }

    .tsvp-layout-default .tsvp-controls-center {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tsvp-layout-default .tsvp-controls-spacer {
      flex: 1;
    }
  `,
  template: `
    <div class="tsvp-video-container">
      <slot name="video"></slot>
    </div>
    <div class="tsvp-poster"></div>
    <div class="tsvp-captions"></div>
    <div class="tsvp-gestures"></div>
    <div class="tsvp-buffering-indicator"></div>
    <div class="tsvp-controls">
      <div class="tsvp-controls-row tsvp-controls-row-progress">
        <slot name="progress"></slot>
      </div>
      <div class="tsvp-controls-row tsvp-controls-row-buttons">
        <div class="tsvp-controls-left">
          <slot name="play-button"></slot>
          <slot name="volume"></slot>
          <slot name="time"></slot>
          <slot name="live-indicator"></slot>
        </div>
        <div class="tsvp-controls-spacer"></div>
        <div class="tsvp-controls-right">
          <slot name="captions-button"></slot>
          <slot name="settings-button"></slot>
          <slot name="pip-button"></slot>
          <slot name="airplay-button"></slot>
          <slot name="cast-button"></slot>
          <slot name="fullscreen-button"></slot>
        </div>
      </div>
    </div>
  `,
}

// =============================================================================
// Minimal Layout
// =============================================================================

export const minimalLayout: LayoutConfig = {
  name: 'minimal',
  description: 'Clean, minimal layout with essential controls only',
  styles: `
    .tsvp-layout-minimal {
      --tsvp-controls-height: 36px;
      --tsvp-slider-track-height: 2px;
      --tsvp-slider-thumb-size: 10px;
    }

    .tsvp-layout-minimal .tsvp-controls {
      display: flex;
      align-items: center;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: var(--tsvp-controls-height);
      background: linear-gradient(transparent, rgba(0,0,0,0.5));
      padding: 0 var(--tsvp-spacing-sm);
      opacity: 0;
      transition: opacity var(--tsvp-transition-normal);
    }

    .tsvp-layout-minimal:hover .tsvp-controls {
      opacity: 1;
    }

    .tsvp-layout-minimal .tsvp-progress {
      flex: 1;
      margin: 0 var(--tsvp-spacing-sm);
    }
  `,
  template: `
    <div class="tsvp-video-container">
      <slot name="video"></slot>
    </div>
    <div class="tsvp-controls">
      <slot name="play-button"></slot>
      <slot name="progress"></slot>
      <slot name="time"></slot>
      <slot name="fullscreen-button"></slot>
    </div>
  `,
}

// =============================================================================
// Cinema Layout
// =============================================================================

export const cinemaLayout: LayoutConfig = {
  name: 'cinema',
  description: 'Immersive cinema-style layout with center play button',
  styles: `
    .tsvp-layout-cinema {
      --tsvp-controls-height: 60px;
    }

    .tsvp-layout-cinema .tsvp-center-play {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity var(--tsvp-transition-normal), transform var(--tsvp-transition-normal);
    }

    .tsvp-layout-cinema:hover .tsvp-center-play,
    .tsvp-layout-cinema.tsvp-paused .tsvp-center-play {
      opacity: 1;
    }

    .tsvp-layout-cinema .tsvp-center-play:hover {
      transform: translate(-50%, -50%) scale(1.1);
      background: rgba(0, 0, 0, 0.8);
    }

    .tsvp-layout-cinema .tsvp-center-play svg {
      width: 40px;
      height: 40px;
      fill: white;
    }

    .tsvp-layout-cinema .tsvp-controls {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.8));
      padding: var(--tsvp-spacing-lg);
      opacity: 0;
      transform: translateY(10px);
      transition: all var(--tsvp-transition-slow);
    }

    .tsvp-layout-cinema:hover .tsvp-controls {
      opacity: 1;
      transform: translateY(0);
    }

    .tsvp-layout-cinema .tsvp-title {
      color: white;
      font-size: var(--tsvp-font-size-lg);
      font-weight: var(--tsvp-font-weight-bold);
      margin-bottom: var(--tsvp-spacing-md);
    }
  `,
  template: `
    <div class="tsvp-video-container">
      <slot name="video"></slot>
    </div>
    <div class="tsvp-poster"></div>
    <div class="tsvp-captions"></div>
    <div class="tsvp-center-play">
      <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
    </div>
    <div class="tsvp-controls">
      <div class="tsvp-title"></div>
      <div class="tsvp-controls-row">
        <slot name="progress"></slot>
      </div>
      <div class="tsvp-controls-row">
        <slot name="play-button"></slot>
        <slot name="volume"></slot>
        <slot name="time"></slot>
        <div style="flex:1"></div>
        <slot name="captions-button"></slot>
        <slot name="settings-button"></slot>
        <slot name="fullscreen-button"></slot>
      </div>
    </div>
  `,
  init: (container) => {
    const centerPlay = container.querySelector('.tsvp-center-play')
    if (centerPlay) {
      centerPlay.addEventListener('click', () => {
        container.dispatchEvent(new CustomEvent('tsvp:toggleplay'))
      })
    }
  },
}

// =============================================================================
// YouTube-style Layout
// =============================================================================

export const youtubeLayout: LayoutConfig = {
  name: 'youtube',
  description: 'YouTube-inspired layout with familiar controls',
  styles: `
    .tsvp-layout-youtube {
      --tsvp-color-primary: #ff0000;
      --tsvp-slider-track-height: 3px;
      --tsvp-slider-thumb-size: 13px;
      --tsvp-controls-height: 48px;
    }

    .tsvp-layout-youtube .tsvp-controls {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.7));
      opacity: 0;
      transition: opacity var(--tsvp-transition-normal);
    }

    .tsvp-layout-youtube:hover .tsvp-controls,
    .tsvp-layout-youtube.tsvp-paused .tsvp-controls {
      opacity: 1;
    }

    .tsvp-layout-youtube .tsvp-progress-container {
      position: relative;
      padding: 0 12px;
      margin-bottom: -4px;
    }

    .tsvp-layout-youtube .tsvp-controls-row {
      display: flex;
      align-items: center;
      height: var(--tsvp-controls-height);
      padding: 0 4px;
    }

    .tsvp-layout-youtube .tsvp-chapter-markers {
      position: absolute;
      left: 12px;
      right: 12px;
      top: 0;
      height: 100%;
      pointer-events: none;
    }

    .tsvp-layout-youtube .tsvp-end-screen {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.85);
      display: none;
      align-items: center;
      justify-content: center;
    }

    .tsvp-layout-youtube.tsvp-ended .tsvp-end-screen {
      display: flex;
    }
  `,
  template: `
    <div class="tsvp-video-container">
      <slot name="video"></slot>
    </div>
    <div class="tsvp-poster"></div>
    <div class="tsvp-captions"></div>
    <div class="tsvp-controls">
      <div class="tsvp-progress-container">
        <slot name="progress"></slot>
        <div class="tsvp-chapter-markers"></div>
        <slot name="thumbnail-preview"></slot>
      </div>
      <div class="tsvp-controls-row">
        <slot name="play-button"></slot>
        <slot name="next-button"></slot>
        <slot name="volume"></slot>
        <slot name="time"></slot>
        <div style="flex:1"></div>
        <slot name="autoplay-toggle"></slot>
        <slot name="captions-button"></slot>
        <slot name="settings-button"></slot>
        <slot name="miniplayer-button"></slot>
        <slot name="theater-button"></slot>
        <slot name="fullscreen-button"></slot>
      </div>
    </div>
    <div class="tsvp-end-screen">
      <slot name="end-screen"></slot>
    </div>
  `,
}

// =============================================================================
// Vimeo-style Layout
// =============================================================================

export const vimeoLayout: LayoutConfig = {
  name: 'vimeo',
  description: 'Vimeo-inspired clean layout',
  styles: `
    .tsvp-layout-vimeo {
      --tsvp-color-primary: #00adef;
      --tsvp-controls-height: 44px;
      --tsvp-slider-track-height: 4px;
    }

    .tsvp-layout-vimeo .tsvp-controls {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      background: linear-gradient(transparent, rgba(0,0,0,0.6));
      padding: var(--tsvp-spacing-sm);
      opacity: 0;
      transition: opacity var(--tsvp-transition-normal);
    }

    .tsvp-layout-vimeo:hover .tsvp-controls {
      opacity: 1;
    }

    .tsvp-layout-vimeo .tsvp-controls-row {
      display: flex;
      align-items: center;
      gap: var(--tsvp-spacing-sm);
    }

    .tsvp-layout-vimeo .tsvp-title-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      padding: var(--tsvp-spacing-md);
      background: linear-gradient(rgba(0,0,0,0.6), transparent);
      color: white;
      opacity: 0;
      transition: opacity var(--tsvp-transition-normal);
    }

    .tsvp-layout-vimeo:hover .tsvp-title-bar {
      opacity: 1;
    }

    .tsvp-layout-vimeo .tsvp-like-button,
    .tsvp-layout-vimeo .tsvp-share-button {
      position: absolute;
      right: var(--tsvp-spacing-md);
      background: rgba(0,0,0,0.5);
      border-radius: var(--tsvp-radius-full);
      padding: var(--tsvp-spacing-sm);
    }

    .tsvp-layout-vimeo .tsvp-like-button { top: var(--tsvp-spacing-md); }
    .tsvp-layout-vimeo .tsvp-share-button { top: calc(var(--tsvp-spacing-md) + 48px); }
  `,
  template: `
    <div class="tsvp-video-container">
      <slot name="video"></slot>
    </div>
    <div class="tsvp-poster"></div>
    <div class="tsvp-captions"></div>
    <div class="tsvp-title-bar">
      <slot name="title"></slot>
    </div>
    <div class="tsvp-controls">
      <div class="tsvp-controls-row">
        <slot name="progress"></slot>
      </div>
      <div class="tsvp-controls-row">
        <slot name="play-button"></slot>
        <slot name="volume"></slot>
        <slot name="time"></slot>
        <div style="flex:1"></div>
        <slot name="captions-button"></slot>
        <slot name="settings-button"></slot>
        <slot name="pip-button"></slot>
        <slot name="fullscreen-button"></slot>
      </div>
    </div>
  `,
}

// =============================================================================
// Audio Layout
// =============================================================================

export const audioLayout: LayoutConfig = {
  name: 'audio',
  description: 'Compact layout for audio-only playback',
  styles: `
    .tsvp-layout-audio {
      --tsvp-controls-height: 64px;
      height: var(--tsvp-controls-height);
      background: var(--tsvp-color-background);
      border-radius: var(--tsvp-radius-lg);
    }

    .tsvp-layout-audio .tsvp-controls {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 var(--tsvp-spacing-md);
      gap: var(--tsvp-spacing-md);
    }

    .tsvp-layout-audio .tsvp-artwork {
      width: 48px;
      height: 48px;
      border-radius: var(--tsvp-radius-sm);
      background: rgba(255,255,255,0.1);
      overflow: hidden;
    }

    .tsvp-layout-audio .tsvp-artwork img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .tsvp-layout-audio .tsvp-info {
      flex: 0 0 auto;
      max-width: 200px;
    }

    .tsvp-layout-audio .tsvp-track-title {
      color: var(--tsvp-color-text);
      font-weight: var(--tsvp-font-weight-bold);
      font-size: var(--tsvp-font-size);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tsvp-layout-audio .tsvp-track-artist {
      color: var(--tsvp-color-text);
      opacity: 0.7;
      font-size: var(--tsvp-font-size-sm);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tsvp-layout-audio .tsvp-progress-section {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--tsvp-spacing-sm);
    }

    .tsvp-layout-audio .tsvp-progress-bar {
      flex: 1;
    }
  `,
  template: `
    <div class="tsvp-controls">
      <div class="tsvp-artwork">
        <slot name="artwork"></slot>
      </div>
      <slot name="play-button"></slot>
      <div class="tsvp-info">
        <div class="tsvp-track-title"><slot name="title"></slot></div>
        <div class="tsvp-track-artist"><slot name="artist"></slot></div>
      </div>
      <div class="tsvp-progress-section">
        <slot name="current-time"></slot>
        <div class="tsvp-progress-bar">
          <slot name="progress"></slot>
        </div>
        <slot name="duration"></slot>
      </div>
      <slot name="volume"></slot>
    </div>
  `,
}

// =============================================================================
// Layout Registry
// =============================================================================

export const layouts: Record<LayoutName, LayoutConfig> = {
  default: defaultLayout,
  minimal: minimalLayout,
  cinema: cinemaLayout,
  youtube: youtubeLayout,
  vimeo: vimeoLayout,
  audio: audioLayout,
}

// =============================================================================
// Layout Manager
// =============================================================================

export class LayoutManager {
  private container: HTMLElement
  private currentLayout: LayoutConfig | null = null
  private styleElement: HTMLStyleElement | null = null

  constructor(container: HTMLElement) {
    this.container = container
  }

  /**
   * Apply a layout to the container
   */
  apply(layout: LayoutName | LayoutConfig): void {
    // Get layout config
    const config = typeof layout === 'string' ? layouts[layout] : layout

    // Cleanup previous layout
    this.cleanup()

    // Apply new layout class
    this.container.classList.add(`tsvp-layout-${config.name}`)

    // Inject styles
    this.styleElement = document.createElement('style')
    this.styleElement.textContent = config.styles
    document.head.appendChild(this.styleElement)

    // Set template
    this.container.innerHTML = config.template

    // Initialize layout
    if (config.init) {
      config.init(this.container)
    }

    this.currentLayout = config
  }

  /**
   * Get current layout
   */
  getLayout(): LayoutConfig | null {
    return this.currentLayout
  }

  /**
   * Cleanup current layout
   */
  cleanup(): void {
    if (this.currentLayout) {
      // Remove layout class
      this.container.classList.remove(`tsvp-layout-${this.currentLayout.name}`)

      // Call destroy
      if (this.currentLayout.destroy) {
        this.currentLayout.destroy(this.container)
      }

      // Remove styles
      if (this.styleElement) {
        this.styleElement.remove()
        this.styleElement = null
      }

      this.currentLayout = null
    }
  }

  /**
   * Destroy layout manager
   */
  destroy(): void {
    this.cleanup()
  }
}

// =============================================================================
// Factory
// =============================================================================

export function createLayoutManager(container: HTMLElement): LayoutManager {
  return new LayoutManager(container)
}

export function getLayout(name: LayoutName): LayoutConfig {
  return layouts[name]
}

export function registerLayout(config: LayoutConfig): void {
  (layouts as any)[config.name] = config
}

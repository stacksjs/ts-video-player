/**
 * Live Streaming UI
 *
 * Components and utilities for live streaming playback.
 *
 * @module core/live
 */

import type { StateStore } from './state'

// =============================================================================
// Types
// =============================================================================

export interface LiveConfig {
  /** Threshold in seconds to consider "at live edge" (default: 10) */
  liveEdgeThreshold?: number
  /** Auto-sync to live when seeking within threshold (default: true) */
  autoSyncToLive?: boolean
  /** Show live indicator badge (default: true) */
  showLiveIndicator?: boolean
  /** Show time behind live (default: true) */
  showTimeBehind?: boolean
}

export interface LiveState {
  /** Whether the stream is live */
  isLive: boolean
  /** Whether currently at the live edge */
  isAtLiveEdge: boolean
  /** Seconds behind the live edge */
  secondsBehindLive: number
  /** Whether DVR (seeking) is available */
  isDVR: boolean
  /** The live edge time (seekable end) */
  liveEdgeTime: number
}

// =============================================================================
// Live Indicator Component
// =============================================================================

export class LiveIndicator {
  private container: HTMLElement
  private dot: HTMLElement
  private label: HTMLElement
  private timeBehind: HTMLElement
  private state: LiveState = {
    isLive: false,
    isAtLiveEdge: false,
    secondsBehindLive: 0,
    isDVR: false,
    liveEdgeTime: 0,
  }

  private config: Required<LiveConfig>

  constructor(config: LiveConfig = {}) {
    this.config = {
      liveEdgeThreshold: config.liveEdgeThreshold ?? 10,
      autoSyncToLive: config.autoSyncToLive ?? true,
      showLiveIndicator: config.showLiveIndicator ?? true,
      showTimeBehind: config.showTimeBehind ?? true,
    }

    // Create container
    this.container = document.createElement('div')
    this.container.className = 'tsvp-live-indicator'
    this.container.setAttribute('role', 'status')
    this.container.setAttribute('aria-live', 'polite')

    // Create dot
    this.dot = document.createElement('span')
    this.dot.className = 'tsvp-live-dot'

    // Create label
    this.label = document.createElement('span')
    this.label.className = 'tsvp-live-label'
    this.label.textContent = 'LIVE'

    // Create time behind indicator
    this.timeBehind = document.createElement('span')
    this.timeBehind.className = 'tsvp-live-time-behind'
    this.timeBehind.style.display = 'none'

    this.container.appendChild(this.dot)
    this.container.appendChild(this.label)
    this.container.appendChild(this.timeBehind)

    this.applyStyles()
    this.hide()
  }

  /**
   * Apply default styles
   */
  private applyStyles(): void {
    this.container.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: var(--tsvp-radius-full, 9999px);
      background: var(--tsvp-live-badge-bg, #ff0000);
      color: var(--tsvp-live-badge-text, #ffffff);
      font-size: var(--tsvp-font-size-sm, 12px);
      font-weight: var(--tsvp-font-weight-bold, 600);
      font-family: var(--tsvp-font-family, sans-serif);
      cursor: pointer;
      transition: all var(--tsvp-transition-normal, 200ms) var(--tsvp-transition-easing, ease);
      user-select: none;
    `

    this.dot.style.cssText = `
      width: var(--tsvp-live-indicator-size, 8px);
      height: var(--tsvp-live-indicator-size, 8px);
      border-radius: 50%;
      background: currentColor;
      animation: tsvp-live-pulse 1.5s ease-in-out infinite;
    `

    this.label.style.cssText = `
      text-transform: uppercase;
      letter-spacing: 0.5px;
    `

    this.timeBehind.style.cssText = `
      opacity: 0.8;
      font-weight: normal;
    `

    // Add pulse animation
    if (!document.querySelector('#tsvp-live-styles')) {
      const style = document.createElement('style')
      style.id = 'tsvp-live-styles'
      style.textContent = `
        @keyframes tsvp-live-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .tsvp-live-indicator.tsvp-live-behind {
          background: rgba(255, 255, 255, 0.2) !important;
        }

        .tsvp-live-indicator.tsvp-live-behind .tsvp-live-dot {
          animation: none;
          opacity: 0.5;
        }

        .tsvp-live-indicator:hover {
          transform: scale(1.05);
        }

        .tsvp-live-indicator:active {
          transform: scale(0.95);
        }
      `
      document.head.appendChild(style)
    }
  }

  /**
   * Get the element
   */
  getElement(): HTMLElement {
    return this.container
  }

  /**
   * Update live state
   */
  update(state: Partial<LiveState>): void {
    this.state = { ...this.state, ...state }

    if (!this.state.isLive) {
      this.hide()
      return
    }

    this.show()

    // Update live edge status
    const isAtEdge = this.state.secondsBehindLive <= this.config.liveEdgeThreshold
    this.state.isAtLiveEdge = isAtEdge

    if (isAtEdge) {
      this.container.classList.remove('tsvp-live-behind')
      this.label.textContent = 'LIVE'
      this.timeBehind.style.display = 'none'
      this.container.setAttribute('aria-label', 'Live - At live edge')
    }
    else {
      this.container.classList.add('tsvp-live-behind')

      if (this.config.showTimeBehind && this.state.secondsBehindLive > 0) {
        this.timeBehind.textContent = `-${Math.floor(this.state.secondsBehindLive)}s`
        this.timeBehind.style.display = 'inline'
      }

      this.container.setAttribute('aria-label', `Live - ${Math.floor(this.state.secondsBehindLive)} seconds behind`)
    }
  }

  /**
   * Show indicator
   */
  show(): void {
    if (this.config.showLiveIndicator) {
      this.container.style.display = 'inline-flex'
    }
  }

  /**
   * Hide indicator
   */
  hide(): void {
    this.container.style.display = 'none'
  }

  /**
   * Set click handler (for seeking to live)
   */
  onClick(handler: () => void): void {
    this.container.addEventListener('click', handler)
  }

  /**
   * Get current state
   */
  getState(): LiveState {
    return { ...this.state }
  }

  /**
   * Destroy component
   */
  destroy(): void {
    this.container.remove()
  }
}

// =============================================================================
// Seek to Live Button
// =============================================================================

export class SeekToLiveButton {
  private button: HTMLButtonElement
  private icon: HTMLSpanElement
  private label: HTMLSpanElement
  private visible = false

  constructor() {
    this.button = document.createElement('button')
    this.button.className = 'tsvp-seek-live-button'
    this.button.type = 'button'
    this.button.setAttribute('aria-label', 'Seek to live')

    this.icon = document.createElement('span')
    this.icon.className = 'tsvp-seek-live-icon'
    this.icon.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M8 5v14l11-7z"/>
      </svg>
    `

    this.label = document.createElement('span')
    this.label.className = 'tsvp-seek-live-label'
    this.label.textContent = 'Go Live'

    this.button.appendChild(this.icon)
    this.button.appendChild(this.label)

    this.applyStyles()
    this.hide()
  }

  private applyStyles(): void {
    this.button.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border: none;
      border-radius: var(--tsvp-radius-full, 9999px);
      background: var(--tsvp-live-badge-bg, #ff0000);
      color: var(--tsvp-live-badge-text, #ffffff);
      font-size: var(--tsvp-font-size-sm, 12px);
      font-weight: var(--tsvp-font-weight-bold, 600);
      font-family: var(--tsvp-font-family, sans-serif);
      cursor: pointer;
      transition: all var(--tsvp-transition-normal, 200ms) var(--tsvp-transition-easing, ease);
    `

    this.icon.style.cssText = `
      display: flex;
      align-items: center;
    `
  }

  getElement(): HTMLButtonElement {
    return this.button
  }

  show(): void {
    this.visible = true
    this.button.style.display = 'inline-flex'
  }

  hide(): void {
    this.visible = false
    this.button.style.display = 'none'
  }

  isVisible(): boolean {
    return this.visible
  }

  onClick(handler: () => void): void {
    this.button.addEventListener('click', handler)
  }

  destroy(): void {
    this.button.remove()
  }
}

// =============================================================================
// Live Controller
// =============================================================================

export class LiveController {
  private indicator: LiveIndicator
  private seekToLiveButton: SeekToLiveButton
  private store: StateStore
  private config: Required<LiveConfig>
  private unsubscribe: (() => void) | null = null
  private onSeekToLive: (() => void) | null = null

  constructor(store: StateStore, config: LiveConfig = {}) {
    this.store = store
    this.config = {
      liveEdgeThreshold: config.liveEdgeThreshold ?? 10,
      autoSyncToLive: config.autoSyncToLive ?? true,
      showLiveIndicator: config.showLiveIndicator ?? true,
      showTimeBehind: config.showTimeBehind ?? true,
    }

    this.indicator = new LiveIndicator(this.config)
    this.seekToLiveButton = new SeekToLiveButton()

    // Subscribe to state changes
    this.unsubscribe = this.store.subscribe('*', () => {
      this.updateFromState()
    })

    // Handle indicator click
    this.indicator.onClick(() => {
      this.seekToLive()
    })

    // Handle button click
    this.seekToLiveButton.onClick(() => {
      this.seekToLive()
    })
  }

  /**
   * Update from player state
   */
  private updateFromState(): void {
    const state = this.store.getState()

    // Calculate live state
    const isLive = state.streamType === 'live' || state.streamType === 'live:dvr'
    const isDVR = state.streamType === 'live:dvr'

    // Calculate seconds behind live
    const seekableEnd = state.buffered.length > 0
      ? state.buffered[state.buffered.length - 1].end
      : state.duration
    const secondsBehindLive = Math.max(0, seekableEnd - state.currentTime)
    const isAtLiveEdge = secondsBehindLive <= this.config.liveEdgeThreshold

    this.indicator.update({
      isLive,
      isAtLiveEdge,
      secondsBehindLive,
      isDVR,
      liveEdgeTime: seekableEnd,
    })

    // Show/hide seek to live button
    if (isLive && isDVR && !isAtLiveEdge) {
      this.seekToLiveButton.show()
    }
    else {
      this.seekToLiveButton.hide()
    }
  }

  /**
   * Seek to live edge
   */
  seekToLive(): void {
    if (this.onSeekToLive) {
      this.onSeekToLive()
    }
  }

  /**
   * Set seek to live callback
   */
  setSeekToLiveHandler(handler: () => void): void {
    this.onSeekToLive = handler
  }

  /**
   * Get live indicator element
   */
  getIndicator(): HTMLElement {
    return this.indicator.getElement()
  }

  /**
   * Get seek to live button element
   */
  getSeekToLiveButton(): HTMLElement {
    return this.seekToLiveButton.getElement()
  }

  /**
   * Get current live state
   */
  getState(): LiveState {
    return this.indicator.getState()
  }

  /**
   * Check if at live edge
   */
  isAtLiveEdge(): boolean {
    return this.indicator.getState().isAtLiveEdge
  }

  /**
   * Destroy controller
   */
  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
    this.indicator.destroy()
    this.seekToLiveButton.destroy()
  }
}

// =============================================================================
// Factory
// =============================================================================

export function createLiveIndicator(config?: LiveConfig): LiveIndicator {
  return new LiveIndicator(config)
}

export function createSeekToLiveButton(): SeekToLiveButton {
  return new SeekToLiveButton()
}

export function createLiveController(store: StateStore, config?: LiveConfig): LiveController {
  return new LiveController(store, config)
}

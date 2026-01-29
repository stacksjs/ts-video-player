/**
 * Settings Menu
 *
 * Unified settings menu for quality, speed, captions, and audio.
 *
 * @module core/settings-menu
 */

import type { VideoQuality, AudioTrack, TextTrack } from '../types'

// Helper to generate quality label
function getQualityLabel(quality: VideoQuality): string {
  if (quality.height >= 2160) return '4K'
  if (quality.height >= 1440) return '1440p'
  if (quality.height >= 1080) return '1080p'
  if (quality.height >= 720) return '720p'
  if (quality.height >= 480) return '480p'
  if (quality.height >= 360) return '360p'
  return `${quality.height}p`
}

// =============================================================================
// Types
// =============================================================================

export interface SettingsMenuConfig {
  /** Show quality options */
  quality?: boolean
  /** Show playback speed options */
  speed?: boolean
  /** Show captions options */
  captions?: boolean
  /** Show audio track options */
  audioTracks?: boolean
  /** Show audio boost options */
  audioBoost?: boolean
  /** Custom speed values */
  speedValues?: number[]
  /** Custom boost values */
  boostValues?: number[]
}

export interface SettingsMenuState {
  qualities: VideoQuality[]
  currentQuality: VideoQuality | null
  isAutoQuality: boolean
  speeds: number[]
  currentSpeed: number
  textTracks: TextTrack[]
  currentTextTrack: TextTrack | null
  audioTracks: AudioTrack[]
  currentAudioTrack: AudioTrack | null
  audioBoost: number
}

type MenuView = 'main' | 'quality' | 'speed' | 'captions' | 'audio' | 'boost'

// =============================================================================
// Settings Menu Component
// =============================================================================

export class SettingsMenu {
  private container: HTMLElement
  private config: Required<SettingsMenuConfig>
  private state: SettingsMenuState
  private currentView: MenuView = 'main'
  private visible = false

  // Event handlers
  private onQualityChange: ((quality: VideoQuality | 'auto') => void) | null = null
  private onSpeedChange: ((speed: number) => void) | null = null
  private onTextTrackChange: ((track: TextTrack | null) => void) | null = null
  private onAudioTrackChange: ((track: AudioTrack) => void) | null = null
  private onBoostChange: ((boost: number) => void) | null = null

  constructor(config: SettingsMenuConfig = {}) {
    this.config = {
      quality: config.quality ?? true,
      speed: config.speed ?? true,
      captions: config.captions ?? true,
      audioTracks: config.audioTracks ?? true,
      audioBoost: config.audioBoost ?? true,
      speedValues: config.speedValues || [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      boostValues: config.boostValues || [1, 1.25, 1.5, 1.75, 2, 2.5, 3],
    }

    this.state = {
      qualities: [],
      currentQuality: null,
      isAutoQuality: true,
      speeds: this.config.speedValues,
      currentSpeed: 1,
      textTracks: [],
      currentTextTrack: null,
      audioTracks: [],
      currentAudioTrack: null,
      audioBoost: 1,
    }

    this.container = document.createElement('div')
    this.container.className = 'tsvp-settings-menu'
    this.container.setAttribute('role', 'menu')

    this.applyStyles()
    this.hide()
  }

  private applyStyles(): void {
    this.container.style.cssText = `
      position: absolute;
      bottom: 100%;
      right: 0;
      margin-bottom: 8px;
      min-width: 200px;
      max-height: 300px;
      overflow-y: auto;
      background: var(--tsvp-menu-bg, rgba(20, 20, 20, 0.95));
      border-radius: var(--tsvp-menu-radius, 8px);
      box-shadow: var(--tsvp-menu-shadow, 0 4px 20px rgba(0, 0, 0, 0.5));
      font-family: var(--tsvp-font-family, sans-serif);
      font-size: var(--tsvp-font-size, 14px);
      color: var(--tsvp-color-text, #ffffff);
      z-index: 100;
    `
  }

  /**
   * Update state
   */
  updateState(state: Partial<SettingsMenuState>): void {
    Object.assign(this.state, state)
    if (this.visible) {
      this.render()
    }
  }

  /**
   * Render menu
   */
  private render(): void {
    this.container.innerHTML = ''

    switch (this.currentView) {
      case 'main':
        this.renderMainMenu()
        break
      case 'quality':
        this.renderQualityMenu()
        break
      case 'speed':
        this.renderSpeedMenu()
        break
      case 'captions':
        this.renderCaptionsMenu()
        break
      case 'audio':
        this.renderAudioMenu()
        break
      case 'boost':
        this.renderBoostMenu()
        break
    }
  }

  /**
   * Render main menu
   */
  private renderMainMenu(): void {
    // Quality
    if (this.config.quality && this.state.qualities.length > 0) {
      let currentLabel = 'Auto'
      if (this.state.isAutoQuality) {
        currentLabel = this.state.currentQuality
          ? `Auto (${getQualityLabel(this.state.currentQuality)})`
          : 'Auto'
      }
      else if (this.state.currentQuality) {
        currentLabel = getQualityLabel(this.state.currentQuality)
      }

      this.addMenuItem('Quality', currentLabel, () => {
        this.currentView = 'quality'
        this.render()
      })
    }

    // Speed
    if (this.config.speed) {
      const speedLabel = this.state.currentSpeed === 1 ? 'Normal' : `${this.state.currentSpeed}x`
      this.addMenuItem('Speed', speedLabel, () => {
        this.currentView = 'speed'
        this.render()
      })
    }

    // Captions
    if (this.config.captions && this.state.textTracks.length > 0) {
      const captionLabel = this.state.currentTextTrack?.label || 'Off'
      this.addMenuItem('Captions', captionLabel, () => {
        this.currentView = 'captions'
        this.render()
      })
    }

    // Audio tracks
    if (this.config.audioTracks && this.state.audioTracks.length > 1) {
      const audioLabel = this.state.currentAudioTrack?.label || 'Default'
      this.addMenuItem('Audio', audioLabel, () => {
        this.currentView = 'audio'
        this.render()
      })
    }

    // Audio boost
    if (this.config.audioBoost) {
      const boostLabel = this.state.audioBoost === 1 ? 'Off' : `${Math.round(this.state.audioBoost * 100)}%`
      this.addMenuItem('Audio Boost', boostLabel, () => {
        this.currentView = 'boost'
        this.render()
      })
    }
  }

  /**
   * Render quality submenu
   */
  private renderQualityMenu(): void {
    this.addBackButton('Quality')

    // Auto option
    const autoLabel = this.state.isAutoQuality && this.state.currentQuality
      ? `Auto (${getQualityLabel(this.state.currentQuality)})`
      : 'Auto'

    this.addRadioItem(
      autoLabel,
      this.state.isAutoQuality,
      () => {
        if (this.onQualityChange) {
          this.onQualityChange('auto')
        }
        this.goBack()
      }
    )

    // Quality options
    for (const quality of this.state.qualities) {
      const isSelected = !this.state.isAutoQuality
        && this.state.currentQuality !== null
        && this.state.currentQuality.id === quality.id

      this.addRadioItem(
        getQualityLabel(quality),
        isSelected,
        () => {
          if (this.onQualityChange) {
            this.onQualityChange(quality)
          }
          this.goBack()
        }
      )
    }
  }

  /**
   * Render speed submenu
   */
  private renderSpeedMenu(): void {
    this.addBackButton('Speed')

    for (const speed of this.state.speeds) {
      const label = speed === 1 ? 'Normal' : `${speed}x`
      this.addRadioItem(
        label,
        this.state.currentSpeed === speed,
        () => {
          if (this.onSpeedChange) {
            this.onSpeedChange(speed)
          }
          this.goBack()
        }
      )
    }
  }

  /**
   * Render captions submenu
   */
  private renderCaptionsMenu(): void {
    this.addBackButton('Captions')

    // Off option
    this.addRadioItem(
      'Off',
      this.state.currentTextTrack === null,
      () => {
        if (this.onTextTrackChange) {
          this.onTextTrackChange(null)
        }
        this.goBack()
      }
    )

    // Track options
    for (const track of this.state.textTracks) {
      this.addRadioItem(
        track.label || track.language || 'Unknown',
        this.state.currentTextTrack?.id === track.id,
        () => {
          if (this.onTextTrackChange) {
            this.onTextTrackChange(track)
          }
          this.goBack()
        }
      )
    }
  }

  /**
   * Render audio submenu
   */
  private renderAudioMenu(): void {
    this.addBackButton('Audio')

    for (const track of this.state.audioTracks) {
      this.addRadioItem(
        track.label || track.language || 'Unknown',
        this.state.currentAudioTrack?.id === track.id,
        () => {
          if (this.onAudioTrackChange) {
            this.onAudioTrackChange(track)
          }
          this.goBack()
        }
      )
    }
  }

  /**
   * Render audio boost submenu
   */
  private renderBoostMenu(): void {
    this.addBackButton('Audio Boost')

    for (const boost of this.config.boostValues) {
      const label = boost === 1 ? 'Off' : `${Math.round(boost * 100)}%`
      this.addRadioItem(
        label,
        this.state.audioBoost === boost,
        () => {
          if (this.onBoostChange) {
            this.onBoostChange(boost)
          }
          this.goBack()
        }
      )
    }
  }

  /**
   * Add menu item with value
   */
  private addMenuItem(label: string, value: string, onClick: () => void): void {
    const item = document.createElement('button')
    item.type = 'button'
    item.className = 'tsvp-settings-item'
    item.setAttribute('role', 'menuitem')

    item.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 10px 16px;
      border: none;
      background: transparent;
      color: inherit;
      font-size: inherit;
      font-family: inherit;
      text-align: left;
      cursor: pointer;
      transition: background var(--tsvp-transition-fast, 100ms);
    `

    const labelSpan = document.createElement('span')
    labelSpan.textContent = label

    const valueSpan = document.createElement('span')
    valueSpan.textContent = value
    valueSpan.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
      opacity: 0.7;
    `

    // Arrow icon
    const arrow = document.createElement('span')
    arrow.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
      </svg>
    `
    valueSpan.appendChild(arrow)

    item.appendChild(labelSpan)
    item.appendChild(valueSpan)

    item.addEventListener('mouseenter', () => {
      item.style.background = 'var(--tsvp-menu-item-hover-bg, rgba(255, 255, 255, 0.1))'
    })
    item.addEventListener('mouseleave', () => {
      item.style.background = 'transparent'
    })
    item.addEventListener('click', onClick)

    this.container.appendChild(item)
  }

  /**
   * Add radio item
   */
  private addRadioItem(label: string, selected: boolean, onClick: () => void): void {
    const item = document.createElement('button')
    item.type = 'button'
    item.className = 'tsvp-settings-radio'
    item.setAttribute('role', 'menuitemradio')
    item.setAttribute('aria-checked', String(selected))

    item.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 10px 16px;
      border: none;
      background: ${selected ? 'var(--tsvp-menu-item-active-bg, rgba(0, 168, 255, 0.2))' : 'transparent'};
      color: inherit;
      font-size: inherit;
      font-family: inherit;
      text-align: left;
      cursor: pointer;
      transition: background var(--tsvp-transition-fast, 100ms);
    `

    // Check icon
    const check = document.createElement('span')
    check.style.cssText = `
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    `
    check.innerHTML = selected
      ? `<svg viewBox="0 0 24 24" width="16" height="16" fill="var(--tsvp-color-primary, #00a8ff)">
           <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
         </svg>`
      : ''

    const labelSpan = document.createElement('span')
    labelSpan.textContent = label

    item.appendChild(check)
    item.appendChild(labelSpan)

    item.addEventListener('mouseenter', () => {
      if (!selected) {
        item.style.background = 'var(--tsvp-menu-item-hover-bg, rgba(255, 255, 255, 0.1))'
      }
    })
    item.addEventListener('mouseleave', () => {
      item.style.background = selected
        ? 'var(--tsvp-menu-item-active-bg, rgba(0, 168, 255, 0.2))'
        : 'transparent'
    })
    item.addEventListener('click', onClick)

    this.container.appendChild(item)
  }

  /**
   * Add back button
   */
  private addBackButton(title: string): void {
    const header = document.createElement('button')
    header.type = 'button'
    header.className = 'tsvp-settings-back'

    header.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 10px 16px;
      border: none;
      border-bottom: 1px solid var(--tsvp-color-border, rgba(255, 255, 255, 0.1));
      background: transparent;
      color: inherit;
      font-size: inherit;
      font-weight: var(--tsvp-font-weight-bold, 600);
      font-family: inherit;
      text-align: left;
      cursor: pointer;
    `

    const arrow = document.createElement('span')
    arrow.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
      </svg>
    `

    const titleSpan = document.createElement('span')
    titleSpan.textContent = title

    header.appendChild(arrow)
    header.appendChild(titleSpan)

    header.addEventListener('click', () => this.goBack())

    this.container.appendChild(header)
  }

  /**
   * Go back to main menu
   */
  private goBack(): void {
    this.currentView = 'main'
    this.render()
  }

  /**
   * Show menu
   */
  show(): void {
    this.visible = true
    this.currentView = 'main'
    this.render()
    this.container.style.display = 'block'

    // Fade in
    this.container.style.opacity = '0'
    this.container.style.transform = 'translateY(8px)'
    requestAnimationFrame(() => {
      this.container.style.transition = 'opacity 150ms ease, transform 150ms ease'
      this.container.style.opacity = '1'
      this.container.style.transform = 'translateY(0)'
    })
  }

  /**
   * Hide menu
   */
  hide(): void {
    this.visible = false
    this.container.style.opacity = '0'
    this.container.style.transform = 'translateY(8px)'

    setTimeout(() => {
      if (!this.visible) {
        this.container.style.display = 'none'
      }
    }, 150)
  }

  /**
   * Toggle menu
   */
  toggle(): void {
    if (this.visible) {
      this.hide()
    }
    else {
      this.show()
    }
  }

  /**
   * Check if visible
   */
  isVisible(): boolean {
    return this.visible
  }

  /**
   * Set event handlers
   */
  onQuality(handler: (quality: VideoQuality | 'auto') => void): void {
    this.onQualityChange = handler
  }

  onSpeed(handler: (speed: number) => void): void {
    this.onSpeedChange = handler
  }

  onTextTrack(handler: (track: TextTrack | null) => void): void {
    this.onTextTrackChange = handler
  }

  onAudioTrack(handler: (track: AudioTrack) => void): void {
    this.onAudioTrackChange = handler
  }

  onBoost(handler: (boost: number) => void): void {
    this.onBoostChange = handler
  }

  /**
   * Get element
   */
  getElement(): HTMLElement {
    return this.container
  }

  /**
   * Destroy
   */
  destroy(): void {
    this.container.remove()
  }
}

// =============================================================================
// Factory
// =============================================================================

export function createSettingsMenu(config?: SettingsMenuConfig): SettingsMenu {
  return new SettingsMenu(config)
}

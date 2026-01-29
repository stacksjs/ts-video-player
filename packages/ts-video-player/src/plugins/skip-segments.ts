/**
 * Skip Segments Plugin
 *
 * Skip intro, outro, recap, and other segments.
 *
 * @module plugins/skip-segments
 */

import type { Player } from '../player'

// =============================================================================
// Types
// =============================================================================

export type SegmentType = 'intro' | 'outro' | 'recap' | 'preview' | 'credits' | 'sponsor' | 'custom'

export interface SkipSegment {
  /** Segment type */
  type: SegmentType
  /** Start time in seconds */
  startTime: number
  /** End time in seconds */
  endTime: number
  /** Skip to time (defaults to endTime) */
  skipTo?: number
  /** Button text */
  buttonText?: string
  /** Auto-skip after delay (0 = no auto-skip) */
  autoSkipDelay?: number
  /** Show countdown */
  showCountdown?: boolean
  /** Custom data */
  data?: Record<string, unknown>
}

export interface SkipSegmentsConfig {
  /** Skip segments */
  segments: SkipSegment[]
  /** Default button visibility duration (ms) */
  buttonVisibleDuration?: number
  /** Default auto-skip delay (seconds) */
  defaultAutoSkipDelay?: number
  /** Position of skip button */
  buttonPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  /** Show progress bar markers */
  showMarkers?: boolean
  /** Marker color */
  markerColor?: string
  /** Enable keyboard shortcut (Enter to skip) */
  keyboardShortcut?: boolean
}

export interface SkipSegmentsState {
  /** Current active segment */
  activeSegment: SkipSegment | null
  /** Is button visible */
  buttonVisible: boolean
  /** Auto-skip countdown */
  countdown: number
  /** Is auto-skipping */
  isAutoSkipping: boolean
}

// =============================================================================
// Default Text Labels
// =============================================================================

const defaultButtonText: Record<SegmentType, string> = {
  intro: 'Skip Intro',
  outro: 'Skip Outro',
  recap: 'Skip Recap',
  preview: 'Skip Preview',
  credits: 'Skip Credits',
  sponsor: 'Skip',
  custom: 'Skip',
}

// =============================================================================
// Skip Segments Manager
// =============================================================================

export class SkipSegmentsManager {
  private player: Player | null = null
  private config: Required<SkipSegmentsConfig>
  private state: SkipSegmentsState
  private container: HTMLElement | null = null
  private button: HTMLButtonElement | null = null
  private markersContainer: HTMLElement | null = null
  private countdownTimer: ReturnType<typeof setInterval> | null = null
  private hideTimer: ReturnType<typeof setTimeout> | null = null
  private unsubscribers: Array<() => void> = []

  // Event handlers
  private onSkip: ((segment: SkipSegment) => void) | null = null
  private onSegmentEnter: ((segment: SkipSegment) => void) | null = null
  private onSegmentExit: ((segment: SkipSegment) => void) | null = null

  constructor(config: SkipSegmentsConfig) {
    this.config = {
      segments: config.segments || [],
      buttonVisibleDuration: config.buttonVisibleDuration ?? 10000,
      defaultAutoSkipDelay: config.defaultAutoSkipDelay ?? 0,
      buttonPosition: config.buttonPosition || 'bottom-right',
      showMarkers: config.showMarkers ?? true,
      markerColor: config.markerColor || 'rgba(255, 255, 0, 0.8)',
      keyboardShortcut: config.keyboardShortcut ?? true,
    }

    this.state = {
      activeSegment: null,
      buttonVisible: false,
      countdown: 0,
      isAutoSkipping: false,
    }
  }

  /**
   * Attach to player
   */
  attach(player: Player, container: HTMLElement): void {
    this.player = player
    this.container = container

    this.createButton()
    this.attachEventListeners()

    if (this.config.showMarkers) {
      this.createMarkers()
    }
  }

  /**
   * Create skip button
   */
  private createButton(): void {
    if (!this.container) return

    this.button = document.createElement('button')
    this.button.className = 'tsvp-skip-button'
    this.button.type = 'button'

    const positionStyles = this.getPositionStyles()

    this.button.style.cssText = `
      position: absolute;
      ${positionStyles}
      padding: 12px 24px;
      background: rgba(0, 0, 0, 0.85);
      color: #fff;
      border: 2px solid rgba(255, 255, 255, 0.8);
      border-radius: 4px;
      font-size: 16px;
      font-weight: 600;
      font-family: var(--tsvp-font-family, sans-serif);
      cursor: pointer;
      z-index: 30;
      display: none;
      transition: transform 150ms ease, background 150ms ease;
    `

    this.button.addEventListener('mouseenter', () => {
      this.button!.style.background = 'rgba(255, 255, 255, 0.2)'
      this.button!.style.transform = 'scale(1.05)'
    })

    this.button.addEventListener('mouseleave', () => {
      this.button!.style.background = 'rgba(0, 0, 0, 0.85)'
      this.button!.style.transform = 'scale(1)'
    })

    this.button.addEventListener('click', () => this.skip())

    this.container.appendChild(this.button)
  }

  /**
   * Get position styles for button
   */
  private getPositionStyles(): string {
    switch (this.config.buttonPosition) {
      case 'top-left':
        return 'top: 20px; left: 20px;'
      case 'top-right':
        return 'top: 20px; right: 20px;'
      case 'bottom-left':
        return 'bottom: 80px; left: 20px;'
      case 'bottom-right':
      default:
        return 'bottom: 80px; right: 20px;'
    }
  }

  /**
   * Create progress bar markers
   */
  private createMarkers(): void {
    // Markers will be created when attached to progress bar
  }

  /**
   * Get markers element for progress bar
   */
  getMarkersElement(duration: number): HTMLElement {
    this.markersContainer = document.createElement('div')
    this.markersContainer.className = 'tsvp-skip-markers'
    this.markersContainer.style.cssText = `
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      pointer-events: none;
    `

    for (const segment of this.config.segments) {
      const marker = document.createElement('div')
      marker.className = 'tsvp-skip-marker'

      const startPercent = (segment.startTime / duration) * 100
      const widthPercent = ((segment.endTime - segment.startTime) / duration) * 100

      marker.style.cssText = `
        position: absolute;
        left: ${startPercent}%;
        width: ${widthPercent}%;
        top: 0;
        bottom: 0;
        background: ${this.config.markerColor};
        opacity: 0.6;
      `

      this.markersContainer.appendChild(marker)
    }

    return this.markersContainer
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    if (!this.player) return

    // Time update to check for segments
    const handleTimeUpdate = () => {
      const state = this.player?.state
      if (!state) return

      this.checkSegments(state.currentTime)
    }

    this.player.on('timeupdate', handleTimeUpdate)
    this.unsubscribers.push(() => this.player?.off('timeupdate', handleTimeUpdate))

    // Keyboard shortcut
    if (this.config.keyboardShortcut) {
      const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && this.state.activeSegment && this.state.buttonVisible) {
          e.preventDefault()
          this.skip()
        }
      }

      document.addEventListener('keydown', handleKeydown)
      this.unsubscribers.push(() => document.removeEventListener('keydown', handleKeydown))
    }
  }

  /**
   * Check if current time is in any segment
   */
  private checkSegments(currentTime: number): void {
    const previousSegment = this.state.activeSegment

    // Find active segment
    let activeSegment: SkipSegment | null = null
    for (const segment of this.config.segments) {
      if (currentTime >= segment.startTime && currentTime < segment.endTime) {
        activeSegment = segment
        break
      }
    }

    // Segment changed
    if (activeSegment !== previousSegment) {
      if (previousSegment) {
        this.onSegmentExit?.(previousSegment)
        this.hideButton()
      }

      if (activeSegment) {
        this.state.activeSegment = activeSegment
        this.onSegmentEnter?.(activeSegment)
        this.showButton(activeSegment)
      }
      else {
        this.state.activeSegment = null
      }
    }
  }

  /**
   * Show skip button
   */
  private showButton(segment: SkipSegment): void {
    if (!this.button) return

    // Set button text
    const text = segment.buttonText || defaultButtonText[segment.type]
    this.button.textContent = text

    this.state.buttonVisible = true
    this.button.style.display = 'block'

    // Animate in
    this.button.style.opacity = '0'
    this.button.style.transform = 'translateX(20px)'
    requestAnimationFrame(() => {
      this.button!.style.transition = 'opacity 200ms ease, transform 200ms ease'
      this.button!.style.opacity = '1'
      this.button!.style.transform = 'translateX(0)'
    })

    // Start auto-skip countdown
    const autoSkipDelay = segment.autoSkipDelay ?? this.config.defaultAutoSkipDelay
    if (autoSkipDelay > 0) {
      this.startAutoSkip(autoSkipDelay, segment)
    }

    // Auto-hide after duration
    if (this.config.buttonVisibleDuration > 0 && !autoSkipDelay) {
      this.hideTimer = setTimeout(() => {
        this.hideButton()
      }, this.config.buttonVisibleDuration)
    }
  }

  /**
   * Hide skip button
   */
  private hideButton(): void {
    if (!this.button) return

    this.state.buttonVisible = false
    this.state.isAutoSkipping = false
    this.state.countdown = 0

    // Clear timers
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
      this.countdownTimer = null
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }

    // Animate out
    this.button.style.opacity = '0'
    this.button.style.transform = 'translateX(20px)'

    setTimeout(() => {
      if (this.button && !this.state.buttonVisible) {
        this.button.style.display = 'none'
      }
    }, 200)
  }

  /**
   * Start auto-skip countdown
   */
  private startAutoSkip(delay: number, segment: SkipSegment): void {
    this.state.isAutoSkipping = true
    this.state.countdown = delay

    this.updateButtonText(segment)

    this.countdownTimer = setInterval(() => {
      this.state.countdown--
      this.updateButtonText(segment)

      if (this.state.countdown <= 0) {
        if (this.countdownTimer) {
          clearInterval(this.countdownTimer)
          this.countdownTimer = null
        }
        this.skip()
      }
    }, 1000)
  }

  /**
   * Update button text with countdown
   */
  private updateButtonText(segment: SkipSegment): void {
    if (!this.button) return

    const baseText = segment.buttonText || defaultButtonText[segment.type]

    if (this.state.isAutoSkipping && this.state.countdown > 0 && segment.showCountdown !== false) {
      this.button.textContent = `${baseText} (${this.state.countdown})`
    }
    else {
      this.button.textContent = baseText
    }
  }

  /**
   * Skip current segment
   */
  skip(): void {
    if (!this.state.activeSegment || !this.player) return

    const segment = this.state.activeSegment
    const skipTo = segment.skipTo ?? segment.endTime

    this.player.seekTo(skipTo)
    this.onSkip?.(segment)
    this.hideButton()
  }

  /**
   * Add segment
   */
  addSegment(segment: SkipSegment): void {
    this.config.segments.push(segment)
  }

  /**
   * Remove segment
   */
  removeSegment(type: SegmentType): void {
    this.config.segments = this.config.segments.filter(s => s.type !== type)
  }

  /**
   * Clear all segments
   */
  clearSegments(): void {
    this.config.segments = []
    this.hideButton()
  }

  /**
   * Set segments
   */
  setSegments(segments: SkipSegment[]): void {
    this.config.segments = segments
  }

  /**
   * Get segments
   */
  getSegments(): SkipSegment[] {
    return [...this.config.segments]
  }

  /**
   * Get current state
   */
  getState(): SkipSegmentsState {
    return { ...this.state }
  }

  /**
   * Set event handlers
   */
  on(event: 'skip', handler: (segment: SkipSegment) => void): void
  on(event: 'segmentEnter', handler: (segment: SkipSegment) => void): void
  on(event: 'segmentExit', handler: (segment: SkipSegment) => void): void
  on(event: string, handler: (...args: any[]) => void): void {
    switch (event) {
      case 'skip':
        this.onSkip = handler
        break
      case 'segmentEnter':
        this.onSegmentEnter = handler
        break
      case 'segmentExit':
        this.onSegmentExit = handler
        break
    }
  }

  /**
   * Destroy
   */
  destroy(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer)
    }

    this.unsubscribers.forEach(unsub => unsub())

    this.button?.remove()
    this.markersContainer?.remove()

    this.player = null
    this.container = null
  }
}

// =============================================================================
// Factory
// =============================================================================

export function createSkipSegments(config: SkipSegmentsConfig): SkipSegmentsManager {
  return new SkipSegmentsManager(config)
}

/**
 * Skip segments plugin for Player
 */
export function skipSegmentsPlugin(config: SkipSegmentsConfig) {
  return {
    name: 'skipSegments',

    install(player: Player, container: HTMLElement) {
      const skipSegments = createSkipSegments(config)
      skipSegments.attach(player, container)

      // Expose on player
      ;(player as any).skipSegments = skipSegments

      return () => {
        skipSegments.destroy()
        delete (player as any).skipSegments
      }
    },
  }
}

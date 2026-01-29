/**
 * Buffering Spinner
 *
 * Loading indicator for buffering states.
 *
 * @module core/spinner
 */

// =============================================================================
// Types
// =============================================================================

export interface SpinnerConfig {
  /** Spinner size in pixels */
  size?: number
  /** Track width */
  trackWidth?: number
  /** Track color */
  trackColor?: string
  /** Fill color */
  fillColor?: string
  /** Animation duration in ms */
  duration?: number
  /** Show/hide delay in ms */
  delay?: number
}

// =============================================================================
// Spinner Component
// =============================================================================

export class Spinner {
  private container: HTMLElement
  private svg: SVGSVGElement
  private track: SVGCircleElement
  private fill: SVGCircleElement
  private config: Required<SpinnerConfig>
  private visible = false
  private showTimeout: ReturnType<typeof setTimeout> | null = null

  constructor(config: SpinnerConfig = {}) {
    this.config = {
      size: config.size ?? 48,
      trackWidth: config.trackWidth ?? 4,
      trackColor: config.trackColor || 'rgba(255, 255, 255, 0.2)',
      fillColor: config.fillColor || 'var(--tsvp-color-primary, #00a8ff)',
      duration: config.duration ?? 1000,
      delay: config.delay ?? 200,
    }

    this.container = document.createElement('div')
    this.container.className = 'tsvp-spinner'

    // Create SVG
    const size = this.config.size
    const center = size / 2
    const radius = (size - this.config.trackWidth) / 2

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    this.svg.setAttribute('width', String(size))
    this.svg.setAttribute('height', String(size))
    this.svg.setAttribute('viewBox', `0 0 ${size} ${size}`)

    // Track circle
    this.track = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    this.track.setAttribute('cx', String(center))
    this.track.setAttribute('cy', String(center))
    this.track.setAttribute('r', String(radius))
    this.track.setAttribute('fill', 'none')
    this.track.setAttribute('stroke', this.config.trackColor)
    this.track.setAttribute('stroke-width', String(this.config.trackWidth))

    // Fill circle (animated)
    this.fill = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    this.fill.setAttribute('cx', String(center))
    this.fill.setAttribute('cy', String(center))
    this.fill.setAttribute('r', String(radius))
    this.fill.setAttribute('fill', 'none')
    this.fill.setAttribute('stroke', this.config.fillColor)
    this.fill.setAttribute('stroke-width', String(this.config.trackWidth))
    this.fill.setAttribute('stroke-linecap', 'round')

    // Calculate stroke dash for partial circle
    const circumference = 2 * Math.PI * radius
    this.fill.setAttribute('stroke-dasharray', `${circumference * 0.25} ${circumference * 0.75}`)
    this.fill.setAttribute('transform', `rotate(-90 ${center} ${center})`)

    this.svg.appendChild(this.track)
    this.svg.appendChild(this.fill)
    this.container.appendChild(this.svg)

    this.applyStyles()
    this.hide()
  }

  private applyStyles(): void {
    this.container.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 5;
      pointer-events: none;
    `

    // Add keyframe animation
    if (!document.querySelector('#tsvp-spinner-styles')) {
      const style = document.createElement('style')
      style.id = 'tsvp-spinner-styles'
      style.textContent = `
        @keyframes tsvp-spinner-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .tsvp-spinner svg {
          animation: tsvp-spinner-rotate ${this.config.duration}ms linear infinite;
        }

        .tsvp-spinner-fade-in {
          animation: tsvp-spinner-fade-in 200ms ease forwards;
        }

        .tsvp-spinner-fade-out {
          animation: tsvp-spinner-fade-out 200ms ease forwards;
        }

        @keyframes tsvp-spinner-fade-in {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        @keyframes tsvp-spinner-fade-out {
          from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
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
   * Show spinner (with optional delay)
   */
  show(immediate = false): void {
    if (this.visible) return

    if (this.showTimeout) {
      clearTimeout(this.showTimeout)
    }

    const doShow = () => {
      this.visible = true
      this.container.style.display = 'block'
      this.container.classList.remove('tsvp-spinner-fade-out')
      this.container.classList.add('tsvp-spinner-fade-in')
    }

    if (immediate || this.config.delay === 0) {
      doShow()
    }
    else {
      this.showTimeout = setTimeout(doShow, this.config.delay)
    }
  }

  /**
   * Hide spinner
   */
  hide(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout)
      this.showTimeout = null
    }

    if (!this.visible) {
      this.container.style.display = 'none'
      return
    }

    this.visible = false
    this.container.classList.remove('tsvp-spinner-fade-in')
    this.container.classList.add('tsvp-spinner-fade-out')

    // Hide after animation
    setTimeout(() => {
      if (!this.visible) {
        this.container.style.display = 'none'
      }
    }, 200)
  }

  /**
   * Check if visible
   */
  isVisible(): boolean {
    return this.visible
  }

  /**
   * Set fill percentage (0-100)
   */
  setProgress(percent: number): void {
    const size = this.config.size
    const radius = (size - this.config.trackWidth) / 2
    const circumference = 2 * Math.PI * radius
    const filled = (percent / 100) * circumference

    this.fill.setAttribute('stroke-dasharray', `${filled} ${circumference - filled}`)
  }

  /**
   * Reset to indeterminate
   */
  resetProgress(): void {
    const size = this.config.size
    const radius = (size - this.config.trackWidth) / 2
    const circumference = 2 * Math.PI * radius

    this.fill.setAttribute('stroke-dasharray', `${circumference * 0.25} ${circumference * 0.75}`)
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<SpinnerConfig>): void {
    Object.assign(this.config, config)

    if (config.size || config.trackWidth) {
      // Rebuild SVG
      const size = this.config.size
      const center = size / 2
      const radius = (size - this.config.trackWidth) / 2

      this.svg.setAttribute('width', String(size))
      this.svg.setAttribute('height', String(size))
      this.svg.setAttribute('viewBox', `0 0 ${size} ${size}`)

      this.track.setAttribute('cx', String(center))
      this.track.setAttribute('cy', String(center))
      this.track.setAttribute('r', String(radius))
      this.track.setAttribute('stroke-width', String(this.config.trackWidth))

      this.fill.setAttribute('cx', String(center))
      this.fill.setAttribute('cy', String(center))
      this.fill.setAttribute('r', String(radius))
      this.fill.setAttribute('stroke-width', String(this.config.trackWidth))
      this.fill.setAttribute('transform', `rotate(-90 ${center} ${center})`)

      this.resetProgress()
    }

    if (config.trackColor) {
      this.track.setAttribute('stroke', this.config.trackColor)
    }

    if (config.fillColor) {
      this.fill.setAttribute('stroke', this.config.fillColor)
    }
  }

  /**
   * Destroy
   */
  destroy(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout)
    }
    this.container.remove()
  }
}

// =============================================================================
// Factory
// =============================================================================

export function createSpinner(config?: SpinnerConfig): Spinner {
  return new Spinner(config)
}

// =============================================================================
// CSS Styles
// =============================================================================

export const SPINNER_STYLES = `
.tsvp-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  pointer-events: none;
}

.tsvp-spinner svg {
  animation: tsvp-spinner-rotate 1s linear infinite;
}

@keyframes tsvp-spinner-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`

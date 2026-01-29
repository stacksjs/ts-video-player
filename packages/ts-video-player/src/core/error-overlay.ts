/**
 * Error Overlay
 *
 * Visual error display with retry functionality.
 *
 * @module core/error-overlay
 */

import type { MediaError } from '../types'

// =============================================================================
// Types
// =============================================================================

export interface ErrorOverlayConfig {
  /** Show retry button */
  showRetry?: boolean
  /** Retry button text */
  retryText?: string
  /** Custom error messages by code */
  messages?: Record<number, string>
  /** Show error details (for debugging) */
  showDetails?: boolean
  /** Auto-hide delay (0 = no auto-hide) */
  autoHideDelay?: number
  /** Custom icon SVG */
  icon?: string
}

// =============================================================================
// Default Error Messages
// =============================================================================

const defaultErrorMessages: Record<number, string> = {
  1: 'The media playback was aborted.',
  2: 'A network error occurred while loading the media.',
  3: 'The media could not be decoded.',
  4: 'The media format is not supported.',
}

// =============================================================================
// Error Overlay Component
// =============================================================================

export class ErrorOverlay {
  private container: HTMLElement
  private config: Required<ErrorOverlayConfig>
  private currentError: MediaError | null = null
  private onRetry: (() => void) | null = null
  private autoHideTimeout: ReturnType<typeof setTimeout> | null = null

  constructor(config: ErrorOverlayConfig = {}) {
    this.config = {
      showRetry: config.showRetry ?? true,
      retryText: config.retryText || 'Try Again',
      messages: { ...defaultErrorMessages, ...config.messages },
      showDetails: config.showDetails ?? false,
      autoHideDelay: config.autoHideDelay ?? 0,
      icon: config.icon || this.getDefaultIcon(),
    }

    this.container = document.createElement('div')
    this.container.className = 'tsvp-error-overlay'
    this.container.setAttribute('role', 'alert')
    this.container.setAttribute('aria-live', 'assertive')

    this.applyStyles()
    this.hide()
  }

  private applyStyles(): void {
    this.container.style.cssText = `
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      background: rgba(0, 0, 0, 0.85);
      color: var(--tsvp-color-text, #ffffff);
      font-family: var(--tsvp-font-family, sans-serif);
      z-index: 20;
      padding: 24px;
      text-align: center;
    `
  }

  private getDefaultIcon(): string {
    return `
      <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
    `
  }

  /**
   * Get error message
   */
  private getMessage(error: MediaError): string {
    return this.config.messages[error.code] || error.message || 'An error occurred.'
  }

  /**
   * Render error content
   */
  private render(): void {
    if (!this.currentError) return

    this.container.innerHTML = ''

    // Icon
    const icon = document.createElement('div')
    icon.className = 'tsvp-error-icon'
    icon.innerHTML = this.config.icon
    icon.style.cssText = `
      color: var(--tsvp-color-error, #ff4757);
      opacity: 0.9;
    `
    this.container.appendChild(icon)

    // Title
    const title = document.createElement('h3')
    title.className = 'tsvp-error-title'
    title.textContent = 'Playback Error'
    title.style.cssText = `
      margin: 0;
      font-size: var(--tsvp-font-size-lg, 18px);
      font-weight: var(--tsvp-font-weight-bold, 600);
    `
    this.container.appendChild(title)

    // Message
    const message = document.createElement('p')
    message.className = 'tsvp-error-message'
    message.textContent = this.getMessage(this.currentError)
    message.style.cssText = `
      margin: 0;
      font-size: var(--tsvp-font-size, 14px);
      opacity: 0.8;
      max-width: 400px;
    `
    this.container.appendChild(message)

    // Details (optional)
    if (this.config.showDetails && this.currentError.details) {
      const details = document.createElement('pre')
      details.className = 'tsvp-error-details'
      details.textContent = typeof this.currentError.details === 'string'
        ? this.currentError.details
        : JSON.stringify(this.currentError.details, null, 2)
      details.style.cssText = `
        margin: 8px 0 0;
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: var(--tsvp-radius-sm, 4px);
        font-size: 11px;
        font-family: monospace;
        text-align: left;
        max-width: 100%;
        overflow-x: auto;
        opacity: 0.7;
      `
      this.container.appendChild(details)
    }

    // Retry button
    if (this.config.showRetry) {
      const retryBtn = document.createElement('button')
      retryBtn.className = 'tsvp-error-retry'
      retryBtn.type = 'button'
      retryBtn.textContent = this.config.retryText

      retryBtn.style.cssText = `
        margin-top: 8px;
        padding: 10px 24px;
        border: none;
        border-radius: var(--tsvp-radius-full, 9999px);
        background: var(--tsvp-color-primary, #00a8ff);
        color: var(--tsvp-color-text-on-primary, #ffffff);
        font-size: var(--tsvp-font-size, 14px);
        font-weight: var(--tsvp-font-weight-bold, 600);
        font-family: var(--tsvp-font-family, sans-serif);
        cursor: pointer;
        transition: transform 150ms ease, background 150ms ease;
      `

      retryBtn.addEventListener('mouseenter', () => {
        retryBtn.style.transform = 'scale(1.05)'
      })

      retryBtn.addEventListener('mouseleave', () => {
        retryBtn.style.transform = 'scale(1)'
      })

      retryBtn.addEventListener('click', () => {
        if (this.onRetry) {
          this.onRetry()
        }
        this.hide()
      })

      this.container.appendChild(retryBtn)
    }

    // Dismiss on background click
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.hide()
      }
    })
  }

  /**
   * Show error
   */
  show(error: MediaError): void {
    this.currentError = error
    this.render()
    this.container.style.display = 'flex'

    // Fade in
    this.container.style.opacity = '0'
    requestAnimationFrame(() => {
      this.container.style.transition = 'opacity 200ms ease'
      this.container.style.opacity = '1'
    })

    // Auto-hide if configured
    if (this.config.autoHideDelay > 0) {
      if (this.autoHideTimeout) {
        clearTimeout(this.autoHideTimeout)
      }
      this.autoHideTimeout = setTimeout(() => {
        this.hide()
      }, this.config.autoHideDelay)
    }
  }

  /**
   * Hide error overlay
   */
  hide(): void {
    if (this.autoHideTimeout) {
      clearTimeout(this.autoHideTimeout)
      this.autoHideTimeout = null
    }

    this.container.style.opacity = '0'
    setTimeout(() => {
      this.container.style.display = 'none'
      this.currentError = null
    }, 200)
  }

  /**
   * Set retry handler
   */
  setRetryHandler(handler: () => void): void {
    this.onRetry = handler
  }

  /**
   * Get element
   */
  getElement(): HTMLElement {
    return this.container
  }

  /**
   * Check if visible
   */
  isVisible(): boolean {
    return this.container.style.display !== 'none'
  }

  /**
   * Get current error
   */
  getError(): MediaError | null {
    return this.currentError
  }

  /**
   * Destroy
   */
  destroy(): void {
    if (this.autoHideTimeout) {
      clearTimeout(this.autoHideTimeout)
    }
    this.container.remove()
  }
}

// =============================================================================
// Factory
// =============================================================================

export function createErrorOverlay(config?: ErrorOverlayConfig): ErrorOverlay {
  return new ErrorOverlay(config)
}

// =============================================================================
// CSS Styles
// =============================================================================

export const ERROR_OVERLAY_STYLES = `
.tsvp-error-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: rgba(0, 0, 0, 0.85);
  color: var(--tsvp-color-text, #ffffff);
  font-family: var(--tsvp-font-family, sans-serif);
  z-index: 20;
  padding: 24px;
  text-align: center;
}

.tsvp-error-icon {
  color: var(--tsvp-color-error, #ff4757);
}

.tsvp-error-title {
  margin: 0;
  font-size: var(--tsvp-font-size-lg, 18px);
  font-weight: var(--tsvp-font-weight-bold, 600);
}

.tsvp-error-message {
  margin: 0;
  opacity: 0.8;
  max-width: 400px;
}

.tsvp-error-retry {
  padding: 10px 24px;
  border: none;
  border-radius: var(--tsvp-radius-full, 9999px);
  background: var(--tsvp-color-primary, #00a8ff);
  color: var(--tsvp-color-text-on-primary, #ffffff);
  font-weight: var(--tsvp-font-weight-bold, 600);
  cursor: pointer;
  transition: transform 150ms ease;
}

.tsvp-error-retry:hover {
  transform: scale(1.05);
}
`

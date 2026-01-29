/**
 * Tooltips System
 *
 * Tooltips for player controls with smart positioning.
 *
 * @module core/tooltips
 */

// =============================================================================
// Types
// =============================================================================

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipConfig {
  /** Tooltip placement */
  placement?: TooltipPlacement
  /** Offset from target in pixels */
  offset?: number
  /** Show delay in ms */
  showDelay?: number
  /** Hide delay in ms */
  hideDelay?: number
  /** Container for boundary detection */
  container?: HTMLElement
  /** Custom class name */
  className?: string
}

// =============================================================================
// Tooltip Component
// =============================================================================

export class Tooltip {
  private element: HTMLElement
  private target: HTMLElement | null = null
  private config: Required<TooltipConfig>
  private showTimeout: ReturnType<typeof setTimeout> | null = null
  private hideTimeout: ReturnType<typeof setTimeout> | null = null
  private visible = false

  constructor(config: TooltipConfig = {}) {
    this.config = {
      placement: config.placement || 'top',
      offset: config.offset ?? 8,
      showDelay: config.showDelay ?? 300,
      hideDelay: config.hideDelay ?? 0,
      container: config.container || document.body,
      className: config.className || '',
    }

    this.element = document.createElement('div')
    this.element.className = `tsvp-tooltip ${this.config.className}`.trim()
    this.element.setAttribute('role', 'tooltip')
    this.element.style.cssText = `
      position: absolute;
      z-index: 1000;
      padding: 6px 10px;
      background: var(--tsvp-controls-tooltip-bg, rgba(0, 0, 0, 0.9));
      color: var(--tsvp-controls-tooltip-text, #ffffff);
      font-size: var(--tsvp-font-size-sm, 12px);
      font-family: var(--tsvp-font-family, sans-serif);
      border-radius: var(--tsvp-radius-sm, 4px);
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transform: scale(0.9);
      transition: opacity 150ms ease, transform 150ms ease;
      box-shadow: var(--tsvp-shadow-md, 0 4px 6px rgba(0, 0, 0, 0.3));
    `

    this.hide()
  }

  /**
   * Attach tooltip to a target element
   */
  attach(target: HTMLElement, text: string): void {
    this.target = target
    this.element.textContent = text

    // Add to DOM if not already
    if (!this.element.parentElement) {
      this.config.container.appendChild(this.element)
    }

    // Event listeners
    target.addEventListener('mouseenter', this.handleMouseEnter)
    target.addEventListener('mouseleave', this.handleMouseLeave)
    target.addEventListener('focus', this.handleFocus)
    target.addEventListener('blur', this.handleBlur)
  }

  /**
   * Detach from target
   */
  detach(): void {
    if (this.target) {
      this.target.removeEventListener('mouseenter', this.handleMouseEnter)
      this.target.removeEventListener('mouseleave', this.handleMouseLeave)
      this.target.removeEventListener('focus', this.handleFocus)
      this.target.removeEventListener('blur', this.handleBlur)
      this.target = null
    }
    this.hide()
  }

  /**
   * Update tooltip text
   */
  setText(text: string): void {
    this.element.textContent = text
    if (this.visible) {
      this.position()
    }
  }

  /**
   * Show tooltip
   */
  show(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout)
      this.hideTimeout = null
    }

    if (this.visible) return

    this.showTimeout = setTimeout(() => {
      this.visible = true
      this.element.style.display = 'block'
      this.position()

      // Trigger animation
      requestAnimationFrame(() => {
        this.element.style.opacity = '1'
        this.element.style.transform = 'scale(1)'
      })
    }, this.config.showDelay)
  }

  /**
   * Hide tooltip
   */
  hide(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout)
      this.showTimeout = null
    }

    if (!this.visible) {
      this.element.style.display = 'none'
      return
    }

    this.hideTimeout = setTimeout(() => {
      this.visible = false
      this.element.style.opacity = '0'
      this.element.style.transform = 'scale(0.9)'

      setTimeout(() => {
        if (!this.visible) {
          this.element.style.display = 'none'
        }
      }, 150)
    }, this.config.hideDelay)
  }

  /**
   * Position tooltip relative to target
   */
  private position(): void {
    if (!this.target) return

    const targetRect = this.target.getBoundingClientRect()
    const tooltipRect = this.element.getBoundingClientRect()
    const containerRect = this.config.container.getBoundingClientRect()

    let top = 0
    let left = 0

    switch (this.config.placement) {
      case 'top':
        top = targetRect.top - tooltipRect.height - this.config.offset
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2
        break
      case 'bottom':
        top = targetRect.bottom + this.config.offset
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2
        break
      case 'left':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2
        left = targetRect.left - tooltipRect.width - this.config.offset
        break
      case 'right':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2
        left = targetRect.right + this.config.offset
        break
    }

    // Keep within container bounds
    const minLeft = containerRect.left + 4
    const maxLeft = containerRect.right - tooltipRect.width - 4
    const minTop = containerRect.top + 4
    const maxTop = containerRect.bottom - tooltipRect.height - 4

    left = Math.max(minLeft, Math.min(maxLeft, left))
    top = Math.max(minTop, Math.min(maxTop, top))

    // Adjust for scroll
    left += window.scrollX
    top += window.scrollY

    this.element.style.left = `${left}px`
    this.element.style.top = `${top}px`
  }

  private handleMouseEnter = (): void => {
    this.show()
  }

  private handleMouseLeave = (): void => {
    this.hide()
  }

  private handleFocus = (): void => {
    this.show()
  }

  private handleBlur = (): void => {
    this.hide()
  }

  /**
   * Get element
   */
  getElement(): HTMLElement {
    return this.element
  }

  /**
   * Check if visible
   */
  isVisible(): boolean {
    return this.visible
  }

  /**
   * Destroy tooltip
   */
  destroy(): void {
    this.detach()
    this.element.remove()
  }
}

// =============================================================================
// Tooltip Manager
// =============================================================================

export class TooltipManager {
  private tooltips = new Map<HTMLElement, Tooltip>()
  private config: TooltipConfig

  constructor(config: TooltipConfig = {}) {
    this.config = config
  }

  /**
   * Add tooltip to an element
   */
  add(target: HTMLElement, text: string, config?: Partial<TooltipConfig>): Tooltip {
    // Remove existing tooltip if any
    this.remove(target)

    const tooltip = new Tooltip({ ...this.config, ...config })
    tooltip.attach(target, text)
    this.tooltips.set(target, tooltip)

    return tooltip
  }

  /**
   * Update tooltip text
   */
  update(target: HTMLElement, text: string): void {
    const tooltip = this.tooltips.get(target)
    if (tooltip) {
      tooltip.setText(text)
    }
  }

  /**
   * Remove tooltip from element
   */
  remove(target: HTMLElement): void {
    const tooltip = this.tooltips.get(target)
    if (tooltip) {
      tooltip.destroy()
      this.tooltips.delete(target)
    }
  }

  /**
   * Hide all tooltips
   */
  hideAll(): void {
    this.tooltips.forEach(tooltip => tooltip.hide())
  }

  /**
   * Destroy all tooltips
   */
  destroy(): void {
    this.tooltips.forEach(tooltip => tooltip.destroy())
    this.tooltips.clear()
  }
}

// =============================================================================
// Factory
// =============================================================================

export function createTooltip(config?: TooltipConfig): Tooltip {
  return new Tooltip(config)
}

export function createTooltipManager(config?: TooltipConfig): TooltipManager {
  return new TooltipManager(config)
}

// =============================================================================
// CSS Styles
// =============================================================================

export const TOOLTIP_STYLES = `
.tsvp-tooltip {
  position: absolute;
  z-index: 1000;
  padding: 6px 10px;
  background: var(--tsvp-controls-tooltip-bg, rgba(0, 0, 0, 0.9));
  color: var(--tsvp-controls-tooltip-text, #ffffff);
  font-size: var(--tsvp-font-size-sm, 12px);
  font-family: var(--tsvp-font-family, sans-serif);
  border-radius: var(--tsvp-radius-sm, 4px);
  white-space: nowrap;
  pointer-events: none;
  box-shadow: var(--tsvp-shadow-md, 0 4px 6px rgba(0, 0, 0, 0.3));
}

.tsvp-tooltip::after {
  content: '';
  position: absolute;
  border: 6px solid transparent;
}

.tsvp-tooltip--top::after {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: var(--tsvp-controls-tooltip-bg, rgba(0, 0, 0, 0.9));
}

.tsvp-tooltip--bottom::after {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: var(--tsvp-controls-tooltip-bg, rgba(0, 0, 0, 0.9));
}
`

/**
 * Watermark Plugin
 *
 * Display watermarks on video playback.
 *
 * @module plugins/watermark
 */

import type { Player } from '../player'

// =============================================================================
// Types
// =============================================================================

export type WatermarkPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export interface WatermarkConfig {
  /** Image URL */
  image?: string
  /** Text content */
  text?: string
  /** HTML content */
  html?: string
  /** Position */
  position?: WatermarkPosition
  /** Opacity (0-1) */
  opacity?: number
  /** Size (CSS value) */
  size?: string
  /** Offset from edges */
  offset?: {
    x?: number | string
    y?: number | string
  }
  /** Link URL */
  url?: string
  /** Open link in new tab */
  newTab?: boolean
  /** Show only during playback */
  showOnlyDuringPlayback?: boolean
  /** Fade in duration (ms) */
  fadeIn?: number
  /** Fade out duration (ms) */
  fadeOut?: number
  /** Animation */
  animation?: WatermarkAnimation
  /** Custom styles */
  styles?: Partial<CSSStyleDeclaration>
  /** Rotate degrees */
  rotate?: number
}

export interface WatermarkAnimation {
  /** Animation type */
  type: 'fade' | 'slide' | 'bounce' | 'pulse' | 'none'
  /** Animation duration (ms) */
  duration?: number
  /** Animation delay (ms) */
  delay?: number
  /** Repeat animation */
  repeat?: boolean
}

export interface DynamicWatermark {
  /** User ID or session info */
  userId?: string
  /** Timestamp */
  showTimestamp?: boolean
  /** IP address (for forensic marking) */
  showIp?: boolean
  /** Custom text */
  customText?: string
  /** Update interval (ms) */
  updateInterval?: number
  /** Position randomization */
  randomizePosition?: boolean
  /** Move interval (ms) */
  moveInterval?: number
}

// =============================================================================
// Watermark Manager
// =============================================================================

export class WatermarkManager {
  private player: Player | null = null
  private container: HTMLElement | null = null
  private elements: Map<string, HTMLElement> = new Map()
  private dynamicTimers: Map<string, ReturnType<typeof setInterval>> = new Map()
  private unsubscribers: Array<() => void> = []

  constructor() {}

  /**
   * Attach to player
   */
  attach(player: Player, container: HTMLElement): void {
    this.player = player
    this.container = container
  }

  /**
   * Add a watermark
   */
  add(id: string, config: WatermarkConfig): HTMLElement {
    if (!this.container) {
      throw new Error('Watermark manager not attached to container')
    }

    // Remove existing watermark with same ID
    this.remove(id)

    const element = this.createElement(config)
    element.dataset.watermarkId = id

    this.elements.set(id, element)
    this.container.appendChild(element)

    // Handle playback visibility
    if (config.showOnlyDuringPlayback && this.player) {
      this.setupPlaybackVisibility(id, element)
    }

    // Apply animation
    if (config.animation && config.animation.type !== 'none') {
      this.applyAnimation(element, config.animation)
    }

    return element
  }

  /**
   * Create watermark element
   */
  private createElement(config: WatermarkConfig): HTMLElement {
    const wrapper = document.createElement('div')
    wrapper.className = 'tsvp-watermark'

    const positionStyles = this.getPositionStyles(config.position || 'bottom-right', config.offset)

    wrapper.style.cssText = `
      position: absolute;
      ${positionStyles}
      z-index: 25;
      pointer-events: ${config.url ? 'auto' : 'none'};
      opacity: ${config.opacity ?? 0.7};
      transition: opacity ${config.fadeIn || 300}ms ease;
      ${config.rotate ? `transform: rotate(${config.rotate}deg);` : ''}
    `

    // Apply custom styles
    if (config.styles) {
      Object.assign(wrapper.style, config.styles)
    }

    // Create content
    let content: HTMLElement

    if (config.html) {
      content = document.createElement('div')
      content.innerHTML = config.html
    }
    else if (config.image) {
      const img = document.createElement('img')
      img.src = config.image
      img.alt = 'Watermark'
      img.style.cssText = `
        display: block;
        max-width: 100%;
        height: auto;
        ${config.size ? `width: ${config.size};` : ''}
      `
      content = img
    }
    else if (config.text) {
      content = document.createElement('span')
      content.textContent = config.text
      content.style.cssText = `
        font-family: var(--tsvp-font-family, sans-serif);
        font-size: ${config.size || '14px'};
        color: rgba(255, 255, 255, 0.8);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      `
    }
    else {
      content = document.createElement('span')
    }

    // Wrap in link if URL provided
    if (config.url) {
      const link = document.createElement('a')
      link.href = config.url
      link.target = config.newTab ? '_blank' : '_self'
      link.rel = config.newTab ? 'noopener noreferrer' : ''
      link.style.textDecoration = 'none'
      link.appendChild(content)
      wrapper.appendChild(link)
    }
    else {
      wrapper.appendChild(content)
    }

    return wrapper
  }

  /**
   * Get position styles
   */
  private getPositionStyles(
    position: WatermarkPosition,
    offset?: { x?: number | string; y?: number | string }
  ): string {
    const offsetX = typeof offset?.x === 'number' ? `${offset.x}px` : (offset?.x || '16px')
    const offsetY = typeof offset?.y === 'number' ? `${offset.y}px` : (offset?.y || '16px')

    const positions: Record<WatermarkPosition, string> = {
      'top-left': `top: ${offsetY}; left: ${offsetX};`,
      'top-center': `top: ${offsetY}; left: 50%; transform: translateX(-50%);`,
      'top-right': `top: ${offsetY}; right: ${offsetX};`,
      'center-left': `top: 50%; left: ${offsetX}; transform: translateY(-50%);`,
      'center': `top: 50%; left: 50%; transform: translate(-50%, -50%);`,
      'center-right': `top: 50%; right: ${offsetX}; transform: translateY(-50%);`,
      'bottom-left': `bottom: ${offsetY}; left: ${offsetX};`,
      'bottom-center': `bottom: ${offsetY}; left: 50%; transform: translateX(-50%);`,
      'bottom-right': `bottom: ${offsetY}; right: ${offsetX};`,
    }

    return positions[position] || positions['bottom-right']
  }

  /**
   * Setup playback visibility
   */
  private setupPlaybackVisibility(_id: string, element: HTMLElement): void {
    if (!this.player) return

    element.style.opacity = '0'

    const handlePlay = () => {
      element.style.opacity = ''
    }

    const handlePause = () => {
      element.style.opacity = '0'
    }

    this.player.on('play', handlePlay)
    this.player.on('pause', handlePause)
    this.player.on('ended', handlePause)

    this.unsubscribers.push(() => {
      this.player?.off('play', handlePlay)
      this.player?.off('pause', handlePause)
      this.player?.off('ended', handlePause)
    })
  }

  /**
   * Apply animation to watermark
   */
  private applyAnimation(element: HTMLElement, animation: WatermarkAnimation): void {
    const duration = animation.duration || 1000
    const delay = animation.delay || 0
    const repeat = animation.repeat ? 'infinite' : '1'

    // Add keyframes if not exists
    if (!document.querySelector('#tsvp-watermark-animations')) {
      const style = document.createElement('style')
      style.id = 'tsvp-watermark-animations'
      style.textContent = `
        @keyframes tsvp-watermark-fade {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes tsvp-watermark-slide {
          0% { transform: translateX(-10px); }
          50% { transform: translateX(10px); }
          100% { transform: translateX(-10px); }
        }
        @keyframes tsvp-watermark-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes tsvp-watermark-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `
      document.head.appendChild(style)
    }

    const animationName = `tsvp-watermark-${animation.type}`
    element.style.animation = `${animationName} ${duration}ms ease ${delay}ms ${repeat}`
  }

  /**
   * Add dynamic watermark (forensic marking)
   */
  addDynamic(id: string, config: DynamicWatermark, baseConfig: WatermarkConfig = {}): HTMLElement {
    const getText = (): string => {
      const parts: string[] = []

      if (config.userId) {
        parts.push(config.userId)
      }

      if (config.showTimestamp) {
        parts.push(new Date().toISOString())
      }

      if (config.customText) {
        parts.push(config.customText)
      }

      return parts.join(' | ')
    }

    const positions: WatermarkPosition[] = [
      'top-left', 'top-right', 'bottom-left', 'bottom-right',
      'center-left', 'center-right',
    ]

    let currentPosition = baseConfig.position || 'bottom-right'

    const element = this.add(id, {
      ...baseConfig,
      text: getText(),
      position: currentPosition,
      opacity: baseConfig.opacity ?? 0.3,
    })

    // Update text periodically
    if (config.updateInterval && config.updateInterval > 0) {
      const textTimer = setInterval(() => {
        const textEl = element.querySelector('span')
        if (textEl) {
          textEl.textContent = getText()
        }
      }, config.updateInterval)

      this.dynamicTimers.set(`${id}-text`, textTimer)
    }

    // Move position periodically
    if (config.randomizePosition && config.moveInterval && config.moveInterval > 0) {
      const moveTimer = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * positions.length)
        currentPosition = positions[randomIndex]

        const positionStyles = this.getPositionStyles(currentPosition, baseConfig.offset)
        element.style.cssText = element.style.cssText.replace(
          /top:.*?;|bottom:.*?;|left:.*?;|right:.*?;|transform:.*?;/g,
          ''
        )
        element.style.cssText += positionStyles
      }, config.moveInterval)

      this.dynamicTimers.set(`${id}-move`, moveTimer)
    }

    return element
  }

  /**
   * Remove watermark
   */
  remove(id: string): void {
    const element = this.elements.get(id)
    if (element) {
      element.remove()
      this.elements.delete(id)
    }

    // Clear dynamic timers
    const textTimer = this.dynamicTimers.get(`${id}-text`)
    if (textTimer) {
      clearInterval(textTimer)
      this.dynamicTimers.delete(`${id}-text`)
    }

    const moveTimer = this.dynamicTimers.get(`${id}-move`)
    if (moveTimer) {
      clearInterval(moveTimer)
      this.dynamicTimers.delete(`${id}-move`)
    }
  }

  /**
   * Remove all watermarks
   */
  removeAll(): void {
    for (const id of this.elements.keys()) {
      this.remove(id)
    }
  }

  /**
   * Update watermark
   */
  update(id: string, config: Partial<WatermarkConfig>): void {
    const element = this.elements.get(id)
    if (!element) return

    if (config.opacity !== undefined) {
      element.style.opacity = String(config.opacity)
    }

    if (config.position) {
      const positionStyles = this.getPositionStyles(config.position, config.offset)
      element.style.cssText = element.style.cssText.replace(
        /top:.*?;|bottom:.*?;|left:.*?;|right:.*?;|transform:.*?;/g,
        ''
      )
      element.style.cssText += positionStyles
    }

    if (config.text) {
      const textEl = element.querySelector('span')
      if (textEl) {
        textEl.textContent = config.text
      }
    }

    if (config.image) {
      const imgEl = element.querySelector('img')
      if (imgEl) {
        imgEl.src = config.image
      }
    }
  }

  /**
   * Show watermark
   */
  show(id: string): void {
    const element = this.elements.get(id)
    if (element) {
      element.style.display = ''
    }
  }

  /**
   * Hide watermark
   */
  hide(id: string): void {
    const element = this.elements.get(id)
    if (element) {
      element.style.display = 'none'
    }
  }

  /**
   * Show all watermarks
   */
  showAll(): void {
    for (const id of this.elements.keys()) {
      this.show(id)
    }
  }

  /**
   * Hide all watermarks
   */
  hideAll(): void {
    for (const id of this.elements.keys()) {
      this.hide(id)
    }
  }

  /**
   * Get watermark element
   */
  get(id: string): HTMLElement | undefined {
    return this.elements.get(id)
  }

  /**
   * Get all watermark IDs
   */
  getAll(): string[] {
    return Array.from(this.elements.keys())
  }

  /**
   * Destroy manager
   */
  destroy(): void {
    this.removeAll()
    this.unsubscribers.forEach(unsub => unsub())
    this.player = null
    this.container = null
  }
}

// =============================================================================
// Factory
// =============================================================================

export function createWatermarkManager(): WatermarkManager {
  return new WatermarkManager()
}

/**
 * Watermark plugin for Player
 */
export function watermarkPlugin(watermarks: Array<{ id: string } & WatermarkConfig>) {
  return {
    name: 'watermark',

    install(player: Player, container: HTMLElement) {
      const manager = createWatermarkManager()
      manager.attach(player, container)

      // Add initial watermarks
      for (const { id, ...config } of watermarks) {
        manager.add(id, config)
      }

      // Expose on player
      ;(player as any).watermark = manager

      return () => {
        manager.destroy()
        delete (player as any).watermark
      }
    },
  }
}

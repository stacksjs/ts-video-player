/**
 * End Screen Plugin
 *
 * Display recommendations and actions at video end.
 *
 * @module plugins/end-screen
 */

import type { Player } from '../player'

// =============================================================================
// Types
// =============================================================================

export interface EndScreenConfig {
  /** Show end screen on video end */
  enabled?: boolean
  /** Auto-show delay after video ends (ms) */
  showDelay?: number
  /** Recommendations */
  recommendations?: EndScreenRecommendation[]
  /** Custom actions */
  actions?: EndScreenAction[]
  /** Replay button */
  showReplay?: boolean
  /** Share button */
  showShare?: boolean
  /** Countdown to next video (0 = disabled) */
  autoplayCountdown?: number
  /** Title text */
  title?: string
  /** Custom template */
  template?: string
  /** Background style */
  backgroundStyle?: 'blur' | 'dark' | 'gradient' | 'none'
}

export interface EndScreenRecommendation {
  /** Unique ID */
  id: string
  /** Title */
  title: string
  /** Description */
  description?: string
  /** Thumbnail URL */
  thumbnail: string
  /** Duration string (e.g., "12:34") */
  duration?: string
  /** Video URL or callback */
  url?: string
  /** Click handler */
  onClick?: () => void
  /** Channel/creator name */
  channel?: string
  /** View count */
  views?: string
  /** Upload date */
  date?: string
}

export interface EndScreenAction {
  /** Button text */
  label: string
  /** Icon (SVG or emoji) */
  icon?: string
  /** Click handler */
  onClick: () => void
  /** Button style */
  style?: 'primary' | 'secondary' | 'outline'
}

export interface EndScreenState {
  /** Is visible */
  visible: boolean
  /** Autoplay countdown */
  countdown: number
  /** Is countdown active */
  isCountingDown: boolean
  /** Selected recommendation index */
  selectedIndex: number
}

// =============================================================================
// End Screen Manager
// =============================================================================

export class EndScreenManager {
  private player: Player | null = null
  private config: Required<EndScreenConfig>
  private state: EndScreenState
  private container: HTMLElement | null = null
  private element: HTMLElement | null = null
  private countdownTimer: ReturnType<typeof setInterval> | null = null
  private showTimer: ReturnType<typeof setTimeout> | null = null
  private unsubscribers: Array<() => void> = []

  // Event handlers
  private onRecommendationClick: ((rec: EndScreenRecommendation) => void) | null = null
  private onReplay: (() => void) | null = null
  private onAutoplay: ((rec: EndScreenRecommendation) => void) | null = null
  private onShow: (() => void) | null = null
  private onHide: (() => void) | null = null

  constructor(config: EndScreenConfig = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      showDelay: config.showDelay ?? 0,
      recommendations: config.recommendations || [],
      actions: config.actions || [],
      showReplay: config.showReplay ?? true,
      showShare: config.showShare ?? false,
      autoplayCountdown: config.autoplayCountdown ?? 0,
      title: config.title || '',
      template: config.template || '',
      backgroundStyle: config.backgroundStyle || 'blur',
    }

    this.state = {
      visible: false,
      countdown: 0,
      isCountingDown: false,
      selectedIndex: 0,
    }
  }

  /**
   * Attach to player
   */
  attach(player: Player, container: HTMLElement): void {
    this.player = player
    this.container = container

    this.createElement()
    this.attachEventListeners()
  }

  /**
   * Create end screen element
   */
  private createElement(): void {
    if (!this.container) return

    this.element = document.createElement('div')
    this.element.className = 'tsvp-end-screen'

    this.element.style.cssText = `
      position: absolute;
      inset: 0;
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 40;
      font-family: var(--tsvp-font-family, sans-serif);
      color: var(--tsvp-color-text, #ffffff);
      padding: 24px;
      overflow: auto;
    `

    this.applyBackgroundStyle()
    this.container.appendChild(this.element)
  }

  /**
   * Apply background style
   */
  private applyBackgroundStyle(): void {
    if (!this.element) return

    switch (this.config.backgroundStyle) {
      case 'blur':
        this.element.style.background = 'rgba(0, 0, 0, 0.85)'
        this.element.style.backdropFilter = 'blur(10px)'
        break
      case 'dark':
        this.element.style.background = 'rgba(0, 0, 0, 0.95)'
        break
      case 'gradient':
        this.element.style.background = 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,40,0.95) 100%)'
        break
      case 'none':
        this.element.style.background = 'transparent'
        break
    }
  }

  /**
   * Render end screen content
   */
  private render(): void {
    if (!this.element) return

    // Use custom template if provided
    if (this.config.template) {
      this.element.innerHTML = this.config.template
      return
    }

    this.element.innerHTML = ''

    // Title
    if (this.config.title) {
      const title = document.createElement('h2')
      title.className = 'tsvp-end-screen-title'
      title.textContent = this.config.title
      title.style.cssText = `
        margin: 0 0 24px;
        font-size: 24px;
        font-weight: 600;
        text-align: center;
      `
      this.element.appendChild(title)
    }

    // Recommendations grid
    if (this.config.recommendations.length > 0) {
      const grid = document.createElement('div')
      grid.className = 'tsvp-end-screen-grid'
      grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        max-width: 900px;
        width: 100%;
        margin-bottom: 24px;
      `

      this.config.recommendations.forEach((rec, index) => {
        const card = this.createRecommendationCard(rec, index)
        grid.appendChild(card)
      })

      this.element.appendChild(grid)
    }

    // Actions row
    const actionsRow = document.createElement('div')
    actionsRow.className = 'tsvp-end-screen-actions'
    actionsRow.style.cssText = `
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
    `

    // Replay button
    if (this.config.showReplay) {
      const replayBtn = this.createActionButton({
        label: 'Replay',
        icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
        </svg>`,
        style: 'secondary',
        onClick: () => this.replay(),
      })
      actionsRow.appendChild(replayBtn)
    }

    // Share button
    if (this.config.showShare) {
      const shareBtn = this.createActionButton({
        label: 'Share',
        icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
        </svg>`,
        style: 'outline',
        onClick: () => this.share(),
      })
      actionsRow.appendChild(shareBtn)
    }

    // Custom actions
    for (const action of this.config.actions) {
      const btn = this.createActionButton(action)
      actionsRow.appendChild(btn)
    }

    this.element.appendChild(actionsRow)

    // Autoplay countdown
    if (this.state.isCountingDown && this.config.recommendations.length > 0) {
      const countdown = document.createElement('div')
      countdown.className = 'tsvp-end-screen-countdown'
      countdown.style.cssText = `
        margin-top: 24px;
        text-align: center;
        font-size: 14px;
        opacity: 0.8;
      `
      countdown.innerHTML = `
        Next video in <strong>${this.state.countdown}</strong> seconds
        <button class="tsvp-end-screen-cancel" style="
          margin-left: 12px;
          padding: 4px 12px;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 4px;
          background: transparent;
          color: inherit;
          cursor: pointer;
        ">Cancel</button>
      `

      const cancelBtn = countdown.querySelector('.tsvp-end-screen-cancel')
      cancelBtn?.addEventListener('click', () => this.cancelAutoplay())

      this.element.appendChild(countdown)
    }
  }

  /**
   * Create recommendation card
   */
  private createRecommendationCard(rec: EndScreenRecommendation, index: number): HTMLElement {
    const card = document.createElement('div')
    card.className = 'tsvp-end-screen-card'
    card.tabIndex = 0

    const isSelected = index === this.state.selectedIndex && this.state.isCountingDown

    card.style.cssText = `
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 150ms ease, background 150ms ease;
      ${isSelected ? 'outline: 2px solid var(--tsvp-color-primary, #00a8ff); outline-offset: 2px;' : ''}
    `

    // Thumbnail
    const thumbnail = document.createElement('div')
    thumbnail.className = 'tsvp-end-screen-thumbnail'
    thumbnail.style.cssText = `
      position: relative;
      aspect-ratio: 16 / 9;
      background: url(${rec.thumbnail}) center/cover;
    `

    // Duration badge
    if (rec.duration) {
      const duration = document.createElement('span')
      duration.className = 'tsvp-end-screen-duration'
      duration.textContent = rec.duration
      duration.style.cssText = `
        position: absolute;
        bottom: 4px;
        right: 4px;
        padding: 2px 6px;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
      `
      thumbnail.appendChild(duration)
    }

    card.appendChild(thumbnail)

    // Info
    const info = document.createElement('div')
    info.className = 'tsvp-end-screen-info'
    info.style.cssText = `
      padding: 12px;
    `

    const title = document.createElement('h3')
    title.className = 'tsvp-end-screen-card-title'
    title.textContent = rec.title
    title.style.cssText = `
      margin: 0 0 4px;
      font-size: 14px;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    `
    info.appendChild(title)

    if (rec.channel) {
      const channel = document.createElement('p')
      channel.className = 'tsvp-end-screen-channel'
      channel.textContent = rec.channel
      channel.style.cssText = `
        margin: 0;
        font-size: 12px;
        opacity: 0.7;
      `
      info.appendChild(channel)
    }

    if (rec.views || rec.date) {
      const meta = document.createElement('p')
      meta.className = 'tsvp-end-screen-meta'
      meta.textContent = [rec.views, rec.date].filter(Boolean).join(' • ')
      meta.style.cssText = `
        margin: 4px 0 0;
        font-size: 12px;
        opacity: 0.6;
      `
      info.appendChild(meta)
    }

    card.appendChild(info)

    // Hover effects
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'scale(1.03)'
      card.style.background = 'rgba(255, 255, 255, 0.15)'
    })

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'scale(1)'
      card.style.background = 'rgba(255, 255, 255, 0.1)'
    })

    // Click handler
    card.addEventListener('click', () => {
      this.onRecommendationClick?.(rec)
      if (rec.onClick) {
        rec.onClick()
      }
      else if (rec.url) {
        window.location.href = rec.url
      }
    })

    return card
  }

  /**
   * Create action button
   */
  private createActionButton(action: EndScreenAction): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.className = `tsvp-end-screen-btn tsvp-end-screen-btn--${action.style || 'secondary'}`
    btn.type = 'button'

    let bgColor = 'rgba(255, 255, 255, 0.2)'
    let borderColor = 'transparent'

    switch (action.style) {
      case 'primary':
        bgColor = 'var(--tsvp-color-primary, #00a8ff)'
        break
      case 'outline':
        bgColor = 'transparent'
        borderColor = 'rgba(255, 255, 255, 0.5)'
        break
    }

    btn.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: ${bgColor};
      border: 1px solid ${borderColor};
      border-radius: 6px;
      color: #fff;
      font-size: 14px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: transform 150ms ease, opacity 150ms ease;
    `

    if (action.icon) {
      const icon = document.createElement('span')
      icon.innerHTML = action.icon
      icon.style.display = 'flex'
      btn.appendChild(icon)
    }

    const label = document.createElement('span')
    label.textContent = action.label
    btn.appendChild(label)

    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.05)'
    })

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)'
    })

    btn.addEventListener('click', action.onClick)

    return btn
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    if (!this.player) return

    const handleEnded = () => {
      if (this.config.enabled) {
        this.showTimer = setTimeout(() => {
          this.show()
        }, this.config.showDelay)
      }
    }

    this.player.on('ended', handleEnded)
    this.unsubscribers.push(() => this.player?.off('ended', handleEnded))

    // Hide on play
    const handlePlay = () => {
      if (this.state.visible) {
        this.hide()
      }
    }

    this.player.on('play', handlePlay)
    this.unsubscribers.push(() => this.player?.off('play', handlePlay))

    // Keyboard navigation
    const handleKeydown = (e: KeyboardEvent) => {
      if (!this.state.visible) return

      switch (e.key) {
        case 'Escape':
          this.hide()
          break
        case 'ArrowLeft':
          this.selectPrevious()
          break
        case 'ArrowRight':
          this.selectNext()
          break
        case 'Enter':
          this.selectCurrent()
          break
      }
    }

    document.addEventListener('keydown', handleKeydown)
    this.unsubscribers.push(() => document.removeEventListener('keydown', handleKeydown))
  }

  /**
   * Show end screen
   */
  show(): void {
    if (!this.element || this.state.visible) return

    this.state.visible = true
    this.state.selectedIndex = 0

    // Start autoplay countdown
    if (this.config.autoplayCountdown > 0 && this.config.recommendations.length > 0) {
      this.startAutoplayCountdown()
    }

    this.render()

    this.element.style.display = 'flex'
    this.element.style.opacity = '0'
    requestAnimationFrame(() => {
      this.element!.style.transition = 'opacity 300ms ease'
      this.element!.style.opacity = '1'
    })

    this.onShow?.()
  }

  /**
   * Hide end screen
   */
  hide(): void {
    if (!this.element || !this.state.visible) return

    this.state.visible = false
    this.cancelAutoplay()

    this.element.style.opacity = '0'
    setTimeout(() => {
      if (this.element && !this.state.visible) {
        this.element.style.display = 'none'
      }
    }, 300)

    this.onHide?.()
  }

  /**
   * Start autoplay countdown
   */
  private startAutoplayCountdown(): void {
    this.state.isCountingDown = true
    this.state.countdown = this.config.autoplayCountdown

    this.countdownTimer = setInterval(() => {
      this.state.countdown--
      this.render()

      if (this.state.countdown <= 0) {
        this.playNextVideo()
      }
    }, 1000)
  }

  /**
   * Cancel autoplay
   */
  cancelAutoplay(): void {
    this.state.isCountingDown = false
    this.state.countdown = 0

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
      this.countdownTimer = null
    }

    if (this.state.visible) {
      this.render()
    }
  }

  /**
   * Play next video
   */
  private playNextVideo(): void {
    const rec = this.config.recommendations[this.state.selectedIndex]
    if (rec) {
      this.onAutoplay?.(rec)
      if (rec.onClick) {
        rec.onClick()
      }
      else if (rec.url) {
        window.location.href = rec.url
      }
    }
  }

  /**
   * Select previous recommendation
   */
  private selectPrevious(): void {
    if (this.config.recommendations.length === 0) return
    this.state.selectedIndex = (this.state.selectedIndex - 1 + this.config.recommendations.length)
      % this.config.recommendations.length
    this.render()
  }

  /**
   * Select next recommendation
   */
  private selectNext(): void {
    if (this.config.recommendations.length === 0) return
    this.state.selectedIndex = (this.state.selectedIndex + 1) % this.config.recommendations.length
    this.render()
  }

  /**
   * Select current recommendation
   */
  private selectCurrent(): void {
    const rec = this.config.recommendations[this.state.selectedIndex]
    if (rec) {
      this.onRecommendationClick?.(rec)
      if (rec.onClick) {
        rec.onClick()
      }
      else if (rec.url) {
        window.location.href = rec.url
      }
    }
  }

  /**
   * Replay video
   */
  private replay(): void {
    this.hide()
    this.player?.seekTo(0)
    this.player?.play()
    this.onReplay?.()
  }

  /**
   * Share video
   */
  private share(): void {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      })
    }
    else {
      // Fallback: copy to clipboard
      navigator.clipboard?.writeText(window.location.href)
    }
  }

  /**
   * Update recommendations
   */
  setRecommendations(recommendations: EndScreenRecommendation[]): void {
    this.config.recommendations = recommendations
    if (this.state.visible) {
      this.render()
    }
  }

  /**
   * Get state
   */
  getState(): EndScreenState {
    return { ...this.state }
  }

  /**
   * Set event handlers
   */
  on(event: 'recommendationClick', handler: (rec: EndScreenRecommendation) => void): void
  on(event: 'replay', handler: () => void): void
  on(event: 'autoplay', handler: (rec: EndScreenRecommendation) => void): void
  on(event: 'show' | 'hide', handler: () => void): void
  on(event: string, handler: (...args: any[]) => void): void {
    switch (event) {
      case 'recommendationClick':
        this.onRecommendationClick = handler
        break
      case 'replay':
        this.onReplay = handler
        break
      case 'autoplay':
        this.onAutoplay = handler
        break
      case 'show':
        this.onShow = handler
        break
      case 'hide':
        this.onHide = handler
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
    if (this.showTimer) {
      clearTimeout(this.showTimer)
    }

    this.unsubscribers.forEach(unsub => unsub())

    this.element?.remove()

    this.player = null
    this.container = null
  }
}

// =============================================================================
// Factory
// =============================================================================

export function createEndScreen(config?: EndScreenConfig): EndScreenManager {
  return new EndScreenManager(config)
}

/**
 * End screen plugin for Player
 */
export function endScreenPlugin(config: EndScreenConfig) {
  return {
    name: 'endScreen',

    install(player: Player, container: HTMLElement) {
      const endScreen = createEndScreen(config)
      endScreen.attach(player, container)

      // Expose on player
      ;(player as any).endScreen = endScreen

      return () => {
        endScreen.destroy()
        delete (player as any).endScreen
      }
    },
  }
}

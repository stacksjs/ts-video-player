/**
 * ts-video-player UI Components
 *
 * UI components for building video player interfaces.
 *
 * @module ui/components
 */

import type { Player, PlayerState, UIComponent, SliderOptions, MenuItem } from '../types'

// =============================================================================
// Base Component
// =============================================================================

/**
 * Base class for UI components
 */
export abstract class BaseComponent implements UIComponent {
  abstract name: string
  protected player: Player | null = null
  protected element: HTMLElement | null = null
  protected unsubscribes: Array<() => void> = []

  render(player: Player): HTMLElement {
    this.player = player
    this.element = this.createElement()
    this.attachEvents()
    this.subscribeToState()
    return this.element
  }

  protected abstract createElement(): HTMLElement
  protected abstract attachEvents(): void

  protected subscribeToState(): void {
    // Override in subclass
  }

  update(state: PlayerState): void {
    // Override in subclass
  }

  destroy(): void {
    this.unsubscribes.forEach((fn) => fn())
    this.unsubscribes = []
    this.element?.remove()
    this.element = null
    this.player = null
  }

  protected el<T extends HTMLElement>(
    tag: string,
    attrs: Record<string, string> = {},
    children?: (HTMLElement | string)[],
  ): T {
    const element = document.createElement(tag) as T
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'class') {
        element.className = value
      } else {
        element.setAttribute(key, value)
      }
    }
    if (children) {
      for (const child of children) {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child))
        } else {
          element.appendChild(child)
        }
      }
    }
    return element
  }
}

// =============================================================================
// Play Button
// =============================================================================

export class PlayButton extends BaseComponent {
  name = 'play-button'

  protected createElement(): HTMLElement {
    return this.el('button', {
      class: 'ts-video-btn ts-video-btn--play',
      'aria-label': 'Play',
      type: 'button',
    }, [this.getIcon()])
  }

  protected attachEvents(): void {
    this.element?.addEventListener('click', () => {
      this.player?.togglePlay()
    })
  }

  protected subscribeToState(): void {
    if (!this.player) return
    const unsub = (this.player as any)._store?.subscribe('paused', (state: PlayerState) => {
      this.update(state)
    })
    if (unsub) this.unsubscribes.push(unsub)
  }

  update(state: PlayerState): void {
    if (!this.element) return
    this.element.setAttribute('aria-label', state.paused ? 'Play' : 'Pause')
    this.element.innerHTML = ''
    this.element.appendChild(this.getIcon(state.paused))
  }

  private getIcon(paused = true): HTMLElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('width', '24')
    svg.setAttribute('height', '24')
    svg.setAttribute('fill', 'currentColor')

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', paused ? 'M8 5v14l11-7z' : 'M6 19h4V5H6v14zm8-14v14h4V5h-4z')
    svg.appendChild(path)

    return svg as unknown as HTMLElement
  }
}

// =============================================================================
// Mute Button
// =============================================================================

export class MuteButton extends BaseComponent {
  name = 'mute-button'

  protected createElement(): HTMLElement {
    return this.el('button', {
      class: 'ts-video-btn ts-video-btn--mute',
      'aria-label': 'Mute',
      type: 'button',
    }, [this.getIcon(false, 1)])
  }

  protected attachEvents(): void {
    this.element?.addEventListener('click', () => {
      this.player?.toggleMute()
    })
  }

  update(state: PlayerState): void {
    if (!this.element) return
    this.element.setAttribute('aria-label', state.muted ? 'Unmute' : 'Mute')
    this.element.innerHTML = ''
    this.element.appendChild(this.getIcon(state.muted, state.volume))
  }

  private getIcon(muted: boolean, volume: number): HTMLElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('width', '24')
    svg.setAttribute('height', '24')
    svg.setAttribute('fill', 'currentColor')

    let d: string
    if (muted || volume === 0) {
      d = 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z'
    } else if (volume < 0.5) {
      d = 'M18.5 12A4.5 4.5 0 0 0 16 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z'
    } else {
      d = 'M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z'
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', d)
    svg.appendChild(path)

    return svg as unknown as HTMLElement
  }
}

// =============================================================================
// Fullscreen Button
// =============================================================================

export class FullscreenButton extends BaseComponent {
  name = 'fullscreen-button'

  protected createElement(): HTMLElement {
    return this.el('button', {
      class: 'ts-video-btn ts-video-btn--fullscreen',
      'aria-label': 'Enter fullscreen',
      type: 'button',
    }, [this.getIcon(false)])
  }

  protected attachEvents(): void {
    this.element?.addEventListener('click', () => {
      this.player?.toggleFullscreen()
    })
  }

  update(state: PlayerState): void {
    if (!this.element) return
    const btn = this.element as HTMLButtonElement
    const disabled = state.fullscreenAvailability !== 'available'
    btn.disabled = disabled
    btn.style.display = state.fullscreenAvailability === 'unsupported' ? 'none' : ''
    btn.setAttribute('aria-label', state.fullscreen ? 'Exit fullscreen' : 'Enter fullscreen')
    btn.innerHTML = ''
    btn.appendChild(this.getIcon(state.fullscreen))
  }

  private getIcon(fullscreen: boolean): HTMLElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('width', '24')
    svg.setAttribute('height', '24')
    svg.setAttribute('fill', 'currentColor')

    const d = fullscreen
      ? 'M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z'
      : 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z'

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', d)
    svg.appendChild(path)

    return svg as unknown as HTMLElement
  }
}

// =============================================================================
// PiP Button
// =============================================================================

export class PiPButton extends BaseComponent {
  name = 'pip-button'

  protected createElement(): HTMLElement {
    return this.el('button', {
      class: 'ts-video-btn ts-video-btn--pip',
      'aria-label': 'Picture in picture',
      type: 'button',
    }, [this.getIcon()])
  }

  protected attachEvents(): void {
    this.element?.addEventListener('click', () => {
      this.player?.togglePiP()
    })
  }

  update(state: PlayerState): void {
    if (!this.element) return
    const btn = this.element as HTMLButtonElement
    const disabled = state.pipAvailability !== 'available'
    btn.disabled = disabled
    btn.style.display = state.pipAvailability === 'unsupported' ? 'none' : ''
  }

  private getIcon(): HTMLElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('width', '24')
    svg.setAttribute('height', '24')
    svg.setAttribute('fill', 'currentColor')

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', 'M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z')
    svg.appendChild(path)

    return svg as unknown as HTMLElement
  }
}

// =============================================================================
// Time Display
// =============================================================================

export class TimeDisplay extends BaseComponent {
  name = 'time-display'
  private showRemaining = false

  protected createElement(): HTMLElement {
    const container = this.el('div', { class: 'ts-video-time' })

    const current = this.el('span', { class: 'ts-video-time__current' }, ['0:00'])
    const separator = this.el('span', { class: 'ts-video-time__separator' }, [' / '])
    const duration = this.el('span', { class: 'ts-video-time__duration' }, ['0:00'])

    container.appendChild(current)
    container.appendChild(separator)
    container.appendChild(duration)

    return container
  }

  protected attachEvents(): void {
    this.element?.addEventListener('click', () => {
      this.showRemaining = !this.showRemaining
      if (this.player) {
        this.update(this.player.state)
      }
    })
  }

  update(state: PlayerState): void {
    if (!this.element) return

    const current = this.element.querySelector('.ts-video-time__current')
    const duration = this.element.querySelector('.ts-video-time__duration')

    if (current) {
      current.textContent = formatTime(state.currentTime)
    }

    if (duration) {
      if (this.showRemaining) {
        duration.textContent = `-${formatTime(state.duration - state.currentTime)}`
      } else {
        duration.textContent = formatTime(state.duration)
      }
    }
  }
}

// =============================================================================
// Slider Component
// =============================================================================

export class Slider extends BaseComponent {
  name = 'slider'
  private options: SliderOptions
  private track: HTMLElement | null = null
  private fill: HTMLElement | null = null
  private thumb: HTMLElement | null = null
  private isDragging = false

  constructor(options: SliderOptions) {
    super()
    this.options = {
      orientation: 'horizontal',
      disabled: false,
      ...options,
    }
  }

  protected createElement(): HTMLElement {
    const container = this.el('div', {
      class: `ts-video-slider ts-video-slider--${this.options.orientation}`,
      role: 'slider',
      'aria-valuemin': String(this.options.min),
      'aria-valuemax': String(this.options.max),
      'aria-valuenow': String(this.options.value),
      tabindex: '0',
    })

    this.track = this.el('div', { class: 'ts-video-slider__track' })
    this.fill = this.el('div', { class: 'ts-video-slider__fill' })
    this.thumb = this.el('div', { class: 'ts-video-slider__thumb' })

    this.track.appendChild(this.fill)
    this.track.appendChild(this.thumb)
    container.appendChild(this.track)

    this.updateVisual(this.options.value)

    return container
  }

  protected attachEvents(): void {
    if (!this.element) return

    // Pointer events
    this.element.addEventListener('pointerdown', this.onPointerDown.bind(this))
    document.addEventListener('pointermove', this.onPointerMove.bind(this))
    document.addEventListener('pointerup', this.onPointerUp.bind(this))

    // Keyboard events
    this.element.addEventListener('keydown', this.onKeyDown.bind(this))
  }

  private onPointerDown(e: PointerEvent): void {
    if (this.options.disabled) return
    this.isDragging = true
    this.element?.setPointerCapture(e.pointerId)
    this.updateFromPointer(e)
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.isDragging) return
    this.updateFromPointer(e)
  }

  private onPointerUp(e: PointerEvent): void {
    if (!this.isDragging) return
    this.isDragging = false
    this.element?.releasePointerCapture(e.pointerId)
    this.options.onChange?.(this.options.value)
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (this.options.disabled) return

    let newValue = this.options.value
    const step = this.options.step

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        newValue = Math.min(this.options.max, newValue + step)
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        newValue = Math.max(this.options.min, newValue - step)
        break
      case 'Home':
        newValue = this.options.min
        break
      case 'End':
        newValue = this.options.max
        break
      default:
        return
    }

    e.preventDefault()
    this.setValue(newValue)
    this.options.onChange?.(newValue)
  }

  private updateFromPointer(e: PointerEvent): void {
    if (!this.track) return

    const rect = this.track.getBoundingClientRect()
    const isHorizontal = this.options.orientation === 'horizontal'

    let percent: number
    if (isHorizontal) {
      percent = (e.clientX - rect.left) / rect.width
    } else {
      percent = 1 - (e.clientY - rect.top) / rect.height
    }

    percent = Math.max(0, Math.min(1, percent))
    const value = this.options.min + percent * (this.options.max - this.options.min)

    // Snap to step
    const snapped = Math.round(value / this.options.step) * this.options.step

    this.setValue(snapped)
    this.options.onInput?.(snapped)
  }

  setValue(value: number): void {
    this.options.value = Math.max(this.options.min, Math.min(this.options.max, value))
    this.updateVisual(this.options.value)
    this.element?.setAttribute('aria-valuenow', String(this.options.value))
  }

  private updateVisual(value: number): void {
    const percent = ((value - this.options.min) / (this.options.max - this.options.min)) * 100

    if (this.fill) {
      if (this.options.orientation === 'horizontal') {
        this.fill.style.width = `${percent}%`
      } else {
        this.fill.style.height = `${percent}%`
      }
    }

    if (this.thumb) {
      if (this.options.orientation === 'horizontal') {
        this.thumb.style.left = `${percent}%`
      } else {
        this.thumb.style.bottom = `${percent}%`
      }
    }
  }

  destroy(): void {
    document.removeEventListener('pointermove', this.onPointerMove.bind(this))
    document.removeEventListener('pointerup', this.onPointerUp.bind(this))
    super.destroy()
  }
}

// =============================================================================
// Progress Bar (Time Slider)
// =============================================================================

export class ProgressBar extends BaseComponent {
  name = 'progress-bar'
  private slider: Slider | null = null
  private buffered: HTMLElement | null = null
  private isSeeking = false

  protected createElement(): HTMLElement {
    const container = this.el('div', { class: 'ts-video-progress' })

    // Buffered indicator
    this.buffered = this.el('div', { class: 'ts-video-progress__buffered' })

    // Slider
    this.slider = new Slider({
      min: 0,
      max: 100,
      step: 0.1,
      value: 0,
      onInput: (value) => {
        this.isSeeking = true
        const time = (value / 100) * (this.player?.state.duration || 0)
        this.player?.seekTo(time)
      },
      onChange: () => {
        this.isSeeking = false
      },
    })

    const sliderEl = this.slider.render(this.player!)
    sliderEl.classList.add('ts-video-progress__slider')

    // Insert buffered before slider track
    const track = sliderEl.querySelector('.ts-video-slider__track')
    if (track) {
      track.insertBefore(this.buffered, track.firstChild)
    }

    container.appendChild(sliderEl)

    return container
  }

  protected attachEvents(): void {
    // Events handled by slider
  }

  update(state: PlayerState): void {
    if (!this.slider || this.isSeeking) return

    // Update progress
    const percent = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0
    this.slider.setValue(percent)

    // Update buffered
    if (this.buffered) {
      const bufferedPercent = state.bufferedAmount * 100
      this.buffered.style.width = `${bufferedPercent}%`
    }
  }

  destroy(): void {
    this.slider?.destroy()
    super.destroy()
  }
}

// =============================================================================
// Volume Slider
// =============================================================================

export class VolumeSlider extends BaseComponent {
  name = 'volume-slider'
  private slider: Slider | null = null

  protected createElement(): HTMLElement {
    const container = this.el('div', { class: 'ts-video-volume' })

    this.slider = new Slider({
      min: 0,
      max: 1,
      step: 0.01,
      value: this.player?.state.volume || 1,
      onInput: (value) => {
        this.player?.setVolume(value)
      },
    })

    container.appendChild(this.slider.render(this.player!))

    return container
  }

  protected attachEvents(): void {
    // Events handled by slider
  }

  update(state: PlayerState): void {
    if (!this.slider) return
    if (this.element) {
      this.element.style.display = state.volumeAvailability === 'unsupported' ? 'none' : ''
    }
    this.slider.setValue(state.muted ? 0 : state.volume)
  }

  destroy(): void {
    this.slider?.destroy()
    super.destroy()
  }
}

// =============================================================================
// Menu
// =============================================================================

export class Menu extends BaseComponent {
  name = 'menu'
  private items: MenuItem[]
  private isOpen = false
  private menuEl: HTMLElement | null = null
  private onSelect?: (item: MenuItem) => void

  constructor(items: MenuItem[], onSelect?: (item: MenuItem) => void) {
    super()
    this.items = items
    this.onSelect = onSelect
  }

  protected createElement(): HTMLElement {
    const container = this.el('div', { class: 'ts-video-menu' })

    // Trigger button
    const trigger = this.el('button', {
      class: 'ts-video-btn ts-video-menu__trigger',
      'aria-label': 'Settings',
      'aria-haspopup': 'true',
      'aria-expanded': 'false',
      type: 'button',
    }, [this.getIcon()])

    // Menu content
    this.menuEl = this.el('div', {
      class: 'ts-video-menu__content',
      role: 'menu',
      'aria-hidden': 'true',
    })

    this.renderItems()

    container.appendChild(trigger)
    container.appendChild(this.menuEl)

    return container
  }

  private renderItems(): void {
    if (!this.menuEl) return
    this.menuEl.innerHTML = ''

    for (const item of this.items) {
      const itemEl = this.el('button', {
        class: `ts-video-menu__item${item.checked ? ' ts-video-menu__item--checked' : ''}${item.disabled ? ' ts-video-menu__item--disabled' : ''}`,
        role: 'menuitem',
        'data-id': item.id,
        type: 'button',
      }, [item.label])

      itemEl.addEventListener('click', () => {
        if (!item.disabled) {
          this.onSelect?.(item)
          this.close()
        }
      })

      this.menuEl.appendChild(itemEl)
    }
  }

  protected attachEvents(): void {
    const trigger = this.element?.querySelector('.ts-video-menu__trigger')
    trigger?.addEventListener('click', () => this.toggle())

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.element?.contains(e.target as Node)) {
        this.close()
      }
    })

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close()
      }
    })
  }

  toggle(): void {
    if (this.isOpen) {
      this.close()
    } else {
      this.open()
    }
  }

  open(): void {
    this.isOpen = true
    this.menuEl?.setAttribute('aria-hidden', 'false')
    this.element?.querySelector('.ts-video-menu__trigger')?.setAttribute('aria-expanded', 'true')
    this.element?.classList.add('ts-video-menu--open')
  }

  close(): void {
    this.isOpen = false
    this.menuEl?.setAttribute('aria-hidden', 'true')
    this.element?.querySelector('.ts-video-menu__trigger')?.setAttribute('aria-expanded', 'false')
    this.element?.classList.remove('ts-video-menu--open')
  }

  setItems(items: MenuItem[]): void {
    this.items = items
    this.renderItems()
  }

  private getIcon(): HTMLElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('width', '24')
    svg.setAttribute('height', '24')
    svg.setAttribute('fill', 'currentColor')

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', 'M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z')
    svg.appendChild(path)

    return svg as unknown as HTMLElement
  }
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Format time in seconds to MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00'

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return `${m}:${s.toString().padStart(2, '0')}`
}

// =============================================================================
// CSS Styles
// =============================================================================

export const UI_STYLES = `
.ts-video-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 8px;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  transition: opacity 0.2s;
}

.ts-video-btn:hover {
  opacity: 0.8;
}

.ts-video-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ts-video-time {
  font-size: 14px;
  color: white;
  font-variant-numeric: tabular-nums;
  user-select: none;
  cursor: pointer;
}

.ts-video-slider {
  position: relative;
  width: 100%;
  height: 20px;
  cursor: pointer;
}

.ts-video-slider__track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  transform: translateY(-50%);
}

.ts-video-slider__fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #fff;
  border-radius: 2px;
}

.ts-video-slider__thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: transform 0.1s;
}

.ts-video-slider:hover .ts-video-slider__thumb {
  transform: translate(-50%, -50%) scale(1.2);
}

.ts-video-progress {
  flex: 1;
  margin: 0 12px;
}

.ts-video-progress__buffered {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 2px;
}

.ts-video-volume {
  width: 80px;
}

.ts-video-menu {
  position: relative;
}

.ts-video-menu__content {
  position: absolute;
  bottom: 100%;
  right: 0;
  min-width: 150px;
  max-height: 200px;
  overflow-y: auto;
  background: rgba(28, 28, 28, 0.95);
  border-radius: 4px;
  padding: 4px 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: opacity 0.2s, transform 0.2s, visibility 0.2s;
}

.ts-video-menu--open .ts-video-menu__content {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.ts-video-menu__item {
  display: block;
  width: 100%;
  padding: 8px 16px;
  background: none;
  border: none;
  color: white;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
}

.ts-video-menu__item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.ts-video-menu__item--checked::before {
  content: '✓';
  margin-right: 8px;
}

.ts-video-menu__item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
`

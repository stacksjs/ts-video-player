/**
 * ts-video-player <media-settings-menu> Custom Element
 *
 * Settings dropdown with quality, speed, captions, and audio track options.
 *
 * @module elements/media-settings-menu
 */

import { resolvePlayer } from './utils'

const GEAR_ICON = 'M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z'

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

export class MediaSettingsMenu extends HTMLElement {
  private _cleanup: (() => void) | null = null
  private _isOpen = false
  private _currentPanel: 'main' | 'speed' | 'quality' | 'captions' = 'main'

  connectedCallback(): void {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: 'open' })
      shadow.innerHTML = `
        <style>
          :host { display: inline-flex; position: relative; }
          button.trigger {
            display: inline-flex; align-items: center; justify-content: center;
            width: 40px; height: 40px; padding: 8px;
            background: transparent; border: none; color: inherit; cursor: pointer;
          }
          button.trigger:hover { opacity: 0.8; }
          .menu {
            position: absolute; bottom: 100%; right: 0;
            min-width: 160px; max-height: 250px; overflow-y: auto;
            background: rgba(28,28,28,0.95); border-radius: 4px;
            padding: 4px 0; opacity: 0; visibility: hidden;
            transform: translateY(10px);
            transition: opacity 0.2s, transform 0.2s, visibility 0.2s;
          }
          :host([open]) .menu {
            opacity: 1; visibility: visible; transform: translateY(0);
          }
          .item {
            display: flex; align-items: center; gap: 8px;
            width: 100%; padding: 8px 16px;
            background: none; border: none; color: white;
            text-align: left; cursor: pointer; font-size: 14px;
          }
          .item:hover { background: rgba(255,255,255,0.1); }
          .item[aria-checked="true"]::before { content: '\\2713'; }
          .item[aria-checked="false"]::before { content: ''; min-width: 12px; display: inline-block; }
          .back { font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.2); }
        </style>
        <button class="trigger" part="trigger" type="button"
                aria-label="Settings" aria-haspopup="true" aria-expanded="false">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" part="icon">
            <path d="${GEAR_ICON}"/>
          </svg>
        </button>
        <div class="menu" part="menu" role="menu" aria-hidden="true"></div>
      `
    }

    const trigger = this.shadowRoot!.querySelector('.trigger')!
    this._onTriggerClick = () => this.toggle()
    trigger.addEventListener('click', this._onTriggerClick)

    // Close on outside click
    this._onDocClick = (e: MouseEvent) => {
      if (this._isOpen && !this.contains(e.target as Node)) this.close()
    }
    document.addEventListener('click', this._onDocClick)

    // Close on escape
    this._onDocKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this._isOpen) this.close()
    }
    document.addEventListener('keydown', this._onDocKeydown)

    queueMicrotask(() => this.attach())
  }

  private _onTriggerClick: (() => void) | null = null
  private _onDocClick: ((e: MouseEvent) => void) | null = null
  private _onDocKeydown: ((e: KeyboardEvent) => void) | null = null

  disconnectedCallback(): void {
    this._cleanup?.()
    this._cleanup = null
    if (this._onTriggerClick) {
      this.shadowRoot?.querySelector('.trigger')?.removeEventListener('click', this._onTriggerClick)
    }
    if (this._onDocClick) document.removeEventListener('click', this._onDocClick)
    if (this._onDocKeydown) document.removeEventListener('keydown', this._onDocKeydown)
  }

  toggle(): void {
    if (this._isOpen) this.close()
    else this.open()
  }

  open(): void {
    this._isOpen = true
    this._currentPanel = 'main'
    this.setAttribute('open', '')
    this.shadowRoot!.querySelector('.trigger')!.setAttribute('aria-expanded', 'true')
    this.shadowRoot!.querySelector('.menu')!.setAttribute('aria-hidden', 'false')
    this.renderPanel()
  }

  close(): void {
    this._isOpen = false
    this.removeAttribute('open')
    this.shadowRoot!.querySelector('.trigger')!.setAttribute('aria-expanded', 'false')
    this.shadowRoot!.querySelector('.menu')!.setAttribute('aria-hidden', 'true')
  }

  private attach(): void {
    const player = resolvePlayer(this)
    if (!player) return

    const unsub = player.subscribe(() => {
      if (this._isOpen) this.renderPanel()
    })

    this._cleanup = unsub
  }

  private renderPanel(): void {
    const player = resolvePlayer(this)
    if (!player) return

    const menu = this.shadowRoot!.querySelector('.menu')!
    menu.innerHTML = ''

    switch (this._currentPanel) {
      case 'main': this.renderMain(menu, player); break
      case 'speed': this.renderSpeed(menu, player); break
      case 'quality': this.renderQuality(menu, player); break
      case 'captions': this.renderCaptions(menu, player); break
    }
  }

  private renderMain(menu: Element, player: any): void {
    const state = player.state

    // Speed
    this.addItem(menu, `Speed: ${state.playbackRate}x`, () => {
      this._currentPanel = 'speed'
      this.renderPanel()
    })

    // Quality
    if (state.qualities.length > 0) {
      const current = state.qualities.find((q: any) => q.selected)
      const label = state.autoQuality ? 'Auto' : (current ? `${current.height}p` : 'Auto')
      this.addItem(menu, `Quality: ${label}`, () => {
        this._currentPanel = 'quality'
        this.renderPanel()
      })
    }

    // Captions
    if (state.textTracks.length > 0) {
      const showing = state.textTracks.find((t: any) => t.mode === 'showing')
      this.addItem(menu, `Captions: ${showing?.label || 'Off'}`, () => {
        this._currentPanel = 'captions'
        this.renderPanel()
      })
    }
  }

  private renderSpeed(menu: Element, player: any): void {
    this.addItem(menu, 'Back', () => {
      this._currentPanel = 'main'
      this.renderPanel()
    }, false, true)

    for (const speed of SPEEDS) {
      const checked = player.state.playbackRate === speed
      this.addItem(menu, `${speed}x`, () => {
        player.setPlaybackRate(speed)
        this.close()
      }, checked)
    }
  }

  private renderQuality(menu: Element, player: any): void {
    this.addItem(menu, 'Back', () => {
      this._currentPanel = 'main'
      this.renderPanel()
    }, false, true)

    // Auto option
    this.addItem(menu, 'Auto', () => {
      player.setQuality('auto')
      this.close()
    }, player.state.autoQuality)

    for (const q of player.state.qualities) {
      this.addItem(menu, `${q.height}p`, () => {
        player.setQuality(q)
        this.close()
      }, q.selected && !player.state.autoQuality)
    }
  }

  private renderCaptions(menu: Element, player: any): void {
    this.addItem(menu, 'Back', () => {
      this._currentPanel = 'main'
      this.renderPanel()
    }, false, true)

    // Off option
    const anyShowing = player.state.textTracks.some((t: any) => t.mode === 'showing')
    this.addItem(menu, 'Off', () => {
      for (const t of player.state.textTracks) {
        if (t.mode === 'showing') player.setTextTrack(t.id, 'disabled')
      }
      this.close()
    }, !anyShowing)

    for (const track of player.state.textTracks) {
      if (track.kind === 'subtitles' || track.kind === 'captions') {
        this.addItem(menu, track.label, () => {
          player.setTextTrack(track.id, 'showing')
          this.close()
        }, track.mode === 'showing')
      }
    }
  }

  private addItem(
    menu: Element,
    label: string,
    onClick: () => void,
    checked = false,
    isBack = false,
  ): void {
    const btn = document.createElement('button')
    btn.className = `item${isBack ? ' back' : ''}`
    btn.setAttribute('role', 'menuitem')
    if (!isBack) btn.setAttribute('aria-checked', String(checked))
    btn.textContent = label
    btn.addEventListener('click', onClick)
    menu.appendChild(btn)
  }
}

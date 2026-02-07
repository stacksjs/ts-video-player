/**
 * ts-video-player <video-player> Custom Element
 *
 * The root element that wraps the Player class.
 *
 * @module elements/video-player
 */

import { Player } from '../player'
import type { PlayerOptions, PlayerState, PlayerEventMap } from '../types'

const OBSERVED_ATTRS = ['src', 'poster', 'autoplay', 'loop', 'muted', 'controls', 'volume', 'playback-rate', 'preload'] as const

export class VideoPlayerElement extends HTMLElement {
  private _player: Player | null = null
  private _container: HTMLElement | null = null

  static get observedAttributes(): string[] {
    return [...OBSERVED_ATTRS]
  }

  get player(): Player | null {
    return this._player
  }

  connectedCallback(): void {
    if (this._player) return

    // Create shadow DOM
    const shadow = this.attachShadow({ mode: 'open' })

    // Container
    this._container = document.createElement('div')
    this._container.setAttribute('part', 'container')
    this._container.style.cssText = 'position:relative;width:100%;height:100%;'

    // Slot for child media elements (buttons, etc.)
    const slot = document.createElement('slot')
    this._container.appendChild(slot)

    shadow.appendChild(this._container)

    // Build options from attributes
    const options = this.buildOptions()

    // Create player
    this._player = new Player(this._container, options)

    // Forward player events as DOM events
    this.forwardEvents()
  }

  disconnectedCallback(): void {
    this._player?.destroy()
    this._player = null
    this._container = null
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    if (!this._player) return

    switch (name) {
      case 'src':
        if (value) this._player.setSrc(value)
        break
      case 'muted':
        this._player.setMuted(value !== null)
        break
      case 'volume':
        if (value !== null) this._player.setVolume(parseFloat(value))
        break
      case 'playback-rate':
        if (value !== null) this._player.setPlaybackRate(parseFloat(value))
        break
    }
  }

  private buildOptions(): PlayerOptions {
    const options: PlayerOptions = {}

    const src = this.getAttribute('src')
    if (src) options.src = src

    const poster = this.getAttribute('poster')
    if (poster) options.poster = poster

    if (this.hasAttribute('autoplay')) options.autoplay = true
    if (this.hasAttribute('loop')) options.loop = true
    if (this.hasAttribute('muted')) options.muted = true

    const volume = this.getAttribute('volume')
    if (volume) options.volume = parseFloat(volume)

    const rate = this.getAttribute('playback-rate')
    if (rate) options.playbackRate = parseFloat(rate)

    const preload = this.getAttribute('preload')
    if (preload) options.preload = preload as PlayerOptions['preload']

    if (this.hasAttribute('controls')) options.controls = true

    return options
  }

  private forwardEvents(): void {
    if (!this._player) return

    const events: (keyof PlayerEventMap)[] = [
      'play', 'pause', 'playing', 'waiting', 'ended',
      'timeupdate', 'durationchange', 'volumechange',
      'fullscreenchange', 'pipchange', 'error',
      'loadstart', 'loadeddata', 'loadedmetadata',
      'canplay', 'canplaythrough', 'seeking', 'seeked',
      'ratechange', 'qualitychange', 'statechange',
      'availabilitychange',
    ]

    for (const event of events) {
      this._player.on(event, ((...args: unknown[]) => {
        this.dispatchEvent(new CustomEvent(event, {
          detail: args.length === 1 ? args[0] : args,
          bubbles: true,
          composed: true,
        }))
      }) as any)
    }
  }
}

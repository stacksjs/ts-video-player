/**
 * ts-video-player <video-player> Custom Element
 *
 * The root element that wraps the Player class.
 *
 * @module elements/video-player
 */

import { Player } from '../player'
import type { DRMConfig, PlayerOptions, PlayerEventMap, Src, TextTrackSource } from '../types'

const OBSERVED_ATTRS = ['src', 'poster', 'autoplay', 'loop', 'muted', 'controls', 'volume', 'playback-rate', 'preload', 'playsinline', 'crossorigin', 'controlslist', 'disable-picture-in-picture'] as const

import { HTMLElementBase } from './base'

export class VideoPlayerElement extends HTMLElementBase {
  private _player: Player | null = null
  private _container: HTMLElement | null = null
  private _disconnectId = 0

  static get observedAttributes(): string[] {
    return [...OBSERVED_ATTRS]
  }

  get player(): Player | null {
    return this._player
  }

  connectedCallback(): void {
    this._disconnectId++
    if (this._player) return

    // Create shadow DOM
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' })

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
    if (this.hasAttribute('keep-alive')) return
    const disconnectId = ++this._disconnectId
    queueMicrotask(() => {
      if (this.isConnected || disconnectId !== this._disconnectId) return
      this._player?.destroy()
      this._player = null
      this._container = null
      this.shadowRoot?.replaceChildren()
    })
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

    const config = this.readSourceConfig()
    if (config.sources?.length) options.src = config.sources
    if (config.tracks?.length) options.tracks = config.tracks

    const src = this.getAttribute('src')
    if (src && !options.src) options.src = config.drm ? { src, type: 'application/dash+xml', drm: config.drm } : src

    const poster = this.getAttribute('poster')
    if (poster) options.poster = poster

    const title = this.getAttribute('title')
    if (title) options.title = title

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
    options.playsinline = this.getAttribute('playsinline') !== 'false'

    const crossorigin = this.getAttribute('crossorigin')
    if (crossorigin !== null) options.crossorigin = crossorigin as PlayerOptions['crossorigin']

    const controlsList = this.getAttribute('controlslist')
    if (controlsList) options.controlsList = controlsList.split(/\s+/) as PlayerOptions['controlsList']
    options.disablePictureInPicture = this.hasAttribute('disable-picture-in-picture')

    return options
  }

  private readSourceConfig(): { sources?: Src[], drm?: DRMConfig, tracks?: TextTrackSource[] } {
    const script = this.querySelector('script[type="application/json"][data-media-config]')
    const value = this.getAttribute('data-media-config')?.trim() || script?.textContent?.trim()
    if (!value) return {}
    if (value.length > 65_536) throw new TypeError('Media player configuration is too large')
    try {
      const parsed = JSON.parse(value) as { sources?: unknown, drm?: unknown, tracks?: unknown }
      if (parsed.sources !== undefined && (!Array.isArray(parsed.sources) || parsed.sources.some(source => !source || typeof source !== 'object' || typeof (source as { src?: unknown }).src !== 'string'))) {
        throw new TypeError('Media player sources are invalid')
      }
      const trackKinds = new Set(['subtitles', 'captions', 'descriptions', 'chapters', 'metadata'])
      if (parsed.tracks !== undefined && (!Array.isArray(parsed.tracks) || parsed.tracks.some(track => !track || typeof track !== 'object' || typeof (track as { src?: unknown }).src !== 'string' || !trackKinds.has(String((track as { kind?: unknown }).kind))))) {
        throw new TypeError('Media player tracks are invalid')
      }
      return { sources: parsed.sources as Src[] | undefined, drm: parsed.drm as DRMConfig | undefined, tracks: parsed.tracks as TextTrackSource[] | undefined }
    }
    catch (error) {
      if (error instanceof TypeError) throw error
      throw new TypeError('Media player configuration is invalid JSON')
    }
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

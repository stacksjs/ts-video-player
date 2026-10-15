/**
 * ts-video-player Base Provider
 *
 * Abstract base class for media providers.
 *
 * @module providers/base
 */

import type {
  Provider,
  ProviderType,
  Src,
  PlayerOptions,
  ProviderEventMap,
  VideoQuality,
  AudioTrack,
  TextTrack,
  MediaError,
  FeatureAvailability,
} from '../types'
import { EventEmitter, onFullscreenChange } from '../core/events'
import {
  detectVolumeAvailability,
  detectFullscreenAvailability,
  detectPipAvailability,
  enterFullscreen as fsEnter,
  exitFullscreen as fsExit,
  enterPiP as pipEnter,
  exitPiP as pipExit,
} from '../core/features'

/**
 * Abstract base provider implementation
 */
export abstract class BaseProvider implements Provider {
  abstract readonly name: string
  abstract readonly type: ProviderType

  protected container: HTMLElement | null = null
  protected options: PlayerOptions = {}
  protected events: EventEmitter<ProviderEventMap> = new EventEmitter<ProviderEventMap>()
  protected _ready = false

  get mediaElement(): HTMLVideoElement | HTMLAudioElement | HTMLIFrameElement | null {
    return null
  }

  get ready(): boolean {
    return this._ready
  }

  // === Lifecycle ===

  async setup(container: HTMLElement, options: PlayerOptions): Promise<void> {
    this.container = container
    this.options = options
    await this.initialize()
    this._ready = true
    this.events.emit('ready')
  }

  protected abstract initialize(): Promise<void>

  destroy(): void {
    this._ready = false
    this.stopEmbedFullscreen?.()
    this.stopEmbedFullscreen = null
    this.cleanup()
    this.events.removeAllListeners()
  }

  protected abstract cleanup(): void

  // === Loading ===

  abstract load(src: Src | Src[]): Promise<void>
  abstract canPlay(src: Src): boolean

  // === Playback ===

  abstract play(): Promise<void>
  abstract pause(): void

  stop(): void {
    this.pause()
    this.seekTo(0)
  }

  // === Seeking ===

  abstract seekTo(time: number): void
  abstract getCurrentTime(): number
  abstract getDuration(): number

  // === Volume ===

  abstract setVolume(volume: number): void
  abstract getVolume(): number
  abstract setMuted(muted: boolean): void
  abstract getMuted(): boolean

  // === Playback Rate ===

  abstract setPlaybackRate(rate: number): void
  abstract getPlaybackRate(): number

  // === Quality ===

  getQualities(): VideoQuality[] {
    return []
  }

  setQuality(_quality: VideoQuality | 'auto'): void {
    // Override in subclass if supported
  }

  // === Tracks ===

  getTextTracks(): TextTrack[] {
    return []
  }

  setTextTrackMode(_trackId: string, _mode: 'disabled' | 'hidden' | 'showing'): void {
    // Override in subclass if supported
  }

  getAudioTracks(): AudioTrack[] {
    return []
  }

  setAudioTrack(_trackId: string): void {
    // Override in subclass if supported
  }

  // === Feature Availability ===

  private stopEmbedFullscreen: (() => void) | null = null

  /**
   * What an embedded player (YouTube, Vimeo) can do, said once it is ready.
   *
   * The native-media providers say it on loadedmetadata; the embeds said
   * nothing, so fullscreen stayed "unavailable" and its button disabled,
   * though the player can fill the screen like any other. Fullscreen is the
   * container's own (the player's controls come along); picture in picture
   * is the embed's business. Also follows the document into and out of
   * fullscreen, which only the native providers did.
   */
  protected announceEmbedFeatures(): void {
    // Nothing to measure without a page (server rendering, tests).
    if (typeof document === 'undefined' || typeof HTMLMediaElement === 'undefined') return
    const fullscreenAvailability = this.getFeatureAvailability('fullscreen')
    const pipAvailability = this.getFeatureAvailability('pip')
    const volumeAvailability = this.getFeatureAvailability('volume')
    this.events.emit('statechange', {
      canFullscreen: fullscreenAvailability === 'available',
      canPictureInPicture: pipAvailability === 'available',
      fullscreenAvailability,
      pipAvailability,
      volumeAvailability,
    })
    this.events.emit('availabilitychange', 'fullscreen', fullscreenAvailability)
    this.events.emit('availabilitychange', 'pip', pipAvailability)
    this.events.emit('availabilitychange', 'volume', volumeAvailability)
    this.stopEmbedFullscreen ??= onFullscreenChange(fullscreen => this.events.emit('fullscreenchange', fullscreen))
  }

  getFeatureAvailability(feature: 'volume' | 'fullscreen' | 'pip'): FeatureAvailability {
    // Only pass media element if it's actually an HTMLMediaElement (not an iframe)
    const el = this.mediaElement
    const media = el instanceof HTMLMediaElement ? el : null
    const video = el instanceof HTMLVideoElement ? el : null

    switch (feature) {
      case 'volume':
        // Iframe providers (YouTube/Vimeo) handle volume via their own API
        return el && !(el instanceof HTMLMediaElement) ? 'available' : detectVolumeAvailability(media)
      case 'fullscreen':
        return detectFullscreenAvailability(this.container, video)
      case 'pip':
        // PiP is not available for iframe embeds
        return el && !(el instanceof HTMLMediaElement) ? 'unsupported' : detectPipAvailability(video)
      default:
        return 'unsupported'
    }
  }

  // === Fullscreen ===

  async enterFullscreen(): Promise<void> {
    await fsEnter(this.container, this.mediaElement as HTMLMediaElement | null)
  }

  async exitFullscreen(): Promise<void> {
    await fsExit(this.mediaElement as HTMLMediaElement | null)
  }

  protected getFullscreenElement(): HTMLElement | null {
    return this.container
  }

  // === Picture-in-Picture ===

  async enterPiP(): Promise<void> {
    const media = this.mediaElement as HTMLMediaElement | null
    if (!media) return
    await pipEnter(media)
  }

  async exitPiP(): Promise<void> {
    await pipExit(this.mediaElement as HTMLMediaElement | null)
  }

  // === Events ===

  on<K extends keyof ProviderEventMap>(event: K, handler: ProviderEventMap[K]): void {
    this.events.on(event, handler)
  }

  off<K extends keyof ProviderEventMap>(event: K, handler: ProviderEventMap[K]): void {
    this.events.off(event, handler)
  }

  // === Helpers ===

  protected emitError(code: number, message: string, details?: unknown): void {
    const error: MediaError = { code, message, details }
    this.events.emit('error', error)
  }
}

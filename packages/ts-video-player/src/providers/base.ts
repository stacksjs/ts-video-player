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
} from '../types'
import { EventEmitter } from '../core/events'

/**
 * Abstract base provider implementation
 */
export abstract class BaseProvider implements Provider {
  abstract readonly name: string
  abstract readonly type: ProviderType

  protected container: HTMLElement | null = null
  protected options: PlayerOptions = {}
  protected events = new EventEmitter<ProviderEventMap>()
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
    this.cleanup()
    this.events.removeAllListeners()
  }

  protected abstract cleanup(): void

  // === Loading ===

  abstract load(src: Src): Promise<void>
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

  // === Fullscreen ===

  async enterFullscreen(): Promise<void> {
    const el = this.getFullscreenElement()
    if (!el) return

    if (el.requestFullscreen) {
      await el.requestFullscreen()
    } else if ((el as any).webkitRequestFullscreen) {
      await (el as any).webkitRequestFullscreen()
    } else if ((el as any).mozRequestFullScreen) {
      await (el as any).mozRequestFullScreen()
    } else if ((el as any).msRequestFullscreen) {
      await (el as any).msRequestFullscreen()
    }
  }

  async exitFullscreen(): Promise<void> {
    if (document.exitFullscreen) {
      await document.exitFullscreen()
    } else if ((document as any).webkitExitFullscreen) {
      await (document as any).webkitExitFullscreen()
    } else if ((document as any).mozCancelFullScreen) {
      await (document as any).mozCancelFullScreen()
    } else if ((document as any).msExitFullscreen) {
      await (document as any).msExitFullscreen()
    }
  }

  protected getFullscreenElement(): HTMLElement | null {
    return this.container
  }

  // === Picture-in-Picture ===

  async enterPiP(): Promise<void> {
    const video = this.mediaElement as HTMLVideoElement
    if (video && 'requestPictureInPicture' in video) {
      await video.requestPictureInPicture()
    }
  }

  async exitPiP(): Promise<void> {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture()
    }
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

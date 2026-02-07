/**
 * ts-video-player HLS Provider
 *
 * HLS streaming provider using hls.js library.
 * Supports adaptive bitrate streaming, quality selection, and live streams.
 *
 * @module providers/hls
 */

import type {
  ProviderType,
  Src,
  HLSSource,
  PlayerOptions,
  VideoQuality,
  AudioTrack,
  TextTrack,
  TimeRange,
} from '../types'
import { BaseProvider } from './base'
import { MediaEventsNormalizer, onFullscreenChange, onPiPChange } from '../core/events'

// =============================================================================
// HLS Detection
// =============================================================================

/**
 * Check if source is an HLS source
 */
export function isHLSSource(src: Src): boolean {
  if (typeof src === 'string') {
    const url = src.toLowerCase()
    return url.endsWith('.m3u8') || url.includes('application/x-mpegurl') || url.includes('application/vnd.apple.mpegurl')
  }

  if (typeof src === 'object' && 'type' in src) {
    const type = (src as HLSSource).type?.toLowerCase() || ''
    return type === 'application/x-mpegurl' || type === 'application/vnd.apple.mpegurl'
  }

  return false
}

/**
 * Check if native HLS is supported (Safari, iOS)
 */
export function isNativeHLSSupported(): boolean {
  const video = document.createElement('video')
  return video.canPlayType('application/vnd.apple.mpegurl') !== ''
}

// =============================================================================
// HLS.js Types
// =============================================================================

interface HlsConfig {
  enableWorker?: boolean
  lowLatencyMode?: boolean
  backBufferLength?: number
  maxBufferLength?: number
  maxMaxBufferLength?: number
  startLevel?: number
  autoStartLoad?: boolean
  debug?: boolean
  [key: string]: unknown
}

interface HlsLevel {
  bitrate: number
  width: number
  height: number
  codecSet: string
  url: string[]
  audioCodec?: string
  videoCodec?: string
}

interface HlsAudioTrack {
  id: number
  name: string
  lang?: string
  default: boolean
  autoselect: boolean
  forced: boolean
  url: string
}

interface HlsSubtitleTrack {
  id: number
  name: string
  lang?: string
  default: boolean
  autoselect: boolean
  forced: boolean
  url: string
}

interface HlsEvents {
  MEDIA_ATTACHED: string
  MEDIA_DETACHED: string
  MANIFEST_LOADED: string
  MANIFEST_PARSED: string
  LEVEL_LOADED: string
  LEVEL_SWITCHED: string
  AUDIO_TRACK_LOADED: string
  AUDIO_TRACK_SWITCHED: string
  SUBTITLE_TRACK_LOADED: string
  SUBTITLE_TRACK_SWITCH: string
  FRAG_LOADED: string
  FRAG_BUFFERED: string
  ERROR: string
}

interface Hls {
  config: HlsConfig
  media: HTMLVideoElement | null
  currentLevel: number
  nextLevel: number
  loadLevel: number
  autoLevelEnabled: boolean
  levels: HlsLevel[]
  audioTracks: HlsAudioTrack[]
  audioTrack: number
  subtitleTracks: HlsSubtitleTrack[]
  subtitleTrack: number
  liveSyncPosition: number | null

  loadSource(src: string): void
  attachMedia(media: HTMLVideoElement): void
  detachMedia(): void
  startLoad(startPosition?: number): void
  stopLoad(): void
  recoverMediaError(): void
  destroy(): void
  on(event: string, handler: (...args: any[]) => void): void
  off(event: string, handler: (...args: any[]) => void): void
}

interface HlsStatic {
  new (config?: HlsConfig): Hls
  isSupported(): boolean
  Events: HlsEvents
  ErrorTypes: {
    NETWORK_ERROR: string
    MEDIA_ERROR: string
    KEY_SYSTEM_ERROR: string
    MUX_ERROR: string
    OTHER_ERROR: string
  }
  ErrorDetails: Record<string, string>
}

declare global {
  interface Window {
    Hls?: HlsStatic
  }
}

// =============================================================================
// HLS Provider
// =============================================================================

const HLS_CDN_DEFAULT = 'https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js'

/**
 * HLS streaming provider
 */
export class HLSProvider extends BaseProvider {
  readonly name = 'hls'
  readonly type: ProviderType = 'hls'

  private video: HTMLVideoElement | null = null
  private hls: Hls | null = null
  private eventsNormalizer: MediaEventsNormalizer | null = null
  private cleanupFullscreen: (() => void) | null = null
  private cleanupPiP: (() => void) | null = null
  private useNativeHLS = false
  private _qualities: VideoQuality[] = []
  private _audioTracks: AudioTrack[] = []
  private _textTracks: TextTrack[] = []
  private currentQualityIndex = -1 // -1 = auto

  get mediaElement(): HTMLVideoElement | null {
    return this.video
  }

  /**
   * Whether live sync is supported
   */
  get canLiveSync(): boolean {
    return !this.useNativeHLS && this.hls !== null
  }

  /**
   * Get HLS.js config
   */
  get hlsConfig(): HlsConfig {
    return this.hls?.config || {}
  }

  // === Lifecycle ===

  protected async initialize(): Promise<void> {
    if (!this.container) {
      throw new Error('Container element is required')
    }

    // Create video element
    this.video = document.createElement('video')
    this.video.className = 'ts-video-player__media'

    // Set attributes
    if (this.options.autoplay) this.video.autoplay = true
    if (this.options.loop) this.video.loop = true
    if (this.options.muted) this.video.muted = true
    if (this.options.playsinline) this.video.playsInline = true
    if (this.options.preload) this.video.preload = this.options.preload
    if (this.options.crossorigin) this.video.crossOrigin = this.options.crossorigin
    if (this.options.poster) this.video.poster = this.options.poster
    if (this.options.volume !== undefined) this.video.volume = this.options.volume

    this.container.appendChild(this.video)

    // Setup event normalization
    this.eventsNormalizer = new MediaEventsNormalizer(this.video, this.events)

    // Setup fullscreen/PiP listeners
    this.cleanupFullscreen = onFullscreenChange((fullscreen) => {
      this.events.emit('fullscreenchange', fullscreen)
    })

    this.cleanupPiP = onPiPChange(this.video, (pip) => {
      this.events.emit('pipchange', pip)
    })

    // Check for native HLS support
    this.useNativeHLS = isNativeHLSSupported()

    // Load HLS.js if needed
    if (!this.useNativeHLS) {
      await this.loadHLSLibrary()
    }

    // Emit dimensions and feature availability on load
    this.video.addEventListener('loadedmetadata', () => {
      const fullscreenAvailability = this.getFeatureAvailability('fullscreen')
      const pipAvailability = this.getFeatureAvailability('pip')
      const volumeAvailability = this.getFeatureAvailability('volume')
      this.events.emit('statechange', {
        videoWidth: this.video!.videoWidth,
        videoHeight: this.video!.videoHeight,
        aspectRatio: (this.video!.videoHeight > 0 ? this.video!.videoWidth / this.video!.videoHeight : 0) || 16 / 9,
        canFullscreen: fullscreenAvailability === 'available',
        canPictureInPicture: pipAvailability === 'available',
        fullscreenAvailability,
        pipAvailability,
        volumeAvailability,
      })
      this.events.emit('availabilitychange', 'fullscreen', fullscreenAvailability)
      this.events.emit('availabilitychange', 'pip', pipAvailability)
      this.events.emit('availabilitychange', 'volume', volumeAvailability)
    })
  }

  private async loadHLSLibrary(): Promise<void> {
    if (window.Hls) return

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = this.options.hlsCdnUrl || HLS_CDN_DEFAULT
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load HLS.js'))
      document.head.appendChild(script)
    })
  }

  protected cleanup(): void {
    this.eventsNormalizer?.destroy()
    this.cleanupFullscreen?.()
    this.cleanupPiP?.()

    if (this.hls) {
      this.hls.destroy()
      this.hls = null
    }

    if (this.video) {
      this.video.pause()
      this.video.removeAttribute('src')
      this.video.load()
      this.video.remove()
      this.video = null
    }

    this._qualities = []
    this._audioTracks = []
    this._textTracks = []
  }

  // === Loading ===

  canPlay(src: Src): boolean {
    return isHLSSource(src)
  }

  async load(src: Src): Promise<void> {
    if (!this.video) return

    const url = typeof src === 'string' ? src : (src as HLSSource).src

    if (this.useNativeHLS) {
      // Use native HLS (Safari/iOS)
      this.video.src = url
      this.video.load()
      return
    }

    // Use HLS.js
    if (!window.Hls) {
      await this.loadHLSLibrary()
    }

    if (!window.Hls?.isSupported()) {
      this.emitError(4, 'HLS is not supported in this browser')
      return
    }

    // Destroy existing instance
    if (this.hls) {
      this.hls.destroy()
    }

    // Build config
    const config: HlsConfig = {
      enableWorker: true,
      lowLatencyMode: false,
      ...this.options.hlsConfig,
    }

    // Create new HLS instance
    this.hls = new window.Hls(config)
    this.attachHLSEvents()

    // Attach and load
    this.hls.attachMedia(this.video)
    this.hls.loadSource(url)
  }

  private attachHLSEvents(): void {
    if (!this.hls || !window.Hls) return

    const Hls = window.Hls

    // Manifest loaded
    this.hls.on(Hls.Events.MANIFEST_PARSED, (_event: string, data: { levels: HlsLevel[] }) => {
      this.updateQualities(data.levels)

      // Auto-start load
      if (this.options.autoplay) {
        this.video?.play().catch(() => {})
      }
    })

    // Level switched
    this.hls.on(Hls.Events.LEVEL_SWITCHED, (_event: string, data: { level: number }) => {
      this.currentQualityIndex = data.level
      this.updateQualitySelection()
      this.events.emit('qualitychange', this._qualities[data.level] || null)
    })

    // Audio tracks loaded
    this.hls.on(Hls.Events.AUDIO_TRACK_LOADED, () => {
      this.updateAudioTracks()
    })

    // Audio track switched
    this.hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, () => {
      this.updateAudioTracks()
      const current = this._audioTracks.find((t) => t.selected)
      this.events.emit('audiotrackchange', current || null)
    })

    // Subtitle tracks loaded
    this.hls.on(Hls.Events.SUBTITLE_TRACK_LOADED, () => {
      this.updateTextTracks()
    })

    // Error handling
    this.hls.on(Hls.Events.ERROR, (_event: string, data: { type: string; details: string; fatal: boolean }) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // Try to recover from network error
            this.hls?.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            // Try to recover from media error
            this.hls?.recoverMediaError()
            break
          default:
            // Unrecoverable error
            this.emitError(5, `HLS fatal error: ${data.details}`, data)
            this.hls?.destroy()
            break
        }
      }
    })
  }

  private updateQualities(levels: HlsLevel[]): void {
    this._qualities = levels.map((level, index) => ({
      id: String(index),
      width: level.width,
      height: level.height,
      bitrate: level.bitrate,
      codec: level.codecSet || level.videoCodec || null,
      selected: index === this.currentQualityIndex,
    }))

    this.events.emit('statechange', { qualities: this._qualities })
  }

  private updateQualitySelection(): void {
    this._qualities = this._qualities.map((q, i) => ({
      ...q,
      selected: i === this.currentQualityIndex,
    }))
  }

  private updateAudioTracks(): void {
    if (!this.hls) return

    this._audioTracks = this.hls.audioTracks.map((track, index) => ({
      id: String(track.id),
      label: track.name || `Track ${index + 1}`,
      language: track.lang || '',
      kind: track.default ? 'main' : 'alternative',
      selected: index === this.hls!.audioTrack,
    }))

    this.events.emit('statechange', { audioTracks: this._audioTracks })
  }

  private updateTextTracks(): void {
    if (!this.hls) return

    this._textTracks = this.hls.subtitleTracks.map((track, index) => ({
      id: String(track.id),
      kind: 'subtitles' as const,
      label: track.name || `Subtitle ${index + 1}`,
      language: track.lang || '',
      mode: (index === this.hls!.subtitleTrack ? 'showing' : 'disabled') as TextTrack['mode'],
      cues: [],
    }))

    this.events.emit('statechange', { textTracks: this._textTracks })
  }

  // === Playback ===

  async play(): Promise<void> {
    if (!this.video) return
    try {
      await this.video.play()
    } catch (error) {
      if ((error as Error).name === 'NotAllowedError') {
        this.emitError(1, 'Playback was blocked. User interaction required.', error)
      } else {
        throw error
      }
    }
  }

  pause(): void {
    this.video?.pause()
  }

  // === Seeking ===

  seekTo(time: number): void {
    if (this.video) {
      this.video.currentTime = Math.max(0, Math.min(time, this.getDuration()))
    }
  }

  getCurrentTime(): number {
    return this.video?.currentTime || 0
  }

  getDuration(): number {
    return this.video?.duration || 0
  }

  /**
   * Sync to live edge (for live streams)
   */
  syncToLive(): void {
    if (this.hls?.liveSyncPosition != null) {
      this.seekTo(this.hls.liveSyncPosition)
    }
  }

  // === Volume ===

  setVolume(volume: number): void {
    if (this.video) {
      this.video.volume = Math.max(0, Math.min(1, volume))
    }
  }

  getVolume(): number {
    return this.video?.volume || 1
  }

  setMuted(muted: boolean): void {
    if (this.video) {
      this.video.muted = muted
    }
  }

  getMuted(): boolean {
    return this.video?.muted || false
  }

  // === Playback Rate ===

  setPlaybackRate(rate: number): void {
    if (this.video) {
      this.video.playbackRate = Math.max(0.25, Math.min(4, rate))
    }
  }

  getPlaybackRate(): number {
    return this.video?.playbackRate || 1
  }

  // === Quality ===

  getQualities(): VideoQuality[] {
    return this._qualities
  }

  setQuality(quality: VideoQuality | 'auto'): void {
    if (!this.hls) return

    if (quality === 'auto') {
      this.hls.currentLevel = -1 // Auto
      this.currentQualityIndex = -1
      this.events.emit('statechange', { autoQuality: true })
    } else {
      const index = parseInt(quality.id, 10)
      if (!isNaN(index) && index >= 0 && index < this._qualities.length) {
        this.hls.currentLevel = index
        this.currentQualityIndex = index
        this.events.emit('statechange', { autoQuality: false })
      }
    }
  }

  // === Audio Tracks ===

  getAudioTracks(): AudioTrack[] {
    return this._audioTracks
  }

  setAudioTrack(trackId: string): void {
    if (!this.hls) return

    const index = parseInt(trackId, 10)
    if (!isNaN(index) && index >= 0 && index < this.hls.audioTracks.length) {
      this.hls.audioTrack = index
    }
  }

  // === Text Tracks ===

  getTextTracks(): TextTrack[] {
    return this._textTracks
  }

  setTextTrackMode(trackId: string, mode: 'disabled' | 'hidden' | 'showing'): void {
    if (!this.hls) return

    if (mode === 'showing') {
      const index = parseInt(trackId, 10)
      if (!isNaN(index)) {
        this.hls.subtitleTrack = index
      }
    } else {
      this.hls.subtitleTrack = -1
    }

    this.updateTextTracks()
    const current = this._textTracks.find((t) => t.mode === 'showing')
    this.events.emit('texttrackchange', current || null)
  }

}

/**
 * HLS Provider Loader
 */
export const hlsLoader = {
  name: 'hls',
  type: 'hls' as ProviderType,

  canPlay(src: Src): boolean {
    return isHLSSource(src)
  },

  mediaType(): 'video' {
    return 'video'
  },

  preconnect(): string[] {
    return ['https://cdn.jsdelivr.net']
  },

  async load(container: HTMLElement, options: PlayerOptions): Promise<HLSProvider> {
    const provider = new HLSProvider()
    await provider.setup(container, options)
    return provider
  },
}

/**
 * DASH Provider
 *
 * Media provider for MPEG-DASH streaming using dash.js.
 *
 * @module providers/dash
 */

import { BaseProvider } from './base'
import type {
  Src,
  ProviderLoader,
  VideoQuality,
  AudioTrack,
  TextTrack,
  PlayerOptions,
} from '../types'

// =============================================================================
// Types
// =============================================================================

export interface DASHSource {
  src: string
  type: 'dash'
  /** DRM configuration */
  drm?: DRMConfig
}

export interface DRMConfig {
  /** Widevine license URL */
  widevine?: {
    url: string
    headers?: Record<string, string>
  }
  /** PlayReady license URL */
  playready?: {
    url: string
    headers?: Record<string, string>
  }
  /** FairPlay license URL (Safari only) */
  fairplay?: {
    url: string
    certificateUrl: string
    headers?: Record<string, string>
  }
}

export interface DASHProviderConfig {
  /** Custom dash.js settings */
  dashConfig?: Record<string, any>
  /** Enable low latency mode */
  lowLatency?: boolean
  /** Retry parameters */
  retry?: {
    maxAttempts: number
    delay: number
  }
}

// =============================================================================
// DASH.js Loading
// =============================================================================

let dashjs: any = null
let dashLoading: Promise<any> | null = null

/**
 * Load dash.js from CDN
 */
async function loadDashJS(): Promise<any> {
  if (dashjs) return dashjs

  if (dashLoading) return dashLoading

  dashLoading = new Promise((resolve, reject) => {
    // Check if already loaded globally
    if (typeof window !== 'undefined' && (window as any).dashjs) {
      dashjs = (window as any).dashjs
      resolve(dashjs)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.dashjs.org/latest/dash.all.min.js'
    script.async = true

    script.onload = () => {
      dashjs = (window as any).dashjs
      resolve(dashjs)
    }

    script.onerror = () => {
      reject(new Error('Failed to load dash.js'))
    }

    document.head.appendChild(script)
  })

  return dashLoading
}

// =============================================================================
// Source Detection
// =============================================================================

/**
 * Check if source is a DASH manifest
 */
export function isDASHSource(src: Src): src is DASHSource | string {
  if (typeof src === 'object' && 'type' in src && src.type === 'dash') {
    return true
  }

  if (typeof src === 'string') {
    return src.includes('.mpd') || src.includes('manifest(format=mpd')
  }

  return false
}

// =============================================================================
// DASH Provider
// =============================================================================

export class DASHProvider extends BaseProvider {
  readonly name = 'dash'
  readonly type = 'dash' as const

  private dash: any = null
  private video: HTMLVideoElement | null = null
  private source: DASHSource | null = null
  private config: DASHProviderConfig = {}
  private _volume = 1
  private _muted = false
  private _playbackRate = 1

  get mediaElement(): HTMLVideoElement | null {
    return this.video
  }

  /**
   * Initialize the provider
   */
  protected async initialize(): Promise<void> {
    // Create video element
    this.video = document.createElement('video')
    this.video.style.width = '100%'
    this.video.style.height = '100%'
    this.video.style.display = 'block'

    // Load dash.js
    await loadDashJS()

    // Create player instance
    this.dash = dashjs.MediaPlayer().create()

    // Apply custom config from options
    if (this.options.dashConfig) {
      this.config.dashConfig = this.options.dashConfig as Record<string, any>
    }

    if (this.config.dashConfig) {
      Object.entries(this.config.dashConfig).forEach(([key, value]) => {
        this.dash.updateSettings({ [key]: value })
      })
    }

    // Enable low latency mode
    if (this.config.lowLatency) {
      this.dash.updateSettings({
        streaming: {
          lowLatencyEnabled: true,
          liveDelay: 3,
          liveCatchUpMinDrift: 0.05,
          liveCatchUpPlaybackRate: 0.5,
        },
      })
    }

    // Attach dash.js events
    this.attachDashEvents()

    // Append to container
    if (this.container) {
      this.container.appendChild(this.video)
    }

    // Add video element events
    this.attachVideoEvents()
  }

  /**
   * Attach video element event listeners
   */
  private attachVideoEvents(): void {
    if (!this.video) return

    this.video.addEventListener('play', () => this.events.emit('play'))
    this.video.addEventListener('pause', () => this.events.emit('pause'))
    this.video.addEventListener('ended', () => this.events.emit('ended'))
    this.video.addEventListener('timeupdate', () => this.events.emit('timeupdate', this.getCurrentTime()))
    this.video.addEventListener('durationchange', () => this.events.emit('durationchange', this.getDuration()))
    this.video.addEventListener('volumechange', () => {
      this.events.emit('volumechange', this.getVolume(), this.getMuted())
    })
    this.video.addEventListener('waiting', () => this.events.emit('waiting'))
    this.video.addEventListener('playing', () => this.events.emit('playing'))
    this.video.addEventListener('seeking', () => this.events.emit('seeking'))
    this.video.addEventListener('seeked', () => this.events.emit('seeked'))
    this.video.addEventListener('progress', () => {
      const ranges: Array<{ start: number, end: number }> = []
      for (let i = 0; i < this.video!.buffered.length; i++) {
        ranges.push({
          start: this.video!.buffered.start(i),
          end: this.video!.buffered.end(i),
        })
      }
      this.events.emit('progress', ranges)
    })
    this.video.addEventListener('loadedmetadata', () => this.events.emit('loadedmetadata'))
    this.video.addEventListener('loadeddata', () => this.events.emit('loadeddata'))
    this.video.addEventListener('canplay', () => this.events.emit('canplay'))
    this.video.addEventListener('canplaythrough', () => this.events.emit('canplaythrough'))
    this.video.addEventListener('ratechange', () => this.events.emit('ratechange', this.getPlaybackRate()))
  }

  /**
   * Attach dash.js event listeners
   */
  private attachDashEvents(): void {
    if (!dashjs) return

    const MediaPlayer = dashjs.MediaPlayer

    // Quality change
    this.dash.on(MediaPlayer.events.QUALITY_CHANGE_RENDERED, () => {
      this.events.emit('qualitychange', this.getQualities().find(q => q.selected) || null)
    })

    // Manifest loaded
    this.dash.on(MediaPlayer.events.MANIFEST_LOADED, () => {
      // Qualities and tracks are now available
    })

    // Error handling
    this.dash.on(MediaPlayer.events.ERROR, (event: any) => {
      this.emitError(
        event.error?.code || 0,
        event.error?.message || 'DASH playback error',
        event.error
      )
    })
  }

  /**
   * Configure DRM protection
   */
  private configureDRM(drm: DRMConfig): void {
    const protectionData: Record<string, any> = {}

    if (drm.widevine) {
      protectionData['com.widevine.alpha'] = {
        serverURL: drm.widevine.url,
        httpRequestHeaders: drm.widevine.headers,
      }
    }

    if (drm.playready) {
      protectionData['com.microsoft.playready'] = {
        serverURL: drm.playready.url,
        httpRequestHeaders: drm.playready.headers,
      }
    }

    if (drm.fairplay) {
      protectionData['com.apple.fps.1_0'] = {
        serverURL: drm.fairplay.url,
        serverCertificateURL: drm.fairplay.certificateUrl,
        httpRequestHeaders: drm.fairplay.headers,
      }
    }

    this.dash.setProtectionData(protectionData)
  }

  /**
   * Load a source
   */
  async load(src: Src): Promise<void> {
    if (!this.video || !this.dash) return

    // Parse source
    if (typeof src === 'string') {
      this.source = { src, type: 'dash' }
    }
    else if (isDASHSource(src)) {
      this.source = src as DASHSource
    }
    else {
      throw new Error('Invalid DASH source')
    }

    // Configure DRM if provided
    if (this.source.drm) {
      this.configureDRM(this.source.drm)
    }

    // Initialize with video element and source
    this.dash.initialize(this.video, this.source.src, false)
  }

  /**
   * Check if source can be played
   */
  canPlay(src: Src): boolean {
    return isDASHSource(src)
  }

  /**
   * Cleanup the provider
   */
  protected cleanup(): void {
    if (this.dash) {
      this.dash.reset()
      this.dash = null
    }

    if (this.video) {
      this.video.remove()
      this.video = null
    }

    this.source = null
  }

  // ==========================================================================
  // Playback
  // ==========================================================================

  async play(): Promise<void> {
    if (this.video) {
      await this.video.play()
    }
  }

  pause(): void {
    if (this.video) {
      this.video.pause()
    }
  }

  // ==========================================================================
  // Seeking
  // ==========================================================================

  seekTo(time: number): void {
    if (this.video) {
      this.video.currentTime = time
    }
  }

  getCurrentTime(): number {
    return this.video?.currentTime || 0
  }

  getDuration(): number {
    return this.video?.duration || 0
  }

  // ==========================================================================
  // Volume
  // ==========================================================================

  setVolume(volume: number): void {
    this._volume = Math.max(0, Math.min(1, volume))
    if (this.video) {
      this.video.volume = this._volume
    }
  }

  getVolume(): number {
    return this.video?.volume ?? this._volume
  }

  setMuted(muted: boolean): void {
    this._muted = muted
    if (this.video) {
      this.video.muted = muted
    }
  }

  getMuted(): boolean {
    return this.video?.muted ?? this._muted
  }

  // ==========================================================================
  // Playback Rate
  // ==========================================================================

  setPlaybackRate(rate: number): void {
    this._playbackRate = rate
    if (this.video) {
      this.video.playbackRate = rate
    }
  }

  getPlaybackRate(): number {
    return this.video?.playbackRate ?? this._playbackRate
  }

  // ==========================================================================
  // Live
  // ==========================================================================

  get isLive(): boolean {
    return this.dash?.isDynamic() ?? false
  }

  get liveLatency(): number {
    return this.dash?.getCurrentLiveLatency() ?? 0
  }

  get canLiveSync(): boolean {
    return this.isLive
  }

  syncToLive(): void {
    if (this.dash && this.isLive) {
      this.dash.seekToOriginalLive()
    }
  }

  // ==========================================================================
  // Quality
  // ==========================================================================

  getQualities(): VideoQuality[] {
    if (!this.dash) return []

    const bitrateInfoList = this.dash.getBitrateInfoListFor('video')
    if (!bitrateInfoList) return []

    const currentIndex = this.dash.getQualityFor('video')

    return bitrateInfoList.map((info: any, index: number) => ({
      id: `${index}`,
      label: `${info.height}p`,
      width: info.width,
      height: info.height,
      bitrate: info.bitrate,
      selected: index === currentIndex,
    }))
  }

  setQuality(quality: VideoQuality | 'auto'): void {
    if (!this.dash) return

    if (quality === 'auto') {
      this.dash.updateSettings({
        streaming: { abr: { autoSwitchBitrate: { video: true } } },
      })
    }
    else {
      const index = Number.parseInt(quality.id, 10)
      if (!Number.isNaN(index)) {
        this.dash.updateSettings({
          streaming: { abr: { autoSwitchBitrate: { video: false } } },
        })
        this.dash.setQualityFor('video', index)
      }
    }
  }

  get isAutoQuality(): boolean {
    if (!this.dash) return true
    const settings = this.dash.getSettings()
    return settings?.streaming?.abr?.autoSwitchBitrate?.video ?? true
  }

  // ==========================================================================
  // Audio Tracks
  // ==========================================================================

  getAudioTracks(): AudioTrack[] {
    if (!this.dash) return []

    const tracks = this.dash.getTracksFor('audio')
    if (!tracks) return []

    const currentTrack = this.dash.getCurrentTrackFor('audio')

    return tracks.map((track: any, index: number) => ({
      id: track.id || `${index}`,
      label: track.labels?.[0]?.text || track.lang || `Track ${index + 1}`,
      language: track.lang || '',
      kind: 'main' as const,
      selected: track === currentTrack,
    }))
  }

  setAudioTrack(trackId: string): void {
    if (!this.dash) return

    const tracks = this.dash.getTracksFor('audio')
    const track = tracks.find((t: any, i: number) => (t.id || `${i}`) === trackId)

    if (track) {
      this.dash.setCurrentTrack(track)
    }
  }

  // ==========================================================================
  // Text Tracks
  // ==========================================================================

  getTextTracks(): TextTrack[] {
    if (!this.dash) return []

    const tracks = this.dash.getTracksFor('text')
    if (!tracks) return []

    const currentTrack = this.dash.getCurrentTrackFor('text')

    return tracks.map((track: any, index: number) => ({
      id: track.id || `${index}`,
      label: track.labels?.[0]?.text || track.lang || `Subtitle ${index + 1}`,
      language: track.lang || '',
      kind: (track.kind || 'subtitles') as TextTrack['kind'],
      mode: (track === currentTrack ? 'showing' : 'disabled') as TextTrack['mode'],
      cues: [],
    }))
  }

  setTextTrackMode(trackId: string, mode: 'disabled' | 'hidden' | 'showing'): void {
    if (!this.dash) return

    if (mode === 'disabled') {
      this.dash.enableText(false)
      return
    }

    const tracks = this.dash.getTracksFor('text')
    const track = tracks.find((t: any, i: number) => (t.id || `${i}`) === trackId)

    if (track) {
      this.dash.setCurrentTrack(track)
      this.dash.enableText(mode === 'showing')
    }
  }
}

// =============================================================================
// Provider Loader
// =============================================================================

export const dashLoader: ProviderLoader = {
  name: 'dash',
  type: 'dash',

  canPlay(src: Src): boolean {
    return isDASHSource(src)
  },

  mediaType(): 'video' {
    return 'video'
  },

  async load(container: HTMLElement, options: PlayerOptions): Promise<DASHProvider> {
    const provider = new DASHProvider()
    await provider.setup(container, options)
    return provider
  },

  preconnect(): string[] {
    return ['https://cdn.dashjs.org']
  },
}

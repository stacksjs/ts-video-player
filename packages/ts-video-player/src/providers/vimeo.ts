/**
 * ts-video-player Vimeo Provider
 *
 * Vimeo embed provider using the Vimeo Player API.
 *
 * @module providers/vimeo
 */

import type { ProviderType, Src, VimeoSource, PlayerOptions, VideoQuality } from '../types'
import { BaseProvider } from './base'

// =============================================================================
// Vimeo URL Parsing
// =============================================================================

/**
 * Vimeo URL patterns
 */
const VIMEO_PATTERNS = [
  /vimeo\.com\/(\d+)/,
  /vimeo\.com\/video\/(\d+)/,
  /player\.vimeo\.com\/video\/(\d+)/,
  /vimeo\.com\/channels\/[\w]+\/(\d+)/,
  /vimeo\.com\/groups\/[\w]+\/videos\/(\d+)/,
]

/**
 * Extract Vimeo video ID from URL
 */
export function extractVimeoId(url: string): string | null {
  for (const pattern of VIMEO_PATTERNS) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

/**
 * Extract hash for private videos
 */
export function extractVimeoHash(url: string): string | null {
  // Format: vimeo.com/123456789/abcdef123
  const match = url.match(/vimeo\.com\/\d+\/([a-f0-9]+)/)
  return match ? match[1] : null
}

/**
 * Check if source is a Vimeo source
 */
export function isVimeoSource(src: Src): boolean {
  if (typeof src === 'string') {
    return extractVimeoId(src) !== null
  }

  if (typeof src === 'object' && 'type' in src) {
    return (src as VimeoSource).type === 'vimeo'
  }

  return false
}

/**
 * Parse Vimeo source
 */
function parseVimeoSource(src: Src): { videoId: string; hash?: string } | null {
  if (typeof src === 'string') {
    const videoId = extractVimeoId(src)
    if (!videoId) return null
    return { videoId, hash: extractVimeoHash(src) || undefined }
  }

  if (typeof src === 'object' && 'type' in src && (src as VimeoSource).type === 'vimeo') {
    const vSrc = src as VimeoSource
    return {
      videoId: vSrc.videoId || extractVimeoId(vSrc.src) || '',
      hash: vSrc.hash,
    }
  }

  return null
}

// =============================================================================
// Vimeo Player Types
// =============================================================================

interface VimeoPlayerOptions {
  id?: number
  url?: string
  autopause?: boolean
  autoplay?: boolean
  background?: boolean
  byline?: boolean
  color?: string
  controls?: boolean
  dnt?: boolean
  height?: number
  loop?: boolean
  maxheight?: number
  maxwidth?: number
  muted?: boolean
  playsinline?: boolean
  portrait?: boolean
  responsive?: boolean
  speed?: boolean
  title?: boolean
  transparent?: boolean
  width?: number
}

interface VimeoPlayer {
  ready(): Promise<void>
  play(): Promise<void>
  pause(): Promise<void>
  unload(): Promise<void>
  destroy(): Promise<void>
  getCurrentTime(): Promise<number>
  setCurrentTime(seconds: number): Promise<number>
  getDuration(): Promise<number>
  getVolume(): Promise<number>
  setVolume(volume: number): Promise<number>
  getMuted(): Promise<boolean>
  setMuted(muted: boolean): Promise<boolean>
  getLoop(): Promise<boolean>
  setLoop(loop: boolean): Promise<boolean>
  getPlaybackRate(): Promise<number>
  setPlaybackRate(rate: number): Promise<number>
  getPaused(): Promise<boolean>
  getEnded(): Promise<boolean>
  getVideoTitle(): Promise<string>
  getVideoWidth(): Promise<number>
  getVideoHeight(): Promise<number>
  getVideoId(): Promise<number>
  getVideoUrl(): Promise<string>
  getQualities(): Promise<Array<{ id: string; label: string; active: boolean }>>
  setQuality(quality: string): Promise<string>
  getTextTracks(): Promise<Array<{ label: string; language: string; kind: string; mode: string }>>
  enableTextTrack(language: string, kind?: string): Promise<void>
  disableTextTrack(): Promise<void>
  on(event: string, callback: (...args: any[]) => void): void
  off(event: string, callback?: (...args: any[]) => void): void
  getBuffered(): Promise<Array<{ start: number; end: number }>>
  getChapters(): Promise<Array<{ title: string; startTime: number; index: number }>>
}

interface VimeoStatic {
  Player: new (element: HTMLElement | HTMLIFrameElement, options?: VimeoPlayerOptions) => VimeoPlayer
}

declare global {
  interface Window {
    Vimeo?: VimeoStatic
  }
}

// =============================================================================
// Vimeo Provider
// =============================================================================

const VIMEO_SDK_URL = 'https://player.vimeo.com/api/player.js'

/**
 * Vimeo embed provider
 */
export class VimeoProvider extends BaseProvider {
  readonly name = 'vimeo'
  readonly type: ProviderType = 'vimeo'

  private container_el: HTMLElement | null = null
  private player: VimeoPlayer | null = null
  private iframe: HTMLIFrameElement | null = null
  private timeUpdateInterval: ReturnType<typeof setInterval> | null = null
  private _qualities: VideoQuality[] = []
  private _duration = 0
  private _paused = true

  get mediaElement(): HTMLIFrameElement | null {
    return this.iframe
  }

  // === Lifecycle ===

  protected async initialize(): Promise<void> {
    if (!this.container) {
      throw new Error('Container element is required')
    }

    // Load Vimeo SDK
    await this.loadVimeoSDK()

    // Create container for Vimeo player
    this.container_el = document.createElement('div')
    this.container_el.className = 'ts-video-player__vimeo'
    this.container.appendChild(this.container_el)
  }

  private async loadVimeoSDK(): Promise<void> {
    if (window.Vimeo) return

    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${VIMEO_SDK_URL}"]`)) {
        const check = () => {
          if (window.Vimeo) resolve()
          else setTimeout(check, 100)
        }
        check()
        return
      }

      const script = document.createElement('script')
      script.src = VIMEO_SDK_URL
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Vimeo SDK'))
      document.head.appendChild(script)
    })
  }

  protected cleanup(): void {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval)
      this.timeUpdateInterval = null
    }

    this.player?.destroy()
    this.player = null
    this.iframe = null
    this.container_el?.remove()
    this.container_el = null
  }

  // === Loading ===

  canPlay(src: Src): boolean {
    return isVimeoSource(src)
  }

  async load(src: Src): Promise<void> {
    const parsed = parseVimeoSource(src)
    if (!parsed || !this.container_el) {
      this.emitError(2, 'Invalid Vimeo source')
      return
    }

    // Destroy existing player
    if (this.player) {
      await this.player.destroy()
      this.player = null
    }

    // Build player options
    const playerOptions: VimeoPlayerOptions = {
      id: parseInt(parsed.videoId, 10),
      autopause: false,
      autoplay: this.options.autoplay || false,
      controls: false, // We use our own controls
      loop: this.options.loop || false,
      muted: this.options.muted || false,
      playsinline: this.options.playsinline !== false,
      responsive: true,
      dnt: true, // Do Not Track
    }

    // Apply custom Vimeo params
    if (this.options.vimeoParams) {
      Object.assign(playerOptions, this.options.vimeoParams)
    }

    // Create player
    this.player = new window.Vimeo!.Player(this.container_el, playerOptions)

    // Wait for ready
    await this.player.ready()

    // Get iframe
    this.iframe = this.container_el.querySelector('iframe')
    if (this.iframe) {
      this.iframe.className = 'ts-video-player__media'
    }

    // Setup event listeners
    this.attachVimeoEvents()

    // Emit ready
    this.events.emit('loadedmetadata')
    this.events.emit('canplay')

    // Get duration
    this._duration = await this.player.getDuration()
    this.events.emit('durationchange', this._duration)

    // Get initial qualities
    await this.updateQualities()

    // Emit dimensions
    const [width, height] = await Promise.all([this.player.getVideoWidth(), this.player.getVideoHeight()])
    this.events.emit('statechange', {
      videoWidth: width,
      videoHeight: height,
      aspectRatio: width / height || 16 / 9,
      canFullscreen: true,
      canPictureInPicture: false,
    })
  }

  private attachVimeoEvents(): void {
    if (!this.player) return

    // Play
    this.player.on('play', () => {
      this._paused = false
      this.events.emit('play')
      this.events.emit('playing')
      this.events.emit('statechange', { paused: false, playing: true })
    })

    // Pause
    this.player.on('pause', () => {
      this._paused = true
      this.events.emit('pause')
      this.events.emit('statechange', { paused: true, playing: false })
    })

    // Ended
    this.player.on('ended', () => {
      this.events.emit('ended')
      this.events.emit('statechange', { ended: true, playing: false })
    })

    // Time update
    this.player.on('timeupdate', (data: { seconds: number }) => {
      this.events.emit('timeupdate', data.seconds)
    })

    // Seeking
    this.player.on('seeking', () => {
      this.events.emit('seeking')
    })

    this.player.on('seeked', () => {
      this.events.emit('seeked')
    })

    // Buffering
    this.player.on('bufferstart', () => {
      this.events.emit('waiting')
      this.events.emit('statechange', { waiting: true })
    })

    this.player.on('bufferend', () => {
      this.events.emit('statechange', { waiting: false })
    })

    // Progress
    this.player.on('progress', (data: { percent: number }) => {
      const buffered = [{ start: 0, end: data.percent * this._duration }]
      this.events.emit('progress', buffered)
    })

    // Volume
    this.player.on('volumechange', async () => {
      const [volume, muted] = await Promise.all([this.player!.getVolume(), this.player!.getMuted()])
      this.events.emit('volumechange', volume, muted)
    })

    // Playback rate
    this.player.on('playbackratechange', (data: { playbackRate: number }) => {
      this.events.emit('ratechange', data.playbackRate)
    })

    // Quality change
    this.player.on('qualitychange', async () => {
      await this.updateQualities()
      const current = this._qualities.find((q) => q.selected)
      this.events.emit('qualitychange', current || null)
    })

    // Error
    this.player.on('error', (error: { name: string; message: string }) => {
      this.emitError(5, error.message, error)
    })
  }

  private async updateQualities(): Promise<void> {
    if (!this.player) return

    try {
      const qualities = await this.player.getQualities()
      this._qualities = qualities.map((q, index) => {
        // Parse resolution from label (e.g., "1080p", "720p")
        const match = q.label.match(/(\d+)p/)
        const height = match ? parseInt(match[1], 10) : 0

        return {
          id: q.id,
          width: Math.round(height * (16 / 9)),
          height,
          bitrate: 0,
          selected: q.active,
        }
      })

      this.events.emit('statechange', { qualities: this._qualities })
    } catch {
      // Quality API not available for all videos
    }
  }

  // === Playback ===

  async play(): Promise<void> {
    try {
      await this.player?.play()
    } catch (error) {
      if ((error as Error).name === 'NotAllowedError') {
        this.emitError(1, 'Playback was blocked. User interaction required.', error)
      } else {
        throw error
      }
    }
  }

  pause(): void {
    this.player?.pause()
  }

  stop(): void {
    this.pause()
    this.seekTo(0)
  }

  // === Seeking ===

  seekTo(time: number): void {
    this.player?.setCurrentTime(time)
  }

  getCurrentTime(): number {
    // Sync call not available, return cached or 0
    return 0
  }

  getDuration(): number {
    return this._duration
  }

  // === Volume ===

  setVolume(volume: number): void {
    this.player?.setVolume(Math.max(0, Math.min(1, volume)))
  }

  getVolume(): number {
    return 1 // Async, return default
  }

  setMuted(muted: boolean): void {
    this.player?.setMuted(muted)
  }

  getMuted(): boolean {
    return false // Async, return default
  }

  // === Playback Rate ===

  setPlaybackRate(rate: number): void {
    this.player?.setPlaybackRate(rate)
  }

  getPlaybackRate(): number {
    return 1 // Async, return default
  }

  // === Quality ===

  getQualities(): VideoQuality[] {
    return this._qualities
  }

  setQuality(quality: VideoQuality | 'auto'): void {
    if (!this.player) return

    if (quality === 'auto') {
      this.player.setQuality('auto')
    } else {
      this.player.setQuality(quality.id)
    }
  }

  // === Text Tracks ===

  async enableTextTrack(language: string): Promise<void> {
    await this.player?.enableTextTrack(language)
  }

  async disableTextTrack(): Promise<void> {
    await this.player?.disableTextTrack()
  }

  // === Chapters ===

  async getChapters(): Promise<Array<{ title: string; startTime: number; index: number }>> {
    if (!this.player) return []
    try {
      return await this.player.getChapters()
    } catch {
      return []
    }
  }
}

/**
 * Vimeo Provider Loader
 */
export const vimeoLoader = {
  name: 'vimeo',
  type: 'vimeo' as ProviderType,

  canPlay(src: Src): boolean {
    return isVimeoSource(src)
  },

  mediaType(): 'video' {
    return 'video'
  },

  preconnect(): string[] {
    return ['https://player.vimeo.com', 'https://i.vimeocdn.com', 'https://f.vimeocdn.com']
  },

  async load(container: HTMLElement, options: PlayerOptions): Promise<VimeoProvider> {
    const provider = new VimeoProvider()
    await provider.setup(container, options)
    return provider
  },
}

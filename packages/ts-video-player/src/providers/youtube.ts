/**
 * ts-video-player YouTube Provider
 *
 * YouTube embed provider using the iframe API.
 *
 * @module providers/youtube
 */

import type { ProviderType, Src, YouTubeSource, PlayerOptions, VideoQuality } from '../types'
import { BaseProvider } from './base'

// =============================================================================
// YouTube URL Parsing
// =============================================================================

/**
 * YouTube URL patterns
 */
const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
]

/**
 * Extract YouTube video ID from URL
 */
export function extractYouTubeId(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

/**
 * Check if source is a YouTube source
 */
export function isYouTubeSource(src: Src): boolean {
  if (typeof src === 'string') {
    return extractYouTubeId(src) !== null
  }

  if (typeof src === 'object' && 'type' in src) {
    return (src as YouTubeSource).type === 'youtube'
  }

  return false
}

/**
 * Parse YouTube source
 */
function parseYouTubeSource(src: Src): { videoId: string; startTime?: number; endTime?: number } | null {
  if (typeof src === 'string') {
    const videoId = extractYouTubeId(src)
    if (!videoId) return null

    // Parse start/end time from URL params
    const url = new URL(src, 'https://youtube.com')
    const start = url.searchParams.get('t') || url.searchParams.get('start')
    const end = url.searchParams.get('end')

    return {
      videoId,
      startTime: start ? parseTime(start) : undefined,
      endTime: end ? parseTime(end) : undefined,
    }
  }

  if (typeof src === 'object' && 'type' in src && (src as YouTubeSource).type === 'youtube') {
    const ytSrc = src as YouTubeSource
    return {
      videoId: ytSrc.videoId || extractYouTubeId(ytSrc.src) || '',
      startTime: ytSrc.startTime,
      endTime: ytSrc.endTime,
    }
  }

  return null
}

/**
 * Parse time string (e.g., "1m30s", "90", "1:30")
 */
function parseTime(time: string): number {
  // Already a number in seconds
  if (/^\d+$/.test(time)) return parseInt(time, 10)

  // Format: 1m30s
  const match1 = time.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/)
  if (match1) {
    const h = parseInt(match1[1] || '0', 10)
    const m = parseInt(match1[2] || '0', 10)
    const s = parseInt(match1[3] || '0', 10)
    return h * 3600 + m * 60 + s
  }

  // Format: 1:30 or 1:30:00
  const parts = time.split(':').map((p) => parseInt(p, 10))
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]

  return 0
}

// =============================================================================
// YouTube API Types
// =============================================================================

interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  stopVideo(): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
  getCurrentTime(): number
  getDuration(): number
  setVolume(volume: number): void
  getVolume(): number
  mute(): void
  unMute(): void
  isMuted(): boolean
  setPlaybackRate(rate: number): void
  getPlaybackRate(): number
  getAvailablePlaybackRates(): number[]
  setPlaybackQuality(quality: string): void
  getPlaybackQuality(): string
  getAvailableQualityLevels(): string[]
  loadVideoById(options: { videoId: string; startSeconds?: number; endSeconds?: number }): void
  cueVideoById(options: { videoId: string; startSeconds?: number; endSeconds?: number }): void
  getIframe(): HTMLIFrameElement
  getPlayerState(): number
  destroy(): void
}

interface YTPlayerEvent {
  target: YTPlayer
  data: number
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          videoId?: string
          width?: number | string
          height?: number | string
          playerVars?: Record<string, string | number>
          events?: {
            onReady?: (event: YTPlayerEvent) => void
            onStateChange?: (event: YTPlayerEvent) => void
            onError?: (event: YTPlayerEvent) => void
            onPlaybackQualityChange?: (event: YTPlayerEvent) => void
            onPlaybackRateChange?: (event: YTPlayerEvent) => void
          }
        },
      ) => YTPlayer
      PlayerState: {
        UNSTARTED: -1
        ENDED: 0
        PLAYING: 1
        PAUSED: 2
        BUFFERING: 3
        CUED: 5
      }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

// =============================================================================
// YouTube Provider
// =============================================================================

/**
 * YouTube embed provider
 */
export class YouTubeProvider extends BaseProvider {
  readonly name = 'youtube'
  readonly type: ProviderType = 'youtube'

  private player: YTPlayer | null = null
  private iframe: HTMLIFrameElement | null = null
  private pendingVideoId: string | null = null
  private startTime?: number
  private endTime?: number
  private timeUpdateInterval: ReturnType<typeof setInterval> | null = null
  private lastState = -1

  get mediaElement(): HTMLIFrameElement | null {
    return this.iframe
  }

  // === Lifecycle ===

  protected async initialize(): Promise<void> {
    if (!this.container) {
      throw new Error('Container element is required')
    }

    // Load YouTube API
    await this.loadYouTubeAPI()

    // Create container div for YouTube player
    const playerDiv = document.createElement('div')
    playerDiv.id = `ts-video-player-yt-${Date.now()}`
    playerDiv.className = 'ts-video-player__youtube'
    this.container.appendChild(playerDiv)

    // Build player vars
    const playerVars: Record<string, string | number> = {
      autoplay: this.options.autoplay ? 1 : 0,
      controls: 0, // We use our own controls
      disablekb: 1, // Disable keyboard (we handle it)
      enablejsapi: 1,
      iv_load_policy: 3, // Disable annotations
      modestbranding: 1,
      playsinline: this.options.playsinline ? 1 : 0,
      rel: 0, // Don't show related videos
      origin: window.location.origin,
    }

    // Apply custom YouTube params
    if (this.options.youtubeParams) {
      Object.assign(playerVars, this.options.youtubeParams)
    }

    // Use privacy-enhanced mode
    playerVars.host = 'https://www.youtube-nocookie.com'

    // Create player
    this.player = new window.YT!.Player(playerDiv.id, {
      width: '100%',
      height: '100%',
      playerVars,
      events: {
        onReady: () => this.onReady(),
        onStateChange: (e) => this.onStateChange(e),
        onError: (e) => this.onError(e),
        onPlaybackQualityChange: () => this.onQualityChange(),
        onPlaybackRateChange: () => this.onRateChange(),
      },
    })

    // Get iframe reference
    this.iframe = this.player.getIframe()
    this.iframe.className = 'ts-video-player__media'
  }

  private async loadYouTubeAPI(): Promise<void> {
    if (window.YT?.Player) return

    return new Promise((resolve) => {
      // Check if script already loading
      if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const check = () => {
          if (window.YT?.Player) {
            resolve()
          } else {
            setTimeout(check, 100)
          }
        }
        check()
        return
      }

      // Load script
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true

      window.onYouTubeIframeAPIReady = () => {
        resolve()
      }

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
  }

  // === Event Handlers ===

  private onReady(): void {
    // Start time update polling
    this.timeUpdateInterval = setInterval(() => {
      if (this.player && this.lastState === 1) {
        this.events.emit('timeupdate', this.getCurrentTime())
      }
    }, 250)

    // Emit initial state
    this.events.emit('loadedmetadata')
    this.events.emit('canplay')

    // Load pending video if any
    if (this.pendingVideoId) {
      this.loadVideo(this.pendingVideoId, this.startTime, this.endTime)
      this.pendingVideoId = null
    }
  }

  private onStateChange(event: YTPlayerEvent): void {
    const state = event.data
    this.lastState = state

    const PlayerState = window.YT!.PlayerState

    switch (state) {
      case PlayerState.UNSTARTED:
        this.events.emit('loadstart')
        break
      case PlayerState.PLAYING:
        this.events.emit('play')
        this.events.emit('playing')
        this.events.emit('statechange', { paused: false, playing: true, waiting: false })
        break
      case PlayerState.PAUSED:
        this.events.emit('pause')
        this.events.emit('statechange', { paused: true, playing: false })
        break
      case PlayerState.BUFFERING:
        this.events.emit('waiting')
        this.events.emit('statechange', { waiting: true })
        break
      case PlayerState.ENDED:
        this.events.emit('ended')
        this.events.emit('statechange', { ended: true, playing: false })
        break
      case PlayerState.CUED:
        this.events.emit('loadeddata')
        this.events.emit('durationchange', this.getDuration())
        break
    }
  }

  private onError(event: YTPlayerEvent): void {
    const errorMessages: Record<number, string> = {
      2: 'Invalid video ID',
      5: 'HTML5 player error',
      100: 'Video not found or removed',
      101: 'Video cannot be embedded',
      150: 'Video cannot be embedded',
    }

    this.emitError(event.data, errorMessages[event.data] || 'Unknown YouTube error')
  }

  private onQualityChange(): void {
    const quality = this.player?.getPlaybackQuality() || 'auto'
    const qualities = this.getQualities()
    this.events.emit('qualitychange', qualities.find((q) => q.id === quality) || null)
  }

  private onRateChange(): void {
    this.events.emit('ratechange', this.getPlaybackRate())
  }

  // === Loading ===

  canPlay(src: Src): boolean {
    return isYouTubeSource(src)
  }

  async load(src: Src): Promise<void> {
    const parsed = parseYouTubeSource(src)
    if (!parsed) {
      this.emitError(2, 'Invalid YouTube source')
      return
    }

    this.startTime = parsed.startTime
    this.endTime = parsed.endTime

    if (!this.player || !this._ready) {
      this.pendingVideoId = parsed.videoId
      return
    }

    this.loadVideo(parsed.videoId, parsed.startTime, parsed.endTime)
  }

  private loadVideo(videoId: string, startTime?: number, endTime?: number): void {
    if (!this.player) return

    if (this.options.autoplay) {
      this.player.loadVideoById({
        videoId,
        startSeconds: startTime,
        endSeconds: endTime,
      })
    } else {
      this.player.cueVideoById({
        videoId,
        startSeconds: startTime,
        endSeconds: endTime,
      })
    }
  }

  // === Playback ===

  async play(): Promise<void> {
    this.player?.playVideo()
  }

  pause(): void {
    this.player?.pauseVideo()
  }

  stop(): void {
    this.player?.stopVideo()
  }

  // === Seeking ===

  seekTo(time: number): void {
    this.player?.seekTo(time, true)
    this.events.emit('seeking')
    // YouTube doesn't emit seeked, so we fake it
    setTimeout(() => this.events.emit('seeked'), 100)
  }

  getCurrentTime(): number {
    return this.player?.getCurrentTime() || 0
  }

  getDuration(): number {
    return this.player?.getDuration() || 0
  }

  // === Volume ===

  setVolume(volume: number): void {
    this.player?.setVolume(Math.round(volume * 100))
    this.events.emit('volumechange', volume, this.getMuted())
  }

  getVolume(): number {
    return (this.player?.getVolume() || 100) / 100
  }

  setMuted(muted: boolean): void {
    if (muted) {
      this.player?.mute()
    } else {
      this.player?.unMute()
    }
    this.events.emit('volumechange', this.getVolume(), muted)
  }

  getMuted(): boolean {
    return this.player?.isMuted() || false
  }

  // === Playback Rate ===

  setPlaybackRate(rate: number): void {
    this.player?.setPlaybackRate(rate)
  }

  getPlaybackRate(): number {
    return this.player?.getPlaybackRate() || 1
  }

  // === Quality ===

  getQualities(): VideoQuality[] {
    const levels = this.player?.getAvailableQualityLevels() || []
    const heights: Record<string, number> = {
      highres: 2160,
      hd2160: 2160,
      hd1440: 1440,
      hd1080: 1080,
      hd720: 720,
      large: 480,
      medium: 360,
      small: 240,
      tiny: 144,
    }

    const current = this.player?.getPlaybackQuality()

    return levels.map((level) => ({
      id: level,
      width: Math.round((heights[level] || 480) * (16 / 9)),
      height: heights[level] || 480,
      bitrate: 0,
      selected: level === current,
    }))
  }

  setQuality(quality: VideoQuality | 'auto'): void {
    if (quality === 'auto') {
      this.player?.setPlaybackQuality('default')
    } else {
      this.player?.setPlaybackQuality(quality.id)
    }
  }
}

/**
 * YouTube Provider Loader
 */
export const youtubeLoader = {
  name: 'youtube',
  type: 'youtube' as ProviderType,

  canPlay(src: Src): boolean {
    return isYouTubeSource(src)
  },

  mediaType(): 'video' {
    return 'video'
  },

  preconnect(): string[] {
    return [
      'https://www.youtube-nocookie.com',
      'https://www.youtube.com',
      'https://i.ytimg.com',
      'https://s.ytimg.com',
    ]
  },

  async load(container: HTMLElement, options: PlayerOptions): Promise<YouTubeProvider> {
    const provider = new YouTubeProvider()
    await provider.setup(container, options)
    return provider
  },
}

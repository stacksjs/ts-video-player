/**
 * Video Analytics Plugin
 *
 * Deep integration with ts-analytics for comprehensive video tracking.
 *
 * @module plugins/analytics
 */

import type { Player } from '../player'
import type { VideoQuality, TextTrack, AudioTrack } from '../types'

// =============================================================================
// Types
// =============================================================================

export interface VideoAnalyticsConfig {
  /** Site ID for analytics */
  siteId: string
  /** Analytics API endpoint */
  apiEndpoint: string
  /** Video ID (unique identifier) */
  videoId: string
  /** Video title */
  videoTitle?: string
  /** Video duration (auto-detected if not provided) */
  duration?: number
  /** Content type (vod, live, etc.) */
  contentType?: 'vod' | 'live' | 'dvr'
  /** Content category */
  category?: string
  /** Content tags */
  tags?: string[]
  /** Creator/channel ID */
  creatorId?: string
  /** Series/playlist ID */
  seriesId?: string
  /** Episode number */
  episode?: number
  /** Season number */
  season?: number
  /** Track playback milestones (percentages) */
  milestones?: number[]
  /** Track heartbeat interval (seconds) */
  heartbeatInterval?: number
  /** Track quality changes */
  trackQualityChanges?: boolean
  /** Track seeking behavior */
  trackSeeking?: boolean
  /** Track buffering */
  trackBuffering?: boolean
  /** Track errors */
  trackErrors?: boolean
  /** Track engagement (pauses, replays) */
  trackEngagement?: boolean
  /** Custom properties to include */
  customProperties?: Record<string, string | number | boolean>
  /** Session ID (auto-generated if not provided) */
  sessionId?: string
  /** Visitor ID (auto-generated if not provided) */
  visitorId?: string
  /** Disable analytics */
  disabled?: boolean
}

export interface VideoEvent {
  /** Event name */
  name: VideoEventName
  /** Timestamp */
  timestamp: Date
  /** Current playback time */
  currentTime: number
  /** Video duration */
  duration: number
  /** Additional properties */
  properties?: Record<string, unknown>
}

export type VideoEventName =
  | 'video_start'
  | 'video_play'
  | 'video_pause'
  | 'video_resume'
  | 'video_seek'
  | 'video_buffer_start'
  | 'video_buffer_end'
  | 'video_quality_change'
  | 'video_volume_change'
  | 'video_mute'
  | 'video_unmute'
  | 'video_fullscreen_enter'
  | 'video_fullscreen_exit'
  | 'video_pip_enter'
  | 'video_pip_exit'
  | 'video_caption_enable'
  | 'video_caption_disable'
  | 'video_caption_change'
  | 'video_audio_track_change'
  | 'video_speed_change'
  | 'video_error'
  | 'video_milestone'
  | 'video_quartile'
  | 'video_complete'
  | 'video_heartbeat'
  | 'video_engagement'
  | 'video_ad_start'
  | 'video_ad_complete'
  | 'video_ad_skip'
  | 'video_ad_click'

export interface VideoAnalyticsState {
  /** Has video started playing */
  hasStarted: boolean
  /** Has video completed */
  hasCompleted: boolean
  /** Total watch time in seconds */
  watchTime: number
  /** Number of pauses */
  pauseCount: number
  /** Number of seeks */
  seekCount: number
  /** Number of buffer events */
  bufferCount: number
  /** Total buffer time in seconds */
  bufferTime: number
  /** Number of quality changes */
  qualityChangeCount: number
  /** Reached milestones */
  reachedMilestones: number[]
  /** Reached quartiles */
  reachedQuartiles: number[]
  /** Playback start time */
  playbackStartTime: number | null
  /** Last heartbeat time */
  lastHeartbeat: number
  /** Is currently buffering */
  isBuffering: boolean
  /** Buffer start time */
  bufferStartTime: number | null
}

// =============================================================================
// Default Configuration
// =============================================================================

const DEFAULT_MILESTONES = [10, 25, 50, 75, 90, 100]
const DEFAULT_HEARTBEAT_INTERVAL = 30 // seconds

// =============================================================================
// Video Analytics Class
// =============================================================================

export class VideoAnalytics {
  private player: Player | null = null
  private config: VideoAnalyticsConfig
  private state: VideoAnalyticsState
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private eventQueue: VideoEvent[] = []
  private flushTimer: ReturnType<typeof setTimeout> | null = null
  private sessionId: string
  private visitorId: string
  private unsubscribers: Array<() => void> = []

  constructor(config: VideoAnalyticsConfig) {
    this.config = {
      milestones: DEFAULT_MILESTONES,
      heartbeatInterval: DEFAULT_HEARTBEAT_INTERVAL,
      trackQualityChanges: true,
      trackSeeking: true,
      trackBuffering: true,
      trackErrors: true,
      trackEngagement: true,
      ...config,
    }

    this.sessionId = config.sessionId || this.generateId()
    this.visitorId = config.visitorId || this.getOrCreateVisitorId()

    this.state = this.createInitialState()
  }

  /**
   * Create initial analytics state
   */
  private createInitialState(): VideoAnalyticsState {
    return {
      hasStarted: false,
      hasCompleted: false,
      watchTime: 0,
      pauseCount: 0,
      seekCount: 0,
      bufferCount: 0,
      bufferTime: 0,
      qualityChangeCount: 0,
      reachedMilestones: [],
      reachedQuartiles: [],
      playbackStartTime: null,
      lastHeartbeat: 0,
      isBuffering: false,
      bufferStartTime: null,
    }
  }

  /**
   * Attach to a player instance
   */
  attach(player: Player): void {
    if (this.config.disabled) return

    this.player = player
    this.attachEventListeners()
    this.startHeartbeat()
  }

  /**
   * Detach from player
   */
  detach(): void {
    this.stopHeartbeat()
    this.unsubscribers.forEach(unsub => unsub())
    this.unsubscribers = []
    this.flush()
    this.player = null
  }

  /**
   * Attach event listeners to player
   */
  private attachEventListeners(): void {
    if (!this.player) return

    // Play events
    this.on('play', () => {
      if (!this.state.hasStarted) {
        this.state.hasStarted = true
        this.state.playbackStartTime = Date.now()
        this.trackEvent('video_start')
      }
      else {
        this.trackEvent('video_resume')
      }
      this.trackEvent('video_play')
    })

    // Pause
    this.on('pause', () => {
      this.state.pauseCount++
      this.updateWatchTime()
      this.trackEvent('video_pause')
    })

    // Seeking
    if (this.config.trackSeeking) {
      this.on('seeking', () => {
        this.state.seekCount++
      })

      this.on('seeked', () => {
        const playerState = this.player?.state
        this.trackEvent('video_seek', {
          seekTo: playerState?.currentTime || 0,
        })
      })
    }

    // Buffering
    if (this.config.trackBuffering) {
      this.on('waiting', () => {
        if (!this.state.isBuffering) {
          this.state.isBuffering = true
          this.state.bufferStartTime = Date.now()
          this.state.bufferCount++
          this.trackEvent('video_buffer_start')
        }
      })

      this.on('playing', () => {
        if (this.state.isBuffering) {
          this.state.isBuffering = false
          if (this.state.bufferStartTime) {
            this.state.bufferTime += (Date.now() - this.state.bufferStartTime) / 1000
          }
          this.trackEvent('video_buffer_end', {
            bufferDuration: this.state.bufferStartTime
              ? (Date.now() - this.state.bufferStartTime) / 1000
              : 0,
          })
          this.state.bufferStartTime = null
        }
      })
    }

    // Time update for milestones
    this.on('timeupdate', () => {
      this.checkMilestones()
    })

    // Quality changes
    if (this.config.trackQualityChanges) {
      this.on('qualitychange', (quality: VideoQuality | null) => {
        this.state.qualityChangeCount++
        this.trackEvent('video_quality_change', {
          quality: quality ? `${quality.height}p` : 'auto',
          bitrate: quality?.bitrate,
        })
      })
    }

    // Volume changes
    this.on('volumechange', () => {
      const playerState = this.player?.state
      if (playerState?.muted) {
        this.trackEvent('video_mute')
      }
      else {
        this.trackEvent('video_volume_change', {
          volume: playerState?.volume,
        })
      }
    })

    // Fullscreen
    this.on('fullscreenchange', (isFullscreen: boolean) => {
      this.trackEvent(isFullscreen ? 'video_fullscreen_enter' : 'video_fullscreen_exit')
    })

    // PiP
    this.on('pipchange', (isPiP: boolean) => {
      this.trackEvent(isPiP ? 'video_pip_enter' : 'video_pip_exit')
    })

    // Captions
    this.on('texttrackchange', (track: TextTrack | null) => {
      if (track) {
        this.trackEvent('video_caption_change', {
          language: track.language,
          label: track.label,
        })
      }
      else {
        this.trackEvent('video_caption_disable')
      }
    })

    // Audio track
    this.on('audiotrackchange', (track: AudioTrack | null) => {
      if (track) {
        this.trackEvent('video_audio_track_change', {
          language: track.language,
          label: track.label,
        })
      }
    })

    // Speed change
    this.on('ratechange', (rate: number) => {
      this.trackEvent('video_speed_change', { speed: rate })
    })

    // Ended
    this.on('ended', () => {
      if (!this.state.hasCompleted) {
        this.state.hasCompleted = true
        this.updateWatchTime()
        this.trackEvent('video_complete', {
          watchTime: this.state.watchTime,
          pauseCount: this.state.pauseCount,
          seekCount: this.state.seekCount,
          bufferCount: this.state.bufferCount,
          bufferTime: this.state.bufferTime,
        })
      }
    })

    // Errors
    if (this.config.trackErrors) {
      this.on('error', (error: any) => {
        this.trackEvent('video_error', {
          code: error?.code,
          message: error?.message,
        })
      })
    }
  }

  /**
   * Helper to subscribe to player events
   */
  private on(event: string, handler: (...args: any[]) => void): void {
    if (!this.player) return
    this.player.on(event as any, handler)
    this.unsubscribers.push(() => this.player?.off(event as any, handler))
  }

  /**
   * Check and track milestones
   */
  private checkMilestones(): void {
    const playerState = this.player?.state
    if (!playerState || !playerState.duration) return

    const progress = (playerState.currentTime / playerState.duration) * 100

    // Check custom milestones
    for (const milestone of this.config.milestones || []) {
      if (progress >= milestone && !this.state.reachedMilestones.includes(milestone)) {
        this.state.reachedMilestones.push(milestone)
        this.trackEvent('video_milestone', { milestone })
      }
    }

    // Check quartiles (25%, 50%, 75%, 100%)
    const quartiles = [25, 50, 75, 100]
    for (const quartile of quartiles) {
      if (progress >= quartile && !this.state.reachedQuartiles.includes(quartile)) {
        this.state.reachedQuartiles.push(quartile)
        this.trackEvent('video_quartile', { quartile })
      }
    }
  }

  /**
   * Update watch time
   */
  private updateWatchTime(): void {
    if (this.state.playbackStartTime) {
      this.state.watchTime += (Date.now() - this.state.playbackStartTime) / 1000
      this.state.playbackStartTime = Date.now()
    }
  }

  /**
   * Start heartbeat tracking
   */
  private startHeartbeat(): void {
    if (this.heartbeatTimer) return

    const interval = (this.config.heartbeatInterval || DEFAULT_HEARTBEAT_INTERVAL) * 1000

    this.heartbeatTimer = setInterval(() => {
      const playerState = this.player?.state
      if (playerState?.playbackState === 'playing') {
        this.updateWatchTime()
        this.trackEvent('video_heartbeat', {
          watchTime: this.state.watchTime,
          currentTime: playerState.currentTime,
        })
      }
    }, interval)
  }

  /**
   * Stop heartbeat tracking
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * Track an event
   */
  trackEvent(name: VideoEventName, properties?: Record<string, unknown>): void {
    if (this.config.disabled) return

    const playerState = this.player?.state

    const event: VideoEvent = {
      name,
      timestamp: new Date(),
      currentTime: playerState?.currentTime || 0,
      duration: playerState?.duration || this.config.duration || 0,
      properties,
    }

    this.eventQueue.push(event)
    this.scheduleFlush()
  }

  /**
   * Schedule event flush
   */
  private scheduleFlush(): void {
    if (this.flushTimer) return

    this.flushTimer = setTimeout(() => {
      this.flush()
      this.flushTimer = null
    }, 1000) // Batch events for 1 second
  }

  /**
   * Flush events to analytics endpoint
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return

    const events = [...this.eventQueue]
    this.eventQueue = []

    try {
      await this.sendEvents(events)
    }
    catch (error) {
      // Re-queue on failure
      console.error('Failed to send analytics events:', error)
      this.eventQueue.unshift(...events)
    }
  }

  /**
   * Send events to analytics endpoint
   */
  private async sendEvents(events: VideoEvent[]): Promise<void> {
    const payload = events.map(event => this.buildEventPayload(event))

    // Send to ts-analytics /collect endpoint
    for (const p of payload) {
      await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(p),
        keepalive: true,
      })
    }
  }

  /**
   * Build event payload for ts-analytics
   */
  private buildEventPayload(event: VideoEvent): Record<string, unknown> {
    return {
      s: this.config.siteId, // siteId
      sid: this.sessionId, // sessionId
      vid: this.visitorId, // visitorId
      e: 'event', // event type (custom event)
      u: typeof window !== 'undefined' ? window.location.href : '', // URL
      p: {
        // Event properties
        eventName: event.name,
        videoId: this.config.videoId,
        videoTitle: this.config.videoTitle,
        contentType: this.config.contentType,
        category: this.config.category,
        creatorId: this.config.creatorId,
        seriesId: this.config.seriesId,
        episode: this.config.episode,
        season: this.config.season,
        currentTime: event.currentTime,
        duration: event.duration,
        progress: event.duration > 0 ? (event.currentTime / event.duration) * 100 : 0,
        watchTime: this.state.watchTime,
        ...this.config.customProperties,
        ...event.properties,
      },
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * Get or create visitor ID
   */
  private getOrCreateVisitorId(): string {
    if (typeof localStorage === 'undefined') {
      return this.generateId()
    }

    const key = 'tsvp_visitor_id'
    let visitorId = localStorage.getItem(key)

    if (!visitorId) {
      visitorId = this.generateId()
      localStorage.setItem(key, visitorId)
    }

    return visitorId
  }

  /**
   * Get current analytics state
   */
  getState(): VideoAnalyticsState {
    return { ...this.state }
  }

  /**
   * Get session summary
   */
  getSummary(): Record<string, unknown> {
    return {
      videoId: this.config.videoId,
      sessionId: this.sessionId,
      hasStarted: this.state.hasStarted,
      hasCompleted: this.state.hasCompleted,
      watchTime: this.state.watchTime,
      pauseCount: this.state.pauseCount,
      seekCount: this.state.seekCount,
      bufferCount: this.state.bufferCount,
      bufferTime: this.state.bufferTime,
      qualityChangeCount: this.state.qualityChangeCount,
      reachedMilestones: this.state.reachedMilestones,
      completionRate: this.state.reachedQuartiles.length > 0
        ? Math.max(...this.state.reachedQuartiles)
        : 0,
    }
  }

  /**
   * Reset analytics state
   */
  reset(): void {
    this.flush()
    this.state = this.createInitialState()
    this.sessionId = this.generateId()
  }

  /**
   * Destroy analytics instance
   */
  destroy(): void {
    this.detach()
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
    }
  }
}

// =============================================================================
// Factory
// =============================================================================

export function createVideoAnalytics(config: VideoAnalyticsConfig): VideoAnalytics {
  return new VideoAnalytics(config)
}

// =============================================================================
// Player Plugin Integration
// =============================================================================

/**
 * Analytics plugin for Player
 */
export function analyticsPlugin(config: Omit<VideoAnalyticsConfig, 'videoId'>) {
  return {
    name: 'analytics',

    install(player: Player, videoConfig: { videoId: string; videoTitle?: string }) {
      const analytics = createVideoAnalytics({
        ...config,
        ...videoConfig,
      })

      analytics.attach(player)

      // Expose on player
      ;(player as any).analytics = analytics

      return () => {
        analytics.destroy()
        delete (player as any).analytics
      }
    },
  }
}

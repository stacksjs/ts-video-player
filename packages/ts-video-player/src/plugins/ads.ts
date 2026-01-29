/**
 * Video Ads Plugin
 *
 * VAST/VPAID ad support for video playback.
 *
 * @module plugins/ads
 */

import type { Player } from '../player'

// =============================================================================
// Types
// =============================================================================

export type AdType = 'linear' | 'nonlinear' | 'companion'
export type AdBreakType = 'preroll' | 'midroll' | 'postroll'

export interface AdConfig {
  /** VAST tag URL or inline VAST XML */
  vastUrl?: string
  /** VAST XML content */
  vastXml?: string
  /** VMAP URL for ad schedule */
  vmapUrl?: string
  /** Ad schedule */
  schedule?: AdBreak[]
  /** Skip delay in seconds (0 = no skip, -1 = use VAST value) */
  skipDelay?: number
  /** Maximum number of redirects to follow */
  maxRedirects?: number
  /** Timeout for ad requests in ms */
  timeout?: number
  /** Enable VPAID */
  vpaidEnabled?: boolean
  /** Companion ad container selectors */
  companionContainers?: Record<string, string>
  /** Preload ads */
  preloadAds?: boolean
  /** Debug mode */
  debug?: boolean
}

export interface AdBreak {
  /** Break type */
  type: AdBreakType
  /** Time offset in seconds (for midrolls) */
  timeOffset?: number
  /** VAST URL */
  vastUrl?: string
  /** VAST XML */
  vastXml?: string
  /** Has played */
  played?: boolean
}

export interface Ad {
  /** Ad ID */
  id: string
  /** Ad type */
  type: AdType
  /** Ad system */
  adSystem?: string
  /** Ad title */
  title?: string
  /** Ad description */
  description?: string
  /** Ad duration in seconds */
  duration: number
  /** Skip offset in seconds */
  skipOffset?: number
  /** Click through URL */
  clickThroughUrl?: string
  /** Media files */
  mediaFiles: AdMediaFile[]
  /** Companion ads */
  companions?: CompanionAd[]
  /** Tracking events */
  trackingEvents: AdTrackingEvent[]
  /** VPAID script */
  vpaidScript?: string
  /** Icons */
  icons?: AdIcon[]
}

export interface AdMediaFile {
  /** Media URL */
  url: string
  /** MIME type */
  type: string
  /** Width */
  width: number
  /** Height */
  height: number
  /** Bitrate */
  bitrate?: number
  /** Codec */
  codec?: string
  /** Delivery type */
  delivery: 'progressive' | 'streaming'
}

export interface CompanionAd {
  /** Width */
  width: number
  /** Height */
  height: number
  /** Resource URL (image, iframe, HTML) */
  resourceUrl: string
  /** Resource type */
  resourceType: 'static' | 'iframe' | 'html'
  /** Click through URL */
  clickThroughUrl?: string
  /** Alt text */
  altText?: string
  /** Tracking pixel */
  trackingUrl?: string
}

export interface AdTrackingEvent {
  /** Event name */
  event: string
  /** Tracking URL */
  url: string
  /** Offset (for progress events) */
  offset?: number
}

export interface AdIcon {
  /** Icon URL */
  url: string
  /** Width */
  width: number
  /** Height */
  height: number
  /** Position */
  xPosition: string
  /** Position */
  yPosition: string
  /** Click URL */
  clickUrl?: string
}

export interface AdState {
  /** Is ad playing */
  isPlaying: boolean
  /** Current ad */
  currentAd: Ad | null
  /** Current ad break */
  currentBreak: AdBreak | null
  /** Time remaining */
  timeRemaining: number
  /** Can skip */
  canSkip: boolean
  /** Skip countdown */
  skipCountdown: number
  /** Is loading */
  isLoading: boolean
  /** Error */
  error: string | null
}

// =============================================================================
// VAST Parser
// =============================================================================

export class VASTParser {
  private maxRedirects: number
  private timeout: number
  private redirectCount = 0

  constructor(options: { maxRedirects?: number; timeout?: number } = {}) {
    this.maxRedirects = options.maxRedirects ?? 5
    this.timeout = options.timeout ?? 10000
  }

  /**
   * Parse VAST from URL
   */
  async parseFromUrl(url: string): Promise<Ad[]> {
    this.redirectCount = 0
    return this.fetchAndParse(url)
  }

  /**
   * Parse VAST from XML string
   */
  parseFromXml(xml: string): Ad[] {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'text/xml')
    return this.parseDocument(doc)
  }

  /**
   * Fetch and parse VAST
   */
  private async fetchAndParse(url: string): Promise<Ad[]> {
    if (this.redirectCount >= this.maxRedirects) {
      throw new Error('Too many VAST redirects')
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, { signal: controller.signal })
      const text = await response.text()
      const parser = new DOMParser()
      const doc = parser.parseFromString(text, 'text/xml')

      // Check for wrapper (redirect)
      const wrapper = doc.querySelector('Wrapper')
      if (wrapper) {
        const vastAdTagUri = wrapper.querySelector('VASTAdTagURI')?.textContent?.trim()
        if (vastAdTagUri) {
          this.redirectCount++
          return this.fetchAndParse(vastAdTagUri)
        }
      }

      return this.parseDocument(doc)
    }
    finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * Parse VAST document
   */
  private parseDocument(doc: Document): Ad[] {
    const ads: Ad[] = []
    const adElements = doc.querySelectorAll('Ad')

    adElements.forEach((adEl) => {
      const inLine = adEl.querySelector('InLine')
      if (!inLine) return

      const ad: Ad = {
        id: adEl.getAttribute('id') || this.generateId(),
        type: 'linear',
        adSystem: inLine.querySelector('AdSystem')?.textContent?.trim(),
        title: inLine.querySelector('AdTitle')?.textContent?.trim(),
        description: inLine.querySelector('Description')?.textContent?.trim(),
        duration: 0,
        mediaFiles: [],
        trackingEvents: [],
      }

      // Parse Linear
      const linear = inLine.querySelector('Linear')
      if (linear) {
        // Duration
        const durationStr = linear.querySelector('Duration')?.textContent?.trim()
        if (durationStr) {
          ad.duration = this.parseDuration(durationStr)
        }

        // Skip offset
        const skipOffset = linear.getAttribute('skipoffset')
        if (skipOffset) {
          ad.skipOffset = this.parseOffset(skipOffset, ad.duration)
        }

        // Media files
        linear.querySelectorAll('MediaFile').forEach((mf) => {
          const url = mf.textContent?.trim()
          if (url) {
            ad.mediaFiles.push({
              url,
              type: mf.getAttribute('type') || 'video/mp4',
              width: Number.parseInt(mf.getAttribute('width') || '0', 10),
              height: Number.parseInt(mf.getAttribute('height') || '0', 10),
              bitrate: mf.getAttribute('bitrate')
                ? Number.parseInt(mf.getAttribute('bitrate')!, 10)
                : undefined,
              delivery: (mf.getAttribute('delivery') as any) || 'progressive',
            })
          }
        })

        // Click through
        const clickThrough = linear.querySelector('VideoClicks > ClickThrough')
        if (clickThrough) {
          ad.clickThroughUrl = clickThrough.textContent?.trim()
        }

        // Tracking events
        linear.querySelectorAll('TrackingEvents > Tracking').forEach((tracking) => {
          const event = tracking.getAttribute('event')
          const url = tracking.textContent?.trim()
          if (event && url) {
            const trackingEvent: AdTrackingEvent = { event, url }

            // Handle progress offset
            if (event === 'progress') {
              const offset = tracking.getAttribute('offset')
              if (offset) {
                trackingEvent.offset = this.parseOffset(offset, ad.duration)
              }
            }

            ad.trackingEvents.push(trackingEvent)
          }
        })

        // Icons
        linear.querySelectorAll('Icons > Icon').forEach((icon) => {
          const staticResource = icon.querySelector('StaticResource')
          if (staticResource?.textContent) {
            ad.icons = ad.icons || []
            ad.icons.push({
              url: staticResource.textContent.trim(),
              width: Number.parseInt(icon.getAttribute('width') || '0', 10),
              height: Number.parseInt(icon.getAttribute('height') || '0', 10),
              xPosition: icon.getAttribute('xPosition') || 'right',
              yPosition: icon.getAttribute('yPosition') || 'top',
              clickUrl: icon.querySelector('IconClicks > IconClickThrough')?.textContent?.trim(),
            })
          }
        })
      }

      // Parse Companion ads
      inLine.querySelectorAll('CompanionAds > Companion').forEach((comp) => {
        ad.companions = ad.companions || []

        const staticResource = comp.querySelector('StaticResource')
        const iframeResource = comp.querySelector('IFrameResource')
        const htmlResource = comp.querySelector('HTMLResource')

        let resourceUrl = ''
        let resourceType: CompanionAd['resourceType'] = 'static'

        if (staticResource?.textContent) {
          resourceUrl = staticResource.textContent.trim()
          resourceType = 'static'
        }
        else if (iframeResource?.textContent) {
          resourceUrl = iframeResource.textContent.trim()
          resourceType = 'iframe'
        }
        else if (htmlResource?.textContent) {
          resourceUrl = htmlResource.textContent.trim()
          resourceType = 'html'
        }

        if (resourceUrl) {
          ad.companions.push({
            width: Number.parseInt(comp.getAttribute('width') || '0', 10),
            height: Number.parseInt(comp.getAttribute('height') || '0', 10),
            resourceUrl,
            resourceType,
            clickThroughUrl: comp.querySelector('CompanionClickThrough')?.textContent?.trim(),
            altText: comp.getAttribute('altText') || undefined,
            trackingUrl: comp.querySelector('TrackingEvents > Tracking')?.textContent?.trim(),
          })
        }
      })

      if (ad.mediaFiles.length > 0) {
        ads.push(ad)
      }
    })

    return ads
  }

  /**
   * Parse duration string (HH:MM:SS.mmm)
   */
  private parseDuration(duration: string): number {
    const parts = duration.split(':')
    if (parts.length !== 3) return 0

    const hours = Number.parseFloat(parts[0])
    const minutes = Number.parseFloat(parts[1])
    const seconds = Number.parseFloat(parts[2])

    return hours * 3600 + minutes * 60 + seconds
  }

  /**
   * Parse offset (time or percentage)
   */
  private parseOffset(offset: string, duration: number): number {
    if (offset.endsWith('%')) {
      const percent = Number.parseFloat(offset) / 100
      return duration * percent
    }
    return this.parseDuration(offset)
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `ad-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }
}

// =============================================================================
// Ads Manager
// =============================================================================

export class AdsManager {
  private player: Player | null = null
  private config: AdConfig
  private parser: VASTParser
  private state: AdState
  private container: HTMLElement | null = null
  private adVideo: HTMLVideoElement | null = null
  private adContainer: HTMLElement | null = null
  private skipButton: HTMLButtonElement | null = null
  private adBreaks: AdBreak[] = []
  private currentAds: Ad[] = []
  private currentAdIndex = 0
  private skipTimer: ReturnType<typeof setInterval> | null = null
  private contentPaused = false

  // Event handlers
  private onAdStart: ((ad: Ad) => void) | null = null
  private onAdComplete: ((ad: Ad) => void) | null = null
  private onAdSkip: ((ad: Ad) => void) | null = null
  private onAdClick: ((ad: Ad) => void) | null = null
  private onAdErrorCallback: ((error: string) => void) | null = null
  private onAllAdsComplete: (() => void) | null = null

  constructor(config: AdConfig = {}) {
    this.config = {
      skipDelay: 5,
      maxRedirects: 5,
      timeout: 10000,
      vpaidEnabled: false,
      preloadAds: true,
      debug: false,
      ...config,
    }

    this.parser = new VASTParser({
      maxRedirects: this.config.maxRedirects,
      timeout: this.config.timeout,
    })

    this.state = {
      isPlaying: false,
      currentAd: null,
      currentBreak: null,
      timeRemaining: 0,
      canSkip: false,
      skipCountdown: 0,
      isLoading: false,
      error: null,
    }

    // Parse schedule
    if (this.config.schedule) {
      this.adBreaks = this.config.schedule
    }
    else if (this.config.vastUrl || this.config.vastXml) {
      // Single preroll
      this.adBreaks = [{
        type: 'preroll',
        vastUrl: this.config.vastUrl,
        vastXml: this.config.vastXml,
      }]
    }
  }

  /**
   * Attach to player
   */
  attach(player: Player, container: HTMLElement): void {
    this.player = player
    this.container = container

    this.createAdContainer()
    this.attachPlayerEvents()

    // Preload ads
    if (this.config.preloadAds) {
      this.preloadAds()
    }
  }

  /**
   * Create ad container
   */
  private createAdContainer(): void {
    if (!this.container) return

    this.adContainer = document.createElement('div')
    this.adContainer.className = 'tsvp-ad-container'
    this.adContainer.style.cssText = `
      position: absolute;
      inset: 0;
      z-index: 50;
      display: none;
      background: #000;
    `

    // Ad video
    this.adVideo = document.createElement('video')
    this.adVideo.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: contain;
    `
    this.adVideo.playsInline = true

    // Ad overlay
    const overlay = document.createElement('div')
    overlay.className = 'tsvp-ad-overlay'
    overlay.style.cssText = `
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      pointer-events: none;
    `

    // Ad info
    const adInfo = document.createElement('div')
    adInfo.className = 'tsvp-ad-info'
    adInfo.style.cssText = `
      position: absolute;
      top: 12px;
      left: 12px;
      padding: 6px 12px;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      font-size: 12px;
      font-family: var(--tsvp-font-family, sans-serif);
      border-radius: 4px;
    `
    adInfo.textContent = 'Ad'

    // Skip button
    this.skipButton = document.createElement('button')
    this.skipButton.className = 'tsvp-ad-skip'
    this.skipButton.style.cssText = `
      position: absolute;
      bottom: 80px;
      right: 12px;
      padding: 10px 16px;
      background: rgba(0, 0, 0, 0.8);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 4px;
      font-size: 14px;
      font-family: var(--tsvp-font-family, sans-serif);
      cursor: pointer;
      pointer-events: auto;
      display: none;
    `
    this.skipButton.addEventListener('click', () => this.skipAd())

    // Learn more button
    const learnMore = document.createElement('button')
    learnMore.className = 'tsvp-ad-learn-more'
    learnMore.style.cssText = `
      position: absolute;
      bottom: 80px;
      left: 12px;
      padding: 10px 16px;
      background: var(--tsvp-color-primary, #00a8ff);
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-family: var(--tsvp-font-family, sans-serif);
      cursor: pointer;
      pointer-events: auto;
      display: none;
    `
    learnMore.textContent = 'Learn More'
    learnMore.addEventListener('click', () => this.handleAdClick())

    overlay.appendChild(adInfo)
    overlay.appendChild(this.skipButton)
    overlay.appendChild(learnMore)

    this.adContainer.appendChild(this.adVideo)
    this.adContainer.appendChild(overlay)
    this.container.appendChild(this.adContainer)

    // Ad video events
    this.adVideo.addEventListener('timeupdate', () => this.onAdTimeUpdate())
    this.adVideo.addEventListener('ended', () => this.onAdEnded())
    this.adVideo.addEventListener('error', () => this.handleAdError())
  }

  /**
   * Attach player events
   */
  private attachPlayerEvents(): void {
    if (!this.player) return

    // Check for preroll on first play
    let firstPlay = true
    this.player.on('play', async () => {
      if (firstPlay) {
        firstPlay = false
        const preroll = this.adBreaks.find(b => b.type === 'preroll' && !b.played)
        if (preroll) {
          await this.playAdBreak(preroll)
        }
      }
    })

    // Check for midrolls
    this.player.on('timeupdate', () => {
      const state = this.player?.state
      if (!state) return

      for (const adBreak of this.adBreaks) {
        if (
          adBreak.type === 'midroll'
          && !adBreak.played
          && adBreak.timeOffset
          && state.currentTime >= adBreak.timeOffset
        ) {
          this.playAdBreak(adBreak)
          break
        }
      }
    })

    // Check for postroll
    this.player.on('ended', async () => {
      const postroll = this.adBreaks.find(b => b.type === 'postroll' && !b.played)
      if (postroll) {
        await this.playAdBreak(postroll)
      }
    })
  }

  /**
   * Preload ads
   */
  private async preloadAds(): Promise<void> {
    for (const adBreak of this.adBreaks) {
      if (adBreak.vastUrl) {
        try {
          // Pre-parse VAST
          await this.parser.parseFromUrl(adBreak.vastUrl)
        }
        catch (error) {
          this.log('Failed to preload ad:', error)
        }
      }
    }
  }

  /**
   * Play ad break
   */
  async playAdBreak(adBreak: AdBreak): Promise<void> {
    if (this.state.isPlaying) return

    this.state.currentBreak = adBreak
    this.state.isLoading = true

    // Pause content
    this.pauseContent()

    try {
      // Parse VAST
      if (adBreak.vastUrl) {
        this.currentAds = await this.parser.parseFromUrl(adBreak.vastUrl)
      }
      else if (adBreak.vastXml) {
        this.currentAds = this.parser.parseFromXml(adBreak.vastXml)
      }

      if (this.currentAds.length === 0) {
        throw new Error('No ads found in VAST response')
      }

      this.currentAdIndex = 0
      adBreak.played = true

      await this.playAd(this.currentAds[0])
    }
    catch (error) {
      this.state.error = (error as Error).message
      this.state.isLoading = false
      this.onAdErrorCallback?.((error as Error).message)
      this.resumeContent()
    }
  }

  /**
   * Play single ad
   */
  private async playAd(ad: Ad): Promise<void> {
    if (!this.adVideo || !this.adContainer) return

    this.state.currentAd = ad
    this.state.isPlaying = true
    this.state.isLoading = false
    this.state.timeRemaining = ad.duration
    this.state.canSkip = false
    this.state.skipCountdown = this.config.skipDelay || 0

    // Select best media file
    const mediaFile = this.selectMediaFile(ad.mediaFiles)
    if (!mediaFile) {
      throw new Error('No suitable media file found')
    }

    // Show ad container
    this.adContainer.style.display = 'block'

    // Set source and play
    this.adVideo.src = mediaFile.url
    await this.adVideo.play()

    // Track impression
    this.trackEvent(ad, 'impression')
    this.trackEvent(ad, 'start')

    // Start skip timer
    this.startSkipTimer(ad)

    this.onAdStart?.(ad)
  }

  /**
   * Select best media file
   */
  private selectMediaFile(mediaFiles: AdMediaFile[]): AdMediaFile | null {
    // Sort by bitrate (highest first) and prefer mp4
    const sorted = [...mediaFiles].sort((a, b) => {
      if (a.type.includes('mp4') && !b.type.includes('mp4')) return -1
      if (!a.type.includes('mp4') && b.type.includes('mp4')) return 1
      return (b.bitrate || 0) - (a.bitrate || 0)
    })

    return sorted[0] || null
  }

  /**
   * Start skip timer
   */
  private startSkipTimer(ad: Ad): void {
    const skipDelay = this.config.skipDelay === -1
      ? (ad.skipOffset || 5)
      : (this.config.skipDelay || 0)

    if (skipDelay <= 0) {
      this.state.canSkip = true
      this.updateSkipButton()
      return
    }

    this.state.skipCountdown = skipDelay

    this.skipTimer = setInterval(() => {
      this.state.skipCountdown--

      if (this.state.skipCountdown <= 0) {
        this.state.canSkip = true
        if (this.skipTimer) {
          clearInterval(this.skipTimer)
          this.skipTimer = null
        }
      }

      this.updateSkipButton()
    }, 1000)
  }

  /**
   * Update skip button
   */
  private updateSkipButton(): void {
    if (!this.skipButton) return

    if (this.state.canSkip) {
      this.skipButton.textContent = 'Skip Ad'
      this.skipButton.style.display = 'block'
    }
    else if (this.state.skipCountdown > 0) {
      this.skipButton.textContent = `Skip in ${this.state.skipCountdown}s`
      this.skipButton.style.display = 'block'
      this.skipButton.style.cursor = 'default'
    }
    else {
      this.skipButton.style.display = 'none'
    }
  }

  /**
   * Skip current ad
   */
  skipAd(): void {
    if (!this.state.canSkip || !this.state.currentAd) return

    this.trackEvent(this.state.currentAd, 'skip')
    this.onAdSkip?.(this.state.currentAd)
    this.onAdEnded()
  }

  /**
   * Handle ad click
   */
  private handleAdClick(): void {
    if (!this.state.currentAd?.clickThroughUrl) return

    // Pause ad
    this.adVideo?.pause()

    // Track click
    this.trackEvent(this.state.currentAd, 'clickThrough')
    this.onAdClick?.(this.state.currentAd)

    // Open URL
    window.open(this.state.currentAd.clickThroughUrl, '_blank')
  }

  /**
   * Handle ad time update
   */
  private onAdTimeUpdate(): void {
    if (!this.adVideo || !this.state.currentAd) return

    const currentTime = this.adVideo.currentTime
    const duration = this.state.currentAd.duration

    this.state.timeRemaining = Math.max(0, duration - currentTime)

    // Track quartiles
    const progress = currentTime / duration
    if (progress >= 0.25) this.trackEvent(this.state.currentAd, 'firstQuartile')
    if (progress >= 0.5) this.trackEvent(this.state.currentAd, 'midpoint')
    if (progress >= 0.75) this.trackEvent(this.state.currentAd, 'thirdQuartile')

    // Track progress events
    for (const event of this.state.currentAd.trackingEvents) {
      if (event.event === 'progress' && event.offset && currentTime >= event.offset) {
        this.trackUrl(event.url)
      }
    }
  }

  /**
   * Handle ad ended
   */
  private onAdEnded(): void {
    if (this.state.currentAd) {
      this.trackEvent(this.state.currentAd, 'complete')
      this.onAdComplete?.(this.state.currentAd)
    }

    // Clean up skip timer
    if (this.skipTimer) {
      clearInterval(this.skipTimer)
      this.skipTimer = null
    }

    // Play next ad or resume content
    this.currentAdIndex++
    if (this.currentAdIndex < this.currentAds.length) {
      this.playAd(this.currentAds[this.currentAdIndex])
    }
    else {
      this.finishAdBreak()
    }
  }

  /**
   * Handle ad error
   */
  private handleAdError(): void {
    const error = 'Ad playback failed'
    this.state.error = error
    this.onAdErrorCallback?.(error)
    this.trackEvent(this.state.currentAd!, 'error')
    this.finishAdBreak()
  }

  /**
   * Finish ad break
   */
  private finishAdBreak(): void {
    this.state.isPlaying = false
    this.state.currentAd = null
    this.state.currentBreak = null
    this.currentAds = []
    this.currentAdIndex = 0

    // Hide ad container
    if (this.adContainer) {
      this.adContainer.style.display = 'none'
    }

    this.onAllAdsComplete?.()
    this.resumeContent()
  }

  /**
   * Pause content
   */
  private pauseContent(): void {
    if (!this.player) return

    const state = this.player.state
    if (state.playbackState === 'playing') {
      this.contentPaused = true
      this.player.pause()
    }
  }

  /**
   * Resume content
   */
  private resumeContent(): void {
    if (!this.player) return

    if (this.contentPaused) {
      this.contentPaused = false
      this.player.play()
    }
  }

  /**
   * Track ad event
   */
  private trackEvent(ad: Ad, eventName: string): void {
    const events = ad.trackingEvents.filter(e => e.event === eventName)
    for (const event of events) {
      this.trackUrl(event.url)
    }
  }

  /**
   * Track URL (fire pixel)
   */
  private trackUrl(url: string): void {
    const img = new Image()
    img.src = url
  }

  /**
   * Log debug message
   */
  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log('[VideoAds]', ...args)
    }
  }

  /**
   * Get current state
   */
  getState(): AdState {
    return { ...this.state }
  }

  /**
   * Set event handlers
   */
  on(event: 'adStart', handler: (ad: Ad) => void): void
  on(event: 'adComplete', handler: (ad: Ad) => void): void
  on(event: 'adSkip', handler: (ad: Ad) => void): void
  on(event: 'adClick', handler: (ad: Ad) => void): void
  on(event: 'adError', handler: (error: string) => void): void
  on(event: 'allAdsComplete', handler: () => void): void
  on(event: string, handler: (...args: any[]) => void): void {
    switch (event) {
      case 'adStart':
        this.onAdStart = handler
        break
      case 'adComplete':
        this.onAdComplete = handler
        break
      case 'adSkip':
        this.onAdSkip = handler
        break
      case 'adClick':
        this.onAdClick = handler
        break
      case 'adError':
        this.onAdErrorCallback = handler
        break
      case 'allAdsComplete':
        this.onAllAdsComplete = handler
        break
    }
  }

  /**
   * Destroy ads manager
   */
  destroy(): void {
    if (this.skipTimer) {
      clearInterval(this.skipTimer)
    }

    if (this.adContainer) {
      this.adContainer.remove()
    }

    this.player = null
    this.container = null
    this.adVideo = null
    this.adContainer = null
  }
}

// =============================================================================
// Factory
// =============================================================================

export function createAdsManager(config?: AdConfig): AdsManager {
  return new AdsManager(config)
}

/**
 * Ads plugin for Player
 */
export function adsPlugin(config: AdConfig) {
  return {
    name: 'ads',

    install(player: Player, container: HTMLElement) {
      const ads = createAdsManager(config)
      ads.attach(player, container)

      // Expose on player
      ;(player as any).ads = ads

      return () => {
        ads.destroy()
        delete (player as any).ads
      }
    },
  }
}

/**
 * ts-video-player Player
 *
 * Main player class that orchestrates providers, state, and UI.
 *
 * @module player
 */

import type {
  Player as IPlayer,
  PlayerOptions,
  PlayerState,
  PlayerEventMap,
  Provider,
  ProviderLoader,
  Src,
  VideoQuality,
} from './types'
import { StateStore, createStorageSync, selectBufferedAmount } from './core/state'
import { EventEmitter, createKeyboardHandler, createActivityDetector, type KeyboardActions } from './core/events'
import { createMediaSession, type MediaSessionOptions } from './core/media-session'
import { lockOrientation, unlockOrientation } from './core/orientation'
import { defaultLoaders, findLoader, detectMediaType } from './providers'

// =============================================================================
// Player Class
// =============================================================================

/**
 * ts-video-player main class
 */
export class Player implements IPlayer {
  private _el: HTMLElement
  private _options: PlayerOptions
  private _store: StateStore
  private _events = new EventEmitter<PlayerEventMap>()
  private _provider: Provider | null = null
  private _loaders: ProviderLoader[]
  private _cleanupFns: Array<() => void> = []
  private _destroyed = false

  /**
   * Create a new player instance
   */
  constructor(container: HTMLElement | string, options: PlayerOptions = {}) {
    // Resolve container
    if (typeof container === 'string') {
      const el = document.querySelector(container) as HTMLElement
      if (!el) throw new Error(`Container element not found: ${container}`)
      this._el = el
    } else {
      this._el = container
    }

    this._options = { ...defaultOptions, ...options }
    this._loaders = defaultLoaders
    this._store = new StateStore()

    // Setup
    this.setupElement()
    this.setupState()
    this.setupKeyboard()
    this.setupActivity()
    this.setupStorage()
    this.setupMediaSession()
    this.setupEvents()

    // Load initial source
    if (this._options.src) {
      this.setSrc(this._options.src)
    }

    // Emit init event
    this._events.emit('init')
  }

  // === Public Properties ===

  get el(): HTMLElement {
    return this._el
  }

  get state(): PlayerState {
    return this._store.getState()
  }

  get provider(): Provider | null {
    return this._provider
  }

  get ready(): boolean {
    return this._provider?.ready || false
  }

  // === Setup ===

  private setupElement(): void {
    this._el.classList.add('ts-video-player')
    this._el.setAttribute('tabindex', '0')
    this._el.setAttribute('role', 'application')
    this._el.setAttribute('aria-label', this._options.title || 'Video player')

    // Create inner structure
    const mediaContainer = document.createElement('div')
    mediaContainer.className = 'ts-video-player__container'
    this._el.appendChild(mediaContainer)

    // Store reference
    ;(this._el as any).__videoPlayer = this
  }

  private setupState(): void {
    // Initial state from options
    this._store.batch({
      volume: this._options.volume ?? 1,
      muted: this._options.muted ?? false,
      loop: this._options.loop ?? false,
      autoplay: this._options.autoplay ?? false,
      playbackRate: this._options.playbackRate ?? 1,
      poster: this._options.poster || '',
      title: this._options.title || '',
      preload: this._options.preload || 'metadata',
    })

    // Subscribe to state changes
    const unsubscribe = this._store.subscribe((state, key) => {
      // Update DOM attributes
      this.updateAttributes(state)
    })

    this._cleanupFns.push(unsubscribe)
  }

  private setupKeyboard(): void {
    if (this._options.keyboard === false) return

    const actions: KeyboardActions = {
      togglePlay: () => this.togglePlay(),
      toggleMute: () => this.toggleMute(),
      toggleFullscreen: () => this.toggleFullscreen(),
      togglePiP: () => this.togglePiP(),
      toggleCaptions: () => this.toggleCaptions(),
      seekBackward: () => this.seekBy(-5),
      seekForward: () => this.seekBy(5),
      volumeUp: () => this.setVolume(Math.min(1, this.state.volume + 0.1)),
      volumeDown: () => this.setVolume(Math.max(0, this.state.volume - 0.1)),
      speedUp: () => this.setPlaybackRate(Math.min(4, this.state.playbackRate + 0.25)),
      speedDown: () => this.setPlaybackRate(Math.max(0.25, this.state.playbackRate - 0.25)),
      seekStart: () => this.seekTo(0),
      seekEnd: () => this.seekTo(this.state.duration),
      seekPercent: (percent) => this.seekTo((percent / 100) * this.state.duration),
    }

    const config = typeof this._options.keyboard === 'object' ? this._options.keyboard : {}
    const handler = createKeyboardHandler(actions, {
      seekStep: config.seekStep,
      volumeStep: config.volumeStep,
    })

    const target = config.global ? document : this._el
    target.addEventListener('keydown', handler)

    this._cleanupFns.push(() => target.removeEventListener('keydown', handler))
  }

  private setupActivity(): void {
    const cleanup = createActivityDetector(this._el, {
      timeout: this._options.controlsTimeout || 3000,
      onActive: () => {
        this._store.batch({ userActive: true, controlsVisible: true })
        this._events.emit('useractivitychange', true)
        this._events.emit('controlschange', true)
      },
      onInactive: () => {
        // Only hide controls if playing
        if (this.state.playing) {
          this._store.batch({ userActive: false, controlsVisible: false })
          this._events.emit('useractivitychange', false)
          this._events.emit('controlschange', false)
        }
      },
    })

    this._cleanupFns.push(cleanup)

    // Pointer over tracking
    this._el.addEventListener('mouseenter', () => this._store.set('pointerOver', true))
    this._el.addEventListener('mouseleave', () => this._store.set('pointerOver', false))
  }

  private setupStorage(): void {
    if (!this._options.storage) return

    const config = typeof this._options.storage === 'object' ? this._options.storage : {}
    const storage = config.type === 'session' ? sessionStorage : localStorage

    const cleanup = createStorageSync(this._store, config.persist || ['volume', 'muted', 'playbackRate'], storage)

    this._cleanupFns.push(cleanup)
  }

  private setupMediaSession(): void {
    if (this._options.mediaSession === false) return

    const sessionOpts: MediaSessionOptions | undefined =
      typeof this._options.mediaSession === 'object'
        ? this._options.mediaSession
        : this._options.title
          ? { title: this._options.title }
          : undefined

    const cleanup = createMediaSession(
      this._store,
      {
        play: () => this.play(),
        pause: () => this.pause(),
        seekTo: (time) => this.seekTo(time),
        seekBy: (offset) => this.seekBy(offset),
        stop: () => this.stop(),
      },
      sessionOpts,
    )

    this._cleanupFns.push(cleanup)
  }

  private setupEvents(): void {
    // Attach option event listeners
    if (this._options.on) {
      for (const [event, handler] of Object.entries(this._options.on)) {
        if (handler) {
          this.on(event as keyof PlayerEventMap, handler as PlayerEventMap[keyof PlayerEventMap])
        }
      }
    }
  }

  private updateAttributes(state: PlayerState): void {
    const el = this._el

    // Playback state
    el.dataset.paused = String(state.paused)
    el.dataset.playing = String(state.playing)
    el.dataset.started = String(state.started)
    el.dataset.ended = String(state.ended)
    el.dataset.seeking = String(state.seeking)
    el.dataset.waiting = String(state.waiting)
    el.dataset.loop = String(state.loop)
    el.dataset.autoplay = String(state.autoplay)

    // Loading state
    el.dataset.loading = String(state.waiting || state.loadingState === 'loading')
    el.dataset.canPlay = String(state.canPlay)
    el.dataset.loadingState = state.loadingState

    // Volume
    el.dataset.muted = String(state.muted)
    el.dataset.volumeLevel = state.muted || state.volume === 0
      ? 'silent'
      : state.volume < 0.5
        ? 'low'
        : 'high'

    // Fullscreen / PiP
    el.dataset.fullscreen = String(state.fullscreen)
    el.dataset.pip = String(state.pictureInPicture)

    // UI
    el.dataset.controlsVisible = String(state.controlsVisible)
    el.dataset.userActive = String(state.userActive)

    // Media type
    el.dataset.mediaType = state.mediaType
    el.dataset.streamType = state.streamType

    // Captions
    const hasActiveCaptions = state.textTracks.some((t) => t.mode === 'showing')
    el.dataset.captions = String(hasActiveCaptions)

    // Error
    el.dataset.error = String(!!state.error)
  }

  // === Lifecycle ===

  destroy(): void {
    if (this._destroyed) return
    this._destroyed = true

    // Emit destroy event
    this._events.emit('destroy')

    // Cleanup
    this._cleanupFns.forEach((fn) => fn())
    this._cleanupFns = []

    // Destroy provider
    this._provider?.destroy()
    this._provider = null

    // Remove events
    this._events.removeAllListeners()

    // Reset store
    this._store.reset()

    // Clear element
    this._el.classList.remove('ts-video-player')
    this._el.innerHTML = ''
    delete (this._el as any).__videoPlayer
  }

  // === Source ===

  async setSrc(src: Src | Src[]): Promise<void> {
    if (this._destroyed) return

    const sources = Array.isArray(src) ? src : [src]
    if (sources.length === 0) return

    // Update state
    this._store.batch({
      sources,
      src: sources[0],
      loadingState: 'loading',
      error: null,
    })

    this._events.emit('sourceschange', sources)

    // Find loader for first source
    const firstSrc = sources[0]
    const loader = findLoader(firstSrc, this._loaders)

    if (!loader) {
      this._store.batch({
        loadingState: 'error',
        error: { code: 4, message: 'No compatible provider found for source' },
      })
      return
    }

    // Detect media type
    const mediaType = detectMediaType(firstSrc, this._loaders)
    this._store.set('mediaType', mediaType)

    // Destroy existing provider if different type
    if (this._provider && this._provider.type !== loader.type) {
      this._provider.destroy()
      this._provider = null
      this._events.emit('providerchange', null)
    }

    // Create or reuse provider
    if (!this._provider) {
      const mediaContainer = this._el.querySelector('.ts-video-player__container') as HTMLElement
      try {
        this._provider = await loader.load(mediaContainer, this._options)
        if (this._destroyed) { this._provider.destroy(); this._provider = null; return }
        this._events.emit('providerchange', this._provider)
        this.attachProviderEvents(this._provider)
      } catch (error) {
        if (this._destroyed) return
        this._store.batch({
          loadingState: 'error',
          error: { code: 5, message: 'Failed to load provider', details: error },
        })
        return
      }
    }

    if (this._destroyed) return

    // Load source
    try {
      await this._provider.load(firstSrc)
    } catch (error) {
      if (this._destroyed) return
      this._store.batch({
        loadingState: 'error',
        error: { code: 4, message: 'Failed to load source', details: error },
      })
    }
  }

  getSrc(): Src | null {
    return this.state.src
  }

  private attachProviderEvents(provider: Provider): void {
    // Forward provider events and update state
    provider.on('loadstart', () => {
      this._store.set('loadingState', 'loading')
      this._events.emit('loadstart')
    })

    provider.on('loadedmetadata', () => {
      this._events.emit('loadedmetadata')
    })

    provider.on('loadeddata', () => {
      this._events.emit('loadeddata')
    })

    provider.on('canplay', () => {
      this._store.batch({ canPlay: true, loadingState: 'loaded' })
      this._events.emit('canplay')
    })

    provider.on('canplaythrough', () => {
      this._store.set('canPlayThrough', true)
      this._events.emit('canplaythrough')
    })

    provider.on('play', () => {
      this._store.batch({ paused: false, ended: false })
      this._events.emit('play')
    })

    provider.on('pause', () => {
      this._store.set('paused', true)
      this._events.emit('pause')
    })

    provider.on('playing', () => {
      this._store.batch({ playing: true, started: true, waiting: false, playbackState: 'playing' })
      this._events.emit('playing')
    })

    provider.on('waiting', () => {
      this._store.batch({ waiting: true, playbackState: 'buffering' })
      this._events.emit('waiting')
    })

    provider.on('seeking', () => {
      this._store.set('seeking', true)
      this._events.emit('seeking')
    })

    provider.on('seeked', () => {
      this._store.set('seeking', false)
      this._events.emit('seeked')
    })

    provider.on('timeupdate', (time) => {
      this._store.set('currentTime', time)
      this._events.emit('timeupdate', time)
    })

    provider.on('durationchange', (duration) => {
      this._store.set('duration', duration)
      this._events.emit('durationchange', duration)
    })

    provider.on('volumechange', (volume, muted) => {
      this._store.batch({ volume, muted })
      this._events.emit('volumechange', volume, muted)
    })

    provider.on('ratechange', (rate) => {
      this._store.set('playbackRate', rate)
      this._events.emit('ratechange', rate)
    })

    provider.on('progress', (buffered) => {
      this._store.batch({
        buffered,
        bufferedAmount: selectBufferedAmount({ ...this.state, buffered }),
      })
      this._events.emit('progress', buffered)
    })

    provider.on('ended', () => {
      this._store.batch({ ended: true, playing: false, playbackState: 'ended' })
      this._events.emit('ended')

      // Handle loop
      if (this.state.loop) {
        this.seekTo(0)
        this.play()
      }
    })

    provider.on('error', (error) => {
      this._store.batch({ loadingState: 'error', error })
      this._events.emit('error', error)
    })

    provider.on('statechange', (state) => {
      this._store.batch(state)
      this._events.emit('statechange', state)
    })

    provider.on('qualitychange', (quality) => {
      this._store.set('qualities', provider.getQualities())
      this._events.emit('qualitychange', quality)
    })

    provider.on('fullscreenchange', (fullscreen) => {
      this._store.set('fullscreen', fullscreen)
      this._events.emit('fullscreenchange', fullscreen)
    })

    provider.on('pipchange', (pip) => {
      this._store.set('pictureInPicture', pip)
      this._events.emit('pipchange', pip)
    })

    provider.on('availabilitychange', (feature, availability) => {
      if (feature === 'volume') this._store.set('volumeAvailability', availability)
      else if (feature === 'fullscreen') this._store.set('fullscreenAvailability', availability)
      else if (feature === 'pip') this._store.set('pipAvailability', availability)
      this._events.emit('availabilitychange', feature, availability)
    })
  }

  // === Playback ===

  async play(): Promise<void> {
    if (!this._provider) return
    await this._provider.play()
  }

  pause(): void {
    this._provider?.pause()
  }

  togglePlay(): void {
    if (this.state.paused) {
      this.play()
    } else {
      this.pause()
    }
  }

  stop(): void {
    this._provider?.stop()
    this._store.batch({ playing: false, paused: true, currentTime: 0, playbackState: 'idle' })
  }

  // === Seeking ===

  seekTo(time: number): void {
    this._provider?.seekTo(time)
  }

  seekBy(offset: number): void {
    const newTime = Math.max(0, Math.min(this.state.currentTime + offset, this.state.duration))
    this.seekTo(newTime)
  }

  // === Volume ===

  setVolume(volume: number): void {
    if (this.state.volumeAvailability === 'unsupported') return
    const clamped = Math.max(0, Math.min(1, volume))
    this._provider?.setVolume(clamped)
    this._store.set('volume', clamped)
  }

  setMuted(muted: boolean): void {
    this._provider?.setMuted(muted)
    this._store.set('muted', muted)
  }

  toggleMute(): void {
    this.setMuted(!this.state.muted)
  }

  // === Playback Rate ===

  setPlaybackRate(rate: number): void {
    const clamped = Math.max(0.25, Math.min(4, rate))
    this._provider?.setPlaybackRate(clamped)
    this._store.set('playbackRate', clamped)
  }

  // === Fullscreen ===

  async enterFullscreen(): Promise<void> {
    if (this.state.fullscreenAvailability === 'unsupported') return
    // Exit PiP before entering fullscreen (mutual exclusion)
    if (this.state.pictureInPicture) {
      await this.exitPiP()
    }
    await this._provider?.enterFullscreen()
    if (this._options.fullscreenOrientationLock !== false) {
      lockOrientation('landscape')
    }
  }

  async exitFullscreen(): Promise<void> {
    await this._provider?.exitFullscreen()
    if (this._options.fullscreenOrientationLock !== false) {
      unlockOrientation()
    }
  }

  async toggleFullscreen(): Promise<void> {
    if (this.state.fullscreen) {
      await this.exitFullscreen()
    } else {
      await this.enterFullscreen()
    }
  }

  // === Picture-in-Picture ===

  async enterPiP(): Promise<void> {
    if (this.state.pipAvailability === 'unsupported') return
    // Exit fullscreen before entering PiP (mutual exclusion)
    if (this.state.fullscreen) {
      await this.exitFullscreen()
    }
    await this._provider?.enterPiP()
  }

  async exitPiP(): Promise<void> {
    await this._provider?.exitPiP()
  }

  async togglePiP(): Promise<void> {
    if (this.state.pictureInPicture) {
      await this.exitPiP()
    } else {
      await this.enterPiP()
    }
  }

  // === Tracks ===

  setQuality(quality: VideoQuality | 'auto'): void {
    this._provider?.setQuality(quality)
    if (quality === 'auto') {
      this._store.set('autoQuality', true)
    } else {
      this._store.set('autoQuality', false)
    }
  }

  setTextTrack(trackId: string, mode: 'disabled' | 'hidden' | 'showing'): void {
    this._provider?.setTextTrackMode(trackId, mode)
    this._store.set('textTracks', this._provider?.getTextTracks() || [])
  }

  setAudioTrack(trackId: string): void {
    this._provider?.setAudioTrack(trackId)
    this._store.set('audioTracks', this._provider?.getAudioTracks() || [])
  }

  private toggleCaptions(): void {
    const textTracks = this.state.textTracks
    const showing = textTracks.find((t) => t.mode === 'showing')

    if (showing) {
      this.setTextTrack(showing.id, 'disabled')
    } else {
      const first = textTracks.find((t) => t.kind === 'subtitles' || t.kind === 'captions')
      if (first) {
        this.setTextTrack(first.id, 'showing')
      }
    }
  }

  // === Events ===

  on<K extends keyof PlayerEventMap>(event: K, handler: PlayerEventMap[K]): void {
    this._events.on(event, handler)
  }

  off<K extends keyof PlayerEventMap>(event: K, handler: PlayerEventMap[K]): void {
    this._events.off(event, handler)
  }

  once<K extends keyof PlayerEventMap>(event: K, handler: PlayerEventMap[K]): void {
    this._events.once(event, handler)
  }

  // === State Subscription ===

  subscribe(
    keyOrListener: keyof PlayerState | '*' | ((state: PlayerState, key?: keyof PlayerState) => void),
    listener?: (state: PlayerState, key?: keyof PlayerState) => void,
  ): () => void {
    return this._store.subscribe(keyOrListener, listener)
  }
}

// =============================================================================
// Default Options
// =============================================================================

const defaultOptions: PlayerOptions = {
  autoplay: false,
  loop: false,
  muted: false,
  volume: 1,
  playbackRate: 1,
  playsinline: true,
  preload: 'metadata',
  controls: true,
  keyboard: true,
  controlsTimeout: 3000,
  storage: true,
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a new player instance
 *
 * @example
 * ```typescript
 * const player = createPlayer('#video-container', {
 *   src: 'https://example.com/video.mp4',
 *   autoplay: true,
 * })
 *
 * player.on('playing', () => console.log('Video is playing!'))
 * ```
 */
export function createPlayer(container: HTMLElement | string, options?: PlayerOptions): Player {
  return new Player(container, options)
}

// =============================================================================
// Get Player Instance
// =============================================================================

/**
 * Get player instance from element
 */
export function getPlayer(element: HTMLElement): Player | null {
  return (element as any).__videoPlayer || null
}

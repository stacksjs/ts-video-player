/**
 * Remote Playback (AirPlay & Google Cast)
 *
 * Provides support for remote playback via AirPlay and Google Cast.
 *
 * @module core/remote-playback
 */

// =============================================================================
// Types
// =============================================================================

export type RemotePlaybackType = 'airplay' | 'googlecast' | 'none'

export type RemotePlaybackState = 'disconnected' | 'connecting' | 'connected'

export interface RemoteDevice {
  /** Device name */
  name: string
  /** Device type */
  type: RemotePlaybackType
  /** Device ID (if available) */
  id?: string
}

export interface RemotePlaybackConfig {
  /** Enable AirPlay (default: true on Safari) */
  airPlay?: boolean
  /** Enable Google Cast (default: true) */
  googleCast?: boolean
  /** Google Cast application ID (default: Chrome default receiver) */
  castApplicationId?: string
  /** Callback when device availability changes */
  onAvailabilityChange?: (type: RemotePlaybackType, available: boolean) => void
  /** Callback when connection state changes */
  onStateChange?: (state: RemotePlaybackState, device?: RemoteDevice) => void
}

// =============================================================================
// AirPlay Support
// =============================================================================

/**
 * Check if AirPlay is supported
 */
export function isAirPlaySupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'WebKitPlaybackTargetAvailabilityEvent' in window
}

/**
 * Check if an element has AirPlay available
 */
export function isAirPlayAvailable(video: HTMLVideoElement): boolean {
  return (video as any).webkitCurrentPlaybackTargetIsWireless !== undefined
}

/**
 * Show AirPlay picker
 */
export function showAirPlayPicker(video: HTMLVideoElement): void {
  if ((video as any).webkitShowPlaybackTargetPicker) {
    (video as any).webkitShowPlaybackTargetPicker()
  }
}

/**
 * Check if currently playing via AirPlay
 */
export function isAirPlaying(video: HTMLVideoElement): boolean {
  return (video as any).webkitCurrentPlaybackTargetIsWireless === true
}

// =============================================================================
// Google Cast Support
// =============================================================================

declare global {
  interface Window {
    chrome?: {
      cast?: any
    }
    __onGCastApiAvailable?: (isAvailable: boolean) => void
  }
}

let castInitialized = false
let castSession: any = null

/**
 * Check if Google Cast is supported
 */
export function isGoogleCastSupported(): boolean {
  if (typeof window === 'undefined') return false
  return !!window.chrome?.cast
}

/**
 * Load the Google Cast SDK
 */
export function loadGoogleCastSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isGoogleCastSupported()) {
      resolve()
      return
    }

    // Check if already loading
    if (document.querySelector('script[src*="cast_sender"]')) {
      // Wait for it to load
      window.__onGCastApiAvailable = (isAvailable) => {
        if (isAvailable) {
          resolve()
        }
        else {
          reject(new Error('Google Cast SDK not available'))
        }
      }
      return
    }

    const script = document.createElement('script')
    script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1'
    script.async = true

    window.__onGCastApiAvailable = (isAvailable) => {
      if (isAvailable) {
        resolve()
      }
      else {
        reject(new Error('Google Cast SDK not available'))
      }
    }

    script.onerror = () => reject(new Error('Failed to load Google Cast SDK'))
    document.head.appendChild(script)
  })
}

/**
 * Initialize Google Cast
 */
export function initializeGoogleCast(applicationId?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isGoogleCastSupported()) {
      reject(new Error('Google Cast not supported'))
      return
    }

    if (castInitialized) {
      resolve()
      return
    }

    const cast = window.chrome!.cast!
    const castContext = cast.framework.CastContext.getInstance()

    castContext.setOptions({
      receiverApplicationId: applicationId || cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
      autoJoinPolicy: cast.AutoJoinPolicy.ORIGIN_SCOPED,
    })

    castInitialized = true
    resolve()
  })
}

/**
 * Request a Google Cast session
 */
export async function requestCastSession(): Promise<any> {
  if (!isGoogleCastSupported()) {
    throw new Error('Google Cast not supported')
  }

  const cast = window.chrome!.cast!
  const castContext = cast.framework.CastContext.getInstance()

  try {
    await castContext.requestSession()
    castSession = castContext.getCurrentSession()
    return castSession
  }
  catch (error) {
    throw new Error('Failed to start Cast session')
  }
}

/**
 * End Google Cast session
 */
export function endCastSession(): void {
  if (castSession) {
    castSession.endSession(true)
    castSession = null
  }
}

/**
 * Check if currently casting
 */
export function isCasting(): boolean {
  return castSession !== null
}

/**
 * Get current cast session
 */
export function getCastSession(): any {
  return castSession
}

/**
 * Cast media to connected device
 */
export function castMedia(
  url: string,
  contentType: string,
  metadata?: {
    title?: string
    subtitle?: string
    images?: string[]
  }
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!castSession) {
      reject(new Error('No active Cast session'))
      return
    }

    const cast = window.chrome!.cast!
    const mediaInfo = new cast.media.MediaInfo(url, contentType)

    if (metadata) {
      const meta = new cast.media.GenericMediaMetadata()
      if (metadata.title) meta.title = metadata.title
      if (metadata.subtitle) meta.subtitle = metadata.subtitle
      if (metadata.images) {
        meta.images = metadata.images.map((img: string) => new cast.Image(img))
      }
      mediaInfo.metadata = meta
    }

    const request = new cast.media.LoadRequest(mediaInfo)

    castSession.loadMedia(request).then(
      () => resolve(),
      (error: any) => reject(new Error(`Cast failed: ${error.description}`))
    )
  })
}

// =============================================================================
// Remote Playback Controller
// =============================================================================

export class RemotePlaybackController {
  private video: HTMLVideoElement | null = null
  private config: Required<RemotePlaybackConfig>
  private state: RemotePlaybackState = 'disconnected'
  private connectedDevice: RemoteDevice | null = null
  private airPlayAvailable = false
  private googleCastAvailable = false
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map()

  constructor(config: RemotePlaybackConfig = {}) {
    this.config = {
      airPlay: config.airPlay ?? true,
      googleCast: config.googleCast ?? true,
      castApplicationId: config.castApplicationId || '',
      onAvailabilityChange: config.onAvailabilityChange || (() => {}),
      onStateChange: config.onStateChange || (() => {}),
    }
  }

  /**
   * Attach to a video element
   */
  async attach(video: HTMLVideoElement): Promise<void> {
    this.video = video

    // Setup AirPlay
    if (this.config.airPlay && isAirPlaySupported()) {
      this.setupAirPlay()
    }

    // Setup Google Cast
    if (this.config.googleCast) {
      try {
        await loadGoogleCastSDK()
        await initializeGoogleCast(this.config.castApplicationId)
        this.setupGoogleCast()
      }
      catch (error) {
        console.warn('Google Cast initialization failed:', error)
      }
    }
  }

  /**
   * Setup AirPlay event listeners
   */
  private setupAirPlay(): void {
    if (!this.video) return

    // Listen for availability
    this.video.addEventListener('webkitplaybacktargetavailabilitychanged', ((event: any) => {
      this.airPlayAvailable = event.availability === 'available'
      this.config.onAvailabilityChange('airplay', this.airPlayAvailable)
      this.emit('airplayavailabilitychange', this.airPlayAvailable)
    }) as EventListener)

    // Listen for connection state
    this.video.addEventListener('webkitcurrentplaybacktargetiswirelesschanged', (() => {
      const isWireless = isAirPlaying(this.video!)

      if (isWireless) {
        this.state = 'connected'
        this.connectedDevice = {
          name: 'AirPlay Device',
          type: 'airplay',
        }
      }
      else {
        this.state = 'disconnected'
        this.connectedDevice = null
      }

      this.config.onStateChange(this.state, this.connectedDevice || undefined)
      this.emit('statechange', this.state, this.connectedDevice)
    }) as EventListener)
  }

  /**
   * Setup Google Cast event listeners
   */
  private setupGoogleCast(): void {
    if (!isGoogleCastSupported()) return

    const cast = window.chrome!.cast!
    const castContext = cast.framework.CastContext.getInstance()

    // Check initial availability
    this.googleCastAvailable = castContext.getCastState() !== cast.framework.CastState.NO_DEVICES_AVAILABLE
    this.config.onAvailabilityChange('googlecast', this.googleCastAvailable)

    // Listen for cast state changes
    castContext.addEventListener(
      cast.framework.CastContextEventType.CAST_STATE_CHANGED,
      (event: any) => {
        this.googleCastAvailable = event.castState !== cast.framework.CastState.NO_DEVICES_AVAILABLE
        this.config.onAvailabilityChange('googlecast', this.googleCastAvailable)
        this.emit('googlecastavailabilitychange', this.googleCastAvailable)

        // Update connection state
        switch (event.castState) {
          case cast.framework.CastState.CONNECTED:
            this.state = 'connected'
            const session = castContext.getCurrentSession()
            this.connectedDevice = {
              name: session?.getCastDevice()?.friendlyName || 'Cast Device',
              type: 'googlecast',
              id: session?.getCastDevice()?.id,
            }
            break
          case cast.framework.CastState.CONNECTING:
            this.state = 'connecting'
            break
          default:
            this.state = 'disconnected'
            this.connectedDevice = null
        }

        this.config.onStateChange(this.state, this.connectedDevice || undefined)
        this.emit('statechange', this.state, this.connectedDevice)
      }
    )
  }

  /**
   * Show remote playback picker
   */
  async showPicker(type?: RemotePlaybackType): Promise<void> {
    if (type === 'airplay' || (!type && this.airPlayAvailable)) {
      if (this.video) {
        showAirPlayPicker(this.video)
      }
    }
    else if (type === 'googlecast' || (!type && this.googleCastAvailable)) {
      await requestCastSession()
    }
  }

  /**
   * Disconnect from remote device
   */
  disconnect(): void {
    if (this.connectedDevice?.type === 'googlecast') {
      endCastSession()
    }
    // AirPlay disconnect is handled by the system

    this.state = 'disconnected'
    this.connectedDevice = null
    this.emit('statechange', this.state, null)
  }

  /**
   * Check if AirPlay is available
   */
  isAirPlayAvailable(): boolean {
    return this.airPlayAvailable
  }

  /**
   * Check if Google Cast is available
   */
  isGoogleCastAvailable(): boolean {
    return this.googleCastAvailable
  }

  /**
   * Check if any remote playback is available
   */
  isRemotePlaybackAvailable(): boolean {
    return this.airPlayAvailable || this.googleCastAvailable
  }

  /**
   * Get current state
   */
  getState(): RemotePlaybackState {
    return this.state
  }

  /**
   * Get connected device
   */
  getConnectedDevice(): RemoteDevice | null {
    return this.connectedDevice
  }

  /**
   * Check if currently connected to a remote device
   */
  isConnected(): boolean {
    return this.state === 'connected'
  }

  /**
   * Add event listener
   */
  on(event: string, handler: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)
  }

  /**
   * Remove event listener
   */
  off(event: string, handler: (...args: any[]) => void): void {
    this.listeners.get(event)?.delete(handler)
  }

  /**
   * Emit event
   */
  private emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach(handler => handler(...args))
  }

  /**
   * Detach from video element
   */
  detach(): void {
    this.disconnect()
    this.video = null
  }

  /**
   * Destroy controller
   */
  destroy(): void {
    this.detach()
    this.listeners.clear()
  }
}

// =============================================================================
// UI Components
// =============================================================================

export class AirPlayButton {
  private button: HTMLButtonElement
  private _available = false

  constructor() {
    this.button = document.createElement('button')
    this.button.className = 'tsvp-airplay-button'
    this.button.type = 'button'
    this.button.setAttribute('aria-label', 'AirPlay')
    this.button.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M6 22h12l-6-6-6 6zM21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v-2H3V5h18v12h-4v2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
      </svg>
    `

    this.applyStyles()
    this.hide()
  }

  private applyStyles(): void {
    this.button.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--tsvp-controls-button-size, 40px);
      height: var(--tsvp-controls-button-size, 40px);
      padding: 0;
      border: none;
      background: transparent;
      color: var(--tsvp-color-text, #ffffff);
      cursor: pointer;
      opacity: 0.8;
      transition: opacity var(--tsvp-transition-normal, 200ms);
    `
  }

  getElement(): HTMLButtonElement {
    return this.button
  }

  setAvailable(available: boolean): void {
    this._available = available
    if (available) {
      this.show()
    }
    else {
      this.hide()
    }
  }

  isAvailable(): boolean {
    return this._available
  }

  show(): void {
    this.button.style.display = 'flex'
  }

  hide(): void {
    this.button.style.display = 'none'
  }

  setActive(active: boolean): void {
    this.button.classList.toggle('tsvp-active', active)
    this.button.style.color = active ? 'var(--tsvp-color-primary, #00a8ff)' : ''
  }

  onClick(handler: () => void): void {
    this.button.addEventListener('click', handler)
  }

  destroy(): void {
    this.button.remove()
  }
}

export class GoogleCastButton {
  private button: HTMLButtonElement
  private _available = false

  constructor() {
    this.button = document.createElement('button')
    this.button.className = 'tsvp-googlecast-button'
    this.button.type = 'button'
    this.button.setAttribute('aria-label', 'Cast')
    this.button.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M21 3H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm0-4v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11z"/>
      </svg>
    `

    this.applyStyles()
    this.hide()
  }

  private applyStyles(): void {
    this.button.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--tsvp-controls-button-size, 40px);
      height: var(--tsvp-controls-button-size, 40px);
      padding: 0;
      border: none;
      background: transparent;
      color: var(--tsvp-color-text, #ffffff);
      cursor: pointer;
      opacity: 0.8;
      transition: opacity var(--tsvp-transition-normal, 200ms);
    `
  }

  getElement(): HTMLButtonElement {
    return this.button
  }

  setAvailable(available: boolean): void {
    this._available = available
    if (available) {
      this.show()
    }
    else {
      this.hide()
    }
  }

  isAvailable(): boolean {
    return this._available
  }

  show(): void {
    this.button.style.display = 'flex'
  }

  hide(): void {
    this.button.style.display = 'none'
  }

  setActive(active: boolean): void {
    this.button.classList.toggle('tsvp-active', active)
    this.button.style.color = active ? 'var(--tsvp-color-primary, #00a8ff)' : ''
  }

  onClick(handler: () => void): void {
    this.button.addEventListener('click', handler)
  }

  destroy(): void {
    this.button.remove()
  }
}

// =============================================================================
// Factory
// =============================================================================

export function createRemotePlaybackController(config?: RemotePlaybackConfig): RemotePlaybackController {
  return new RemotePlaybackController(config)
}

export function createAirPlayButton(): AirPlayButton {
  return new AirPlayButton()
}

export function createGoogleCastButton(): GoogleCastButton {
  return new GoogleCastButton()
}

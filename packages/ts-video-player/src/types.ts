/**
 * ts-video-player Types
 *
 * Core type definitions for the video player library.
 *
 * @module types
 */

// =============================================================================
// Media Source Types
// =============================================================================

/**
 * Supported media source types
 */
export type MediaType = 'video' | 'audio' | 'unknown'

/**
 * Stream types
 */
export type StreamType = 'on-demand' | 'live' | 'live:dvr' | 'll-live' | 'unknown'

/**
 * Provider types
 */
export type ProviderType = 'video' | 'audio' | 'hls' | 'dash' | 'youtube' | 'vimeo' | 'unknown'

/**
 * Media source
 */
export interface MediaSource {
  /** Source URL */
  src: string
  /** MIME type (e.g., 'video/mp4', 'application/x-mpegURL') */
  type?: string
  /** Source quality label */
  quality?: string
  /** Source width */
  width?: number
  /** Source height */
  height?: number
  /** Bitrate in bps */
  bitrate?: number
  /** Codec string */
  codec?: string
}

/**
 * YouTube source configuration
 */
export interface YouTubeSource {
  src: string
  type: 'youtube'
  /** Video ID extracted from URL */
  videoId?: string
  /** Start time in seconds */
  startTime?: number
  /** End time in seconds */
  endTime?: number
}

/**
 * Vimeo source configuration
 */
export interface VimeoSource {
  src: string
  type: 'vimeo'
  /** Video ID extracted from URL */
  videoId?: string
  /** Hash for private videos */
  hash?: string
}

/**
 * HLS source configuration
 */
export interface HLSSource {
  src: string
  type: 'application/x-mpegURL' | 'application/vnd.apple.mpegurl'
  /** HLS.js configuration overrides */
  config?: Record<string, unknown>
}

/**
 * DASH source configuration
 */
export interface DASHSource {
  src: string
  type: 'application/dash+xml'
  /** dash.js configuration overrides */
  config?: Record<string, unknown>
}

/**
 * Any supported source type
 */
export type Src = string | MediaSource | YouTubeSource | VimeoSource | HLSSource | DASHSource

// =============================================================================
// Player State Types
// =============================================================================

/**
 * Preload strategy
 */
export type PreloadStrategy = 'none' | 'metadata' | 'auto'

/**
 * Crossorigin attribute
 */
export type CrossOrigin = 'anonymous' | 'use-credentials' | ''

/**
 * Loading state
 */
export type LoadingState = 'idle' | 'loading' | 'loaded' | 'error'

/**
 * Playback state
 */
export type PlaybackState = 'idle' | 'buffering' | 'playing' | 'paused' | 'ended'

/**
 * Time range representation
 */
export interface TimeRange {
  start: number
  end: number
}

/**
 * Video quality representation
 */
export interface VideoQuality {
  id: string
  width: number
  height: number
  bitrate: number
  codec?: string
  selected: boolean
}

/**
 * Audio track representation
 */
export interface AudioTrack {
  id: string
  label: string
  language: string
  kind: string
  selected: boolean
}

/**
 * Text track/caption representation
 */
export interface TextTrack {
  id: string
  kind: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'
  label: string
  language: string
  src?: string
  default?: boolean
  mode: 'disabled' | 'hidden' | 'showing'
  cues: TextTrackCue[]
}

/**
 * Text track cue
 */
export interface TextTrackCue {
  id: string
  startTime: number
  endTime: number
  text: string
  position?: 'auto' | number
  line?: 'auto' | number
  align?: 'start' | 'center' | 'end'
}

/**
 * Player state
 */
export interface PlayerState {
  // === Source ===
  /** Current source */
  src: Src | null
  /** All available sources */
  sources: Src[]
  /** Current source index */
  currentSourceIndex: number
  /** Media type (video/audio) */
  mediaType: MediaType
  /** Stream type (on-demand/live) */
  streamType: StreamType
  /** Provider type */
  providerType: ProviderType

  // === Loading ===
  /** Loading state */
  loadingState: LoadingState
  /** Preload strategy */
  preload: PreloadStrategy
  /** Whether media can play */
  canPlay: boolean
  /** Whether media can play through without buffering */
  canPlayThrough: boolean
  /** Error if any */
  error: MediaError | null

  // === Playback ===
  /** Playback state */
  playbackState: PlaybackState
  /** Whether media is paused */
  paused: boolean
  /** Whether media is playing */
  playing: boolean
  /** Whether media has ended */
  ended: boolean
  /** Whether media is seeking */
  seeking: boolean
  /** Whether media is waiting/buffering */
  waiting: boolean
  /** Current time in seconds */
  currentTime: number
  /** Duration in seconds */
  duration: number
  /** Playback rate (1.0 = normal) */
  playbackRate: number
  /** Whether to loop playback */
  loop: boolean
  /** Whether to autoplay */
  autoplay: boolean
  /** Whether to play inline on mobile */
  playsinline: boolean

  // === Volume ===
  /** Whether muted */
  muted: boolean
  /** Volume (0-1) */
  volume: number

  // === Buffering ===
  /** Buffered time ranges */
  buffered: TimeRange[]
  /** Total buffered percentage (0-1) */
  bufferedAmount: number
  /** Seekable time ranges */
  seekable: TimeRange[]

  // === Dimensions ===
  /** Video width */
  videoWidth: number
  /** Video height */
  videoHeight: number
  /** Aspect ratio */
  aspectRatio: number

  // === Tracks ===
  /** Available qualities */
  qualities: VideoQuality[]
  /** Auto quality selection enabled */
  autoQuality: boolean
  /** Available audio tracks */
  audioTracks: AudioTrack[]
  /** Available text tracks */
  textTracks: TextTrack[]

  // === Fullscreen/PiP ===
  /** Whether in fullscreen */
  fullscreen: boolean
  /** Whether Picture-in-Picture is active */
  pictureInPicture: boolean
  /** Whether fullscreen is supported */
  canFullscreen: boolean
  /** Whether PiP is supported */
  canPictureInPicture: boolean

  // === UI ===
  /** Whether controls are visible */
  controlsVisible: boolean
  /** Whether user is interacting */
  userActive: boolean
  /** Whether pointer is over player */
  pointerOver: boolean

  // === Metadata ===
  /** Video title */
  title: string
  /** Poster image URL */
  poster: string
}

// =============================================================================
// Player Options
// =============================================================================

/**
 * Player initialization options
 */
export interface PlayerOptions {
  // === Source ===
  /** Media source(s) */
  src?: Src | Src[]
  /** Media type */
  mediaType?: MediaType
  /** Poster image URL */
  poster?: string
  /** Video title for accessibility */
  title?: string

  // === Playback ===
  /** Autoplay on load */
  autoplay?: boolean
  /** Loop playback */
  loop?: boolean
  /** Mute audio */
  muted?: boolean
  /** Initial volume (0-1) */
  volume?: number
  /** Playback rate */
  playbackRate?: number
  /** Play inline on mobile */
  playsinline?: boolean
  /** Preload strategy */
  preload?: PreloadStrategy
  /** Crossorigin attribute */
  crossorigin?: CrossOrigin

  // === Controls ===
  /** Show native controls */
  controls?: boolean
  /** Custom control configuration */
  controlsConfig?: ControlsConfig
  /** Keyboard shortcuts */
  keyboard?: boolean | KeyboardConfig
  /** Auto-hide controls timeout in ms */
  controlsTimeout?: number

  // === Accessibility ===
  /** Language for accessibility */
  language?: string
  /** Enable/disable captions by default */
  captions?: boolean
  /** Screen reader announcements */
  announcements?: boolean

  // === Fullscreen ===
  /** Fullscreen container element */
  fullscreenContainer?: HTMLElement
  /** Preferred fullscreen mode */
  fullscreenMode?: 'native' | 'fallback'

  // === Providers ===
  /** HLS.js configuration */
  hlsConfig?: Record<string, unknown>
  /** dash.js configuration */
  dashConfig?: Record<string, unknown>
  /** YouTube player parameters */
  youtubeParams?: Record<string, string | number | boolean>
  /** Vimeo player parameters */
  vimeoParams?: Record<string, string | number | boolean>

  // === Events ===
  /** Event listeners */
  on?: Partial<PlayerEventMap>

  // === Storage ===
  /** Persist volume/muted state */
  storage?: boolean | StorageConfig
}

/**
 * Controls configuration
 */
export interface ControlsConfig {
  /** Show play button */
  play?: boolean
  /** Show progress/seek bar */
  progress?: boolean
  /** Show current time */
  currentTime?: boolean
  /** Show duration */
  duration?: boolean
  /** Show volume slider */
  volume?: boolean
  /** Show mute button */
  mute?: boolean
  /** Show captions button */
  captions?: boolean
  /** Show settings menu */
  settings?: boolean
  /** Show fullscreen button */
  fullscreen?: boolean
  /** Show PiP button */
  pip?: boolean
  /** Show playback speed selector */
  speed?: boolean
  /** Show quality selector */
  quality?: boolean
  /** Custom controls to add */
  custom?: CustomControl[]
}

/**
 * Custom control definition
 */
export interface CustomControl {
  /** Control name/id */
  name: string
  /** Position in controls bar */
  position: 'left' | 'center' | 'right'
  /** Control HTML or render function */
  content: string | (() => HTMLElement)
  /** Click handler */
  onClick?: (player: Player) => void
}

/**
 * Keyboard configuration
 */
export interface KeyboardConfig {
  /** Enable global keyboard shortcuts */
  global?: boolean
  /** Seek step in seconds */
  seekStep?: number
  /** Volume step (0-1) */
  volumeStep?: number
  /** Custom key bindings */
  bindings?: Record<string, string | ((player: Player) => void)>
}

/**
 * Storage configuration
 */
export interface StorageConfig {
  /** Storage key prefix */
  prefix?: string
  /** Storage type */
  type?: 'local' | 'session'
  /** Properties to persist */
  persist?: ('volume' | 'muted' | 'playbackRate' | 'quality' | 'captions')[]
}

// =============================================================================
// Provider Types
// =============================================================================

/**
 * Provider interface for different media sources
 */
export interface Provider {
  /** Provider name */
  readonly name: string
  /** Provider type */
  readonly type: ProviderType
  /** Current media element */
  readonly mediaElement: HTMLVideoElement | HTMLAudioElement | HTMLIFrameElement | null
  /** Whether provider is ready */
  readonly ready: boolean

  // === Lifecycle ===
  /** Setup the provider */
  setup(container: HTMLElement, options: PlayerOptions): Promise<void>
  /** Destroy the provider */
  destroy(): void

  // === Loading ===
  /** Load a source */
  load(src: Src): Promise<void>
  /** Check if provider can play source */
  canPlay(src: Src): boolean

  // === Playback ===
  /** Play media */
  play(): Promise<void>
  /** Pause media */
  pause(): void
  /** Stop media (reset) */
  stop(): void

  // === Seeking ===
  /** Seek to time */
  seekTo(time: number): void
  /** Get current time */
  getCurrentTime(): number
  /** Get duration */
  getDuration(): number

  // === Volume ===
  /** Set volume */
  setVolume(volume: number): void
  /** Get volume */
  getVolume(): number
  /** Set muted */
  setMuted(muted: boolean): void
  /** Get muted */
  getMuted(): boolean

  // === Playback Rate ===
  /** Set playback rate */
  setPlaybackRate(rate: number): void
  /** Get playback rate */
  getPlaybackRate(): number

  // === Quality ===
  /** Get available qualities */
  getQualities(): VideoQuality[]
  /** Set quality */
  setQuality(quality: VideoQuality | 'auto'): void

  // === Tracks ===
  /** Get text tracks */
  getTextTracks(): TextTrack[]
  /** Set text track mode */
  setTextTrackMode(trackId: string, mode: 'disabled' | 'hidden' | 'showing'): void
  /** Get audio tracks */
  getAudioTracks(): AudioTrack[]
  /** Set audio track */
  setAudioTrack(trackId: string): void

  // === Fullscreen/PiP ===
  /** Enter fullscreen */
  enterFullscreen(): Promise<void>
  /** Exit fullscreen */
  exitFullscreen(): Promise<void>
  /** Enter Picture-in-Picture */
  enterPiP(): Promise<void>
  /** Exit Picture-in-Picture */
  exitPiP(): Promise<void>

  // === Events ===
  /** Add event listener */
  on<K extends keyof ProviderEventMap>(event: K, handler: ProviderEventMap[K]): void
  /** Remove event listener */
  off<K extends keyof ProviderEventMap>(event: K, handler: ProviderEventMap[K]): void
}

/**
 * Provider loader interface
 */
export interface ProviderLoader {
  /** Loader name */
  name: string
  /** Provider type this loader creates */
  type: ProviderType
  /** Check if loader can play source */
  canPlay(src: Src): boolean
  /** Detect media type from source */
  mediaType(src: Src): MediaType
  /** Preconnect hint URLs */
  preconnect?(): string[]
  /** Load/create the provider */
  load(container: HTMLElement, options: PlayerOptions): Promise<Provider>
}

// =============================================================================
// Event Types
// =============================================================================

/**
 * Media error
 */
export interface MediaError {
  code: number
  message: string
  details?: unknown
}

/**
 * Provider event map (internal events)
 */
export interface ProviderEventMap {
  ready: () => void
  loadstart: () => void
  loadedmetadata: () => void
  loadeddata: () => void
  canplay: () => void
  canplaythrough: () => void
  play: () => void
  pause: () => void
  playing: () => void
  waiting: () => void
  seeking: () => void
  seeked: () => void
  timeupdate: (time: number) => void
  durationchange: (duration: number) => void
  volumechange: (volume: number, muted: boolean) => void
  ratechange: (rate: number) => void
  progress: (buffered: TimeRange[]) => void
  ended: () => void
  error: (error: MediaError) => void
  statechange: (state: Partial<PlayerState>) => void
  qualitychange: (quality: VideoQuality | null) => void
  audiotrackchange: (track: AudioTrack | null) => void
  texttrackchange: (track: TextTrack | null) => void
  fullscreenchange: (fullscreen: boolean) => void
  pipchange: (pip: boolean) => void
}

/**
 * Player event map (public events)
 */
export interface PlayerEventMap extends ProviderEventMap {
  init: () => void
  destroy: () => void
  sourceschange: (sources: Src[]) => void
  providerchange: (provider: Provider | null) => void
  controlschange: (visible: boolean) => void
  useractivitychange: (active: boolean) => void
}

// =============================================================================
// UI Component Types
// =============================================================================

/**
 * UI component interface
 */
export interface UIComponent {
  /** Component name */
  name: string
  /** Render the component */
  render(player: Player): HTMLElement
  /** Update the component */
  update?(state: PlayerState): void
  /** Destroy the component */
  destroy?(): void
}

/**
 * Tooltip options
 */
export interface TooltipOptions {
  content: string | (() => string)
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

/**
 * Menu item
 */
export interface MenuItem {
  id: string
  label: string
  value?: unknown
  checked?: boolean
  disabled?: boolean
  icon?: string
  children?: MenuItem[]
}

/**
 * Slider options
 */
export interface SliderOptions {
  min: number
  max: number
  step: number
  value: number
  orientation?: 'horizontal' | 'vertical'
  disabled?: boolean
  onChange?: (value: number) => void
  onInput?: (value: number) => void
}

// =============================================================================
// Player Class Forward Declaration
// =============================================================================

/**
 * Player instance (forward declaration for circular refs)
 */
export interface Player {
  // Properties
  readonly el: HTMLElement
  readonly state: PlayerState
  readonly provider: Provider | null
  readonly ready: boolean

  // Lifecycle
  destroy(): void

  // Source
  setSrc(src: Src | Src[]): void
  getSrc(): Src | null

  // Playback
  play(): Promise<void>
  pause(): void
  togglePlay(): void
  stop(): void

  // Seeking
  seekTo(time: number): void
  seekBy(offset: number): void

  // Volume
  setVolume(volume: number): void
  setMuted(muted: boolean): void
  toggleMute(): void

  // Playback Rate
  setPlaybackRate(rate: number): void

  // Fullscreen/PiP
  enterFullscreen(): Promise<void>
  exitFullscreen(): Promise<void>
  toggleFullscreen(): Promise<void>
  enterPiP(): Promise<void>
  exitPiP(): Promise<void>
  togglePiP(): Promise<void>

  // Tracks
  setQuality(quality: VideoQuality | 'auto'): void
  setTextTrack(trackId: string, mode: 'disabled' | 'hidden' | 'showing'): void
  setAudioTrack(trackId: string): void

  // Events
  on<K extends keyof PlayerEventMap>(event: K, handler: PlayerEventMap[K]): void
  off<K extends keyof PlayerEventMap>(event: K, handler: PlayerEventMap[K]): void
  once<K extends keyof PlayerEventMap>(event: K, handler: PlayerEventMap[K]): void
}

// =============================================================================
// stx Integration Types
// =============================================================================

/**
 * Video component props for stx
 */
export interface VideoComponentProps {
  /** Media source(s) */
  src: Src | Src[]
  /** Poster image */
  poster?: string
  /** Video title */
  title?: string
  /** CSS class */
  class?: string
  /** CSS style */
  style?: string
  /** Element ID */
  id?: string
  /** Width */
  width?: number | string
  /** Height */
  height?: number | string
  /** Player options */
  options?: Partial<PlayerOptions>
  /** Lazy load */
  lazy?: boolean
  /** Autoplay */
  autoplay?: boolean
  /** Loop */
  loop?: boolean
  /** Muted */
  muted?: boolean
  /** Controls */
  controls?: boolean
  /** Playsinline */
  playsinline?: boolean
  /** Preload */
  preload?: PreloadStrategy
  /** Theme */
  theme?: 'default' | 'minimal' | 'modern' | string
}

/**
 * Video directive options for stx
 */
export interface VideoDirectiveOptions extends VideoComponentProps {
  /** Placeholder strategy */
  placeholder?: 'blur' | 'color' | 'none'
  /** Placeholder color */
  placeholderColor?: string
}

/**
 * Render result for stx
 */
export interface VideoRenderResult {
  /** HTML output */
  html: string
  /** CSS to inject */
  css?: string
  /** JavaScript to inject */
  script?: string
}

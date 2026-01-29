# Types

TypeScript type definitions reference.

## Source Types

```typescript
type MediaType = 'video' | 'audio'

type StreamType = 'on-demand' | 'live' | 'dvr'

type ProviderType = 'html5' | 'youtube' | 'vimeo' | 'hls' | 'dash'

interface MediaSource {
  src: string
  type?: string
  provider?: ProviderType
}

type Src = string | MediaSource | MediaSource[]
```

## State Types

```typescript
type PreloadStrategy = 'none' | 'metadata' | 'auto'

type CrossOrigin = 'anonymous' | 'use-credentials'

type LoadingState = 'idle' | 'loading' | 'loaded' | 'error'

type PlaybackState = 'idle' | 'playing' | 'paused' | 'ended'

interface TimeRange {
  start: number
  end: number
}

interface VideoQuality {
  id: string
  width?: number
  height: number
  bitrate?: number
  codec?: string
  selected?: boolean
}

interface AudioTrack {
  id: string
  label: string
  language: string
  enabled: boolean
}

interface TextTrack {
  id: string
  kind: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'
  label: string
  language: string
  src?: string
  default?: boolean
  mode?: 'disabled' | 'hidden' | 'showing'
}

interface PlayerState {
  // Playback
  playbackState: PlaybackState
  loadingState: LoadingState
  currentTime: number
  duration: number
  buffered: TimeRange[]
  seekable: TimeRange[]
  played: TimeRange[]

  // Volume
  volume: number
  muted: boolean

  // Settings
  playbackRate: number
  loop: boolean
  autoplay: boolean

  // Display
  isFullscreen: boolean
  isPiP: boolean
  poster: string
  title: string

  // Quality
  qualities: VideoQuality[]
  currentQuality: VideoQuality | null

  // Tracks
  textTracks: TextTrack[]
  textTrack: TextTrack | null
  audioTracks: AudioTrack[]
  audioTrack: AudioTrack | null

  // Live
  isLive: boolean
  liveLatency: number

  // Error
  error: MediaError | null

  // Media info
  videoWidth: number
  videoHeight: number
  preload: PreloadStrategy
  crossOrigin: CrossOrigin | null
}
```

## Options Types

```typescript
interface ControlsConfig {
  play?: boolean
  progress?: boolean
  currentTime?: boolean
  duration?: boolean
  mute?: boolean
  volume?: boolean
  captions?: boolean
  settings?: boolean
  pip?: boolean
  fullscreen?: boolean
  seekTime?: number
  position?: 'bottom' | 'top'
  autoHide?: boolean
  autoHideDelay?: number
}

interface KeyboardConfig {
  enabled?: boolean
  global?: boolean
  shortcuts?: Partial<KeyboardShortcuts>
}

interface StorageConfig {
  enabled?: boolean
  key?: string
  persist?: Array<'volume' | 'muted' | 'playbackRate' | 'captions'>
}

interface PlayerOptions {
  src?: Src
  poster?: string
  title?: string
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  volume?: number
  playbackRate?: number
  preload?: PreloadStrategy
  crossOrigin?: CrossOrigin
  playsinline?: boolean
  textTracks?: TextTrack[]
  controls?: boolean | ControlsConfig
  keyboard?: boolean | KeyboardConfig
  storage?: StorageConfig
  theme?: Theme | string
  i18n?: I18nConfig
  plugins?: Plugin[]
}
```

## Event Types

```typescript
interface MediaError {
  code: number
  message: string
}

interface PlayerEventMap {
  init: void
  ready: void
  destroy: void
  play: void
  playing: void
  pause: void
  ended: void
  seeking: void
  seeked: void
  waiting: void
  canplay: void
  canplaythrough: void
  timeupdate: void
  durationchange: void
  progress: void
  statechange: [PlayerState, keyof PlayerState]
  volumechange: void
  ratechange: void
  qualitychange: VideoQuality
  qualities: VideoQuality[]
  texttrackchange: TextTrack | null
  audiotrackchange: AudioTrack
  cuechange: TextTrackCue[]
  fullscreenchange: boolean
  enterpictureinpicture: void
  leavepictureinpicture: void
  error: MediaError
  loadstart: void
  loadedmetadata: void
  loadeddata: void
  sourcechange: Src
  providerchange: Provider
}
```

## Plugin Types

```typescript
interface Plugin {
  name: string
  install(player: Player, container: HTMLElement): () => void
}
```

## Theme Types

```typescript
interface ThemeColors {
  primary: string
  secondary: string
  background: string
  surface: string
  text: string
  textMuted: string
  error: string
  success: string
}

interface Theme {
  colors: ThemeColors
  typography: ThemeTypography
  spacing: ThemeSpacing
  borderRadius: ThemeBorderRadius
  transitions: ThemeTransitions
  slider: ThemeSlider
  controls: ThemeControls
}
```

## I18n Types

```typescript
interface TranslationStrings {
  play: string
  pause: string
  mute: string
  unmute: string
  enterFullscreen: string
  exitFullscreen: string
  settings: string
  speed: string
  quality: string
  captions: string
  captionsOff: string
  seekForward: string
  seekBackward: string
  // ... more
}

interface I18nConfig {
  language: string
  translations: TranslationStrings
}
```

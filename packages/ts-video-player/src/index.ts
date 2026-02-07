/**
 * ts-video-player
 *
 * A modern, framework-agnostic video player with deep stx integration.
 *
 * @module ts-video-player
 *
 * @example
 * ```typescript
 * import { createPlayer } from 'ts-video-player'
 *
 * const player = createPlayer('#video-container', {
 *   src: 'https://example.com/video.mp4',
 *   poster: '/poster.jpg',
 *   autoplay: false,
 *   controls: true,
 * })
 *
 * player.on('playing', () => console.log('Video is playing!'))
 * player.on('ended', () => console.log('Video ended'))
 *
 * // Control playback
 * await player.play()
 * player.pause()
 * player.seekTo(30)
 *
 * // Volume
 * player.setVolume(0.5)
 * player.toggleMute()
 *
 * // Fullscreen
 * await player.toggleFullscreen()
 * ```
 */

// =============================================================================
// Core
// =============================================================================

export { Player, createPlayer, getPlayer } from './player'

// =============================================================================
// State Management
// =============================================================================

export {
  StateStore,
  createSignal,
  computed,
  createDefaultState,
  loadPersistedState,
  savePersistedState,
  createStorageSync,
  // Selectors
  selectBufferedAmount,
  selectProgress,
  selectRemainingTime,
  selectIsIdle,
  selectIsLoading,
  selectIsLive,
  selectIsDVR,
  selectCurrentQuality,
  selectCurrentTextTrack,
  selectCurrentAudioTrack,
} from './core/state'

// =============================================================================
// Events
// =============================================================================

export {
  EventEmitter,
  MediaEventsNormalizer,
  onFullscreenChange,
  onPiPChange,
  DEFAULT_KEYBOARD_SHORTCUTS,
  createKeyboardHandler,
  createActivityDetector,
  createGestureDetector,
} from './core/events'

// =============================================================================
// Audio Gain
// =============================================================================

export {
  AudioGain,
  createAudioGain,
  GAIN_PRESETS,
  GAIN_STEPS,
} from './core/audio-gain'

export type { AudioGainAdapter } from './core/audio-gain'

// =============================================================================
// Text Tracks
// =============================================================================

export {
  TextTrackList,
  TextTrackReadyState,
  CaptionRenderer,
  createTextTrackList,
  createCaptionRenderer,
} from './core/text-tracks'

export type { TextTrackInit, VTTCueInit, CaptionRendererOptions } from './core/text-tracks'

// =============================================================================
// Themes
// =============================================================================

export {
  defaultTheme,
  darkTheme,
  lightTheme,
  minimalTheme,
  netflixTheme,
  youtubeTheme,
  vimeoTheme,
  presetThemes,
  mergeThemes,
  generateThemeCSS,
  createThemeStyleElement,
  applyTheme,
  injectThemeStyles,
} from './core/themes'

export type {
  Theme,
  ThemeColors,
  ThemeTypography,
  ThemeSpacing,
  ThemeBorderRadius,
  ThemeShadows,
  ThemeTransitions,
  ThemeSlider,
  ThemeControls,
  ThemeMenu,
  ThemeCaptions,
  ThemeThumbnails,
  ThemeLive,
  PresetThemeName,
} from './core/themes'

// =============================================================================
// Thumbnails / Seek Preview
// =============================================================================

export {
  Thumbnails,
  createThumbnails,
  parseThumbnailVTT,
  generateSpriteCues,
} from './core/thumbnails'

export type {
  ThumbnailSprite,
  ThumbnailCue,
  ThumbnailsConfig,
} from './core/thumbnails'

// =============================================================================
// Internationalization (i18n)
// =============================================================================

export {
  I18n,
  createI18n,
  getI18n,
  setI18n,
  t,
  englishStrings,
  spanishStrings,
  frenchStrings,
  germanStrings,
  japaneseStrings,
  chineseStrings,
  defaultTranslations,
} from './core/i18n'

export type {
  TranslationStrings,
  TranslationKey,
  I18nConfig,
} from './core/i18n'

// =============================================================================
// Live Streaming
// =============================================================================

export {
  LiveIndicator,
  SeekToLiveButton,
  LiveController,
  createLiveIndicator,
  createSeekToLiveButton,
  createLiveController,
} from './core/live'

export type {
  LiveConfig,
  LiveState,
} from './core/live'

// =============================================================================
// Remote Playback (AirPlay / Google Cast)
// =============================================================================

export {
  RemotePlaybackController,
  AirPlayButton,
  GoogleCastButton,
  createRemotePlaybackController,
  createAirPlayButton,
  createGoogleCastButton,
  isAirPlaySupported,
  isAirPlayAvailable,
  showAirPlayPicker,
  isAirPlaying,
  isGoogleCastSupported,
  loadGoogleCastSDK,
  initializeGoogleCast,
  requestCastSession,
  endCastSession,
  isCasting,
  getCastSession,
  castMedia,
} from './core/remote-playback'

export type {
  RemotePlaybackType,
  RemotePlaybackState,
  RemoteDevice,
  RemotePlaybackConfig,
} from './core/remote-playback'

// =============================================================================
// Chapters
// =============================================================================

export {
  ChaptersManager,
  ChapterMenu,
  createChaptersManager,
  createChapterMenu,
  parseChaptersVTT,
} from './core/chapters'

export type {
  Chapter,
  ChaptersConfig,
} from './core/chapters'

// =============================================================================
// Spinner / Buffering Indicator
// =============================================================================

export {
  Spinner,
  createSpinner,
  SPINNER_STYLES,
} from './core/spinner'

export type { SpinnerConfig } from './core/spinner'

// =============================================================================
// Caption Styling
// =============================================================================

export {
  CaptionStyleManager,
  CaptionSettingsMenu,
  createCaptionStyleManager,
  createCaptionSettingsMenu,
  defaultCaptionStyles,
  captionPresets,
} from './core/caption-styles'

export type {
  CaptionStyleOptions,
  CaptionStylePreset,
} from './core/caption-styles'

// =============================================================================
// Tooltips
// =============================================================================

export {
  Tooltip,
  TooltipManager,
  createTooltip,
  createTooltipManager,
  TOOLTIP_STYLES,
} from './core/tooltips'

export type {
  TooltipPlacement,
  TooltipConfig,
} from './core/tooltips'

// =============================================================================
// Error Overlay
// =============================================================================

export {
  ErrorOverlay,
  createErrorOverlay,
  ERROR_OVERLAY_STYLES,
} from './core/error-overlay'

export type { ErrorOverlayConfig } from './core/error-overlay'

// =============================================================================
// Settings Menu
// =============================================================================

export {
  SettingsMenu,
  createSettingsMenu,
} from './core/settings-menu'

export type {
  SettingsMenuConfig,
  SettingsMenuState,
} from './core/settings-menu'

// =============================================================================
// Providers
// =============================================================================

export {
  // Base
  BaseProvider,
  // HTML5
  HTML5Provider,
  html5Loader,
  isHTML5Source,
  // YouTube
  YouTubeProvider,
  youtubeLoader,
  isYouTubeSource,
  extractYouTubeId,
  // Vimeo
  VimeoProvider,
  vimeoLoader,
  isVimeoSource,
  extractVimeoId,
  extractVimeoHash,
  // HLS
  HLSProvider,
  hlsLoader,
  isHLSSource,
  isNativeHLSSupported,
  // DASH
  DASHProvider,
  dashLoader,
  isDASHSource,
  // Registry
  defaultLoaders,
  findLoader,
  detectMediaType,
  getPreconnectHints,
} from './providers'

export type { DRMConfig, DASHProviderConfig } from './providers'

// =============================================================================
// Layouts
// =============================================================================

export {
  LayoutManager,
  createLayoutManager,
  getLayout,
  registerLayout,
  layouts,
  defaultLayout,
  minimalLayout,
  cinemaLayout,
  youtubeLayout,
  vimeoLayout,
  audioLayout,
} from './layouts'

export type { LayoutConfig, LayoutName } from './layouts'

// =============================================================================
// UI Components
// =============================================================================

export {
  // Components
  BaseComponent,
  PlayButton,
  MuteButton,
  FullscreenButton,
  PiPButton,
  TimeDisplay,
  Slider,
  ProgressBar,
  VolumeSlider,
  Menu,
  // Utilities
  formatTime,
  UI_STYLES,
} from './ui/components'

// =============================================================================
// Types
// =============================================================================

export type {
  // Media source types
  MediaType,
  StreamType,
  ProviderType,
  MediaSource,
  YouTubeSource,
  VimeoSource,
  HLSSource,
  DASHSource,
  Src,

  // Player state
  PreloadStrategy,
  CrossOrigin,
  LoadingState,
  PlaybackState,
  TimeRange,
  VideoQuality,
  AudioTrack,
  TextTrack,
  TextTrackCue,
  PlayerState,

  // Player options
  PlayerOptions,
  ControlsConfig,
  CustomControl,
  KeyboardConfig,
  StorageConfig,

  // Provider
  Provider,
  ProviderLoader,

  // Events
  MediaError,
  ProviderEventMap,
  PlayerEventMap,

  // UI
  UIComponent,
  TooltipOptions,
  MenuItem,
  SliderOptions,

  // stx integration
  VideoComponentProps,
  VideoDirectiveOptions,
  VideoRenderResult,
} from './types'

// =============================================================================
// stx Integration
// =============================================================================

export {
  renderVideoComponent,
  parseVideoComponent,
  createVideoDirective,
  videoDirective,
  registerVideoDirectives,
} from './stx'

// =============================================================================
// Plugins
// =============================================================================

export {
  // Analytics
  VideoAnalytics,
  createVideoAnalytics,
  analyticsPlugin,
  // Ads (VAST/VPAID)
  VASTParser,
  AdsManager,
  createAdsManager,
  adsPlugin,
  // Skip Segments
  SkipSegmentsManager,
  createSkipSegments,
  skipSegmentsPlugin,
  // End Screen
  EndScreenManager,
  createEndScreen,
  endScreenPlugin,
  // Watermarks
  WatermarkManager,
  createWatermarkManager,
  watermarkPlugin,
} from './plugins'

export type {
  // Analytics types
  VideoEventName,
  VideoAnalyticsConfig,
  // Ads types
  Ad,
  AdMediaFile,
  AdBreak,
  AdConfig,
  AdState,
  // Skip Segments types
  SegmentType,
  SkipSegment,
  SkipSegmentsConfig,
  SkipSegmentsState,
  // End Screen types
  EndScreenRecommendation,
  EndScreenConfig,
  EndScreenState,
  // Watermark types
  WatermarkPosition,
  WatermarkConfig,
  WatermarkAnimation,
  DynamicWatermark,
} from './plugins'

// =============================================================================
// Default Export
// =============================================================================

import { createPlayer } from './player'
export default createPlayer

// =============================================================================
// Feature Availability Detection
// =============================================================================

export {
  isIOSSafari,
  isSafari,
  isStandalonePWA,
  detectVolumeAvailability,
  probeVolumeAvailability,
  detectFullscreenAvailability,
  isVideoOnlyFullscreen,
  detectPipAvailability,
  detectAllFeatures,
  enterFullscreen,
  exitFullscreen,
  enterPiP,
  exitPiP,
} from './core/features'

// =============================================================================
// Custom Elements
// =============================================================================

export {
  VideoPlayerElement,
  MediaPlayButton,
  MediaMuteButton,
  MediaFullscreenButton,
  MediaPipButton,
  MediaTimeDisplay,
  MediaProgressBar,
  MediaVolumeSlider,
  MediaSettingsMenu,
  registerElements,
  formatTime as formatElementTime,
  formatTimePhrase,
  toISODuration,
} from './elements'

// =============================================================================
// Composable Features
// =============================================================================

export {
  playback,
  volume as volumeFeature,
  fullscreen as fullscreenFeature,
  pip as pipFeature,
  captions as captionsFeature,
  quality as qualityFeature,
  keyboard as keyboardFeature,
  gestures as gesturesFeature,
  videoFeatures,
  audioFeatures,
  minimalFeatures,
  createComposablePlayer,
} from './features'

export type { Feature, FeatureContext, ComposablePlayer, ComposablePlayerOptions } from './features'

// =============================================================================
// Media Session
// =============================================================================

export {
  isMediaSessionSupported,
  createMediaSession,
  updateMetadata,
} from './core/media-session'

export type { MediaSessionOptions } from './core/media-session'

// =============================================================================
// Orientation Lock
// =============================================================================

export {
  isOrientationLockSupported,
  lockOrientation,
  unlockOrientation,
} from './core/orientation'

// =============================================================================
// Popover Positioning
// =============================================================================

export {
  computePosition,
  applyPosition,
} from './core/popover'

export type { Rect, Placement, PositionOptions, PositionResult } from './core/popover'

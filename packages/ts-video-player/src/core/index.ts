/**
 * ts-video-player Core
 *
 * Core utilities and systems.
 *
 * @module core
 */

// State
export {
  StateStore,
  createSignal,
  computed,
  createDefaultState,
  loadPersistedState,
  savePersistedState,
  createStorageSync,
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
} from './state'

// Events
export {
  EventEmitter,
  MediaEventsNormalizer,
  onFullscreenChange,
  onPiPChange,
  DEFAULT_KEYBOARD_SHORTCUTS,
  createKeyboardHandler,
  createActivityDetector,
  createGestureDetector,
} from './events'

export type { KeyboardActions, GestureHandlers } from './events'

// Audio Gain
export {
  AudioGain,
  createAudioGain,
  GAIN_PRESETS,
  GAIN_STEPS,
} from './audio-gain'

export type { AudioGainAdapter } from './audio-gain'

// Text Tracks
export {
  TextTrackList,
  TextTrackReadyState,
  CaptionRenderer,
  createTextTrackList,
  createCaptionRenderer,
} from './text-tracks'

export type { TextTrackInit, VTTCueInit, CaptionRendererOptions } from './text-tracks'

// Themes
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
} from './themes'

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
} from './themes'

// Thumbnails
export {
  Thumbnails,
  createThumbnails,
  parseThumbnailVTT,
  generateSpriteCues,
} from './thumbnails'

export type {
  ThumbnailSprite,
  ThumbnailCue,
  ThumbnailsConfig,
} from './thumbnails'

// i18n
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
} from './i18n'

export type {
  TranslationStrings,
  TranslationKey,
  I18nConfig,
} from './i18n'

// Live Streaming
export {
  LiveIndicator,
  SeekToLiveButton,
  LiveController,
  createLiveIndicator,
  createSeekToLiveButton,
  createLiveController,
} from './live'

export type {
  LiveConfig,
  LiveState,
} from './live'

// Remote Playback (AirPlay / Google Cast)
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
} from './remote-playback'

export type {
  RemotePlaybackType,
  RemotePlaybackState,
  RemoteDevice,
  RemotePlaybackConfig,
} from './remote-playback'

// Chapters
export {
  ChaptersManager,
  ChapterMenu,
  createChaptersManager,
  createChapterMenu,
  parseChaptersVTT,
} from './chapters'

export type {
  Chapter,
  ChaptersConfig,
} from './chapters'

// Spinner / Buffering Indicator
export {
  Spinner,
  createSpinner,
  SPINNER_STYLES,
} from './spinner'

export type { SpinnerConfig } from './spinner'

// Caption Styling
export {
  CaptionStyleManager,
  CaptionSettingsMenu,
  createCaptionStyleManager,
  createCaptionSettingsMenu,
  defaultCaptionStyles,
  captionPresets,
} from './caption-styles'

export type {
  CaptionStyleOptions,
  CaptionStylePreset,
} from './caption-styles'

// Tooltips
export {
  Tooltip,
  TooltipManager,
  createTooltip,
  createTooltipManager,
  TOOLTIP_STYLES,
} from './tooltips'

export type {
  TooltipPlacement,
  TooltipConfig,
} from './tooltips'

// Error Overlay
export {
  ErrorOverlay,
  createErrorOverlay,
  ERROR_OVERLAY_STYLES,
} from './error-overlay'

export type { ErrorOverlayConfig } from './error-overlay'

// Settings Menu
export {
  SettingsMenu,
  createSettingsMenu,
} from './settings-menu'

export type {
  SettingsMenuConfig,
  SettingsMenuState,
} from './settings-menu'

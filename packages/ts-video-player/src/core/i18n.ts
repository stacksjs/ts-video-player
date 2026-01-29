/**
 * Internationalization (i18n) System
 *
 * Provides translation support for all player UI strings.
 *
 * @module core/i18n
 */

// =============================================================================
// Types
// =============================================================================

export interface TranslationStrings {
  // Playback
  play: string
  pause: string
  replay: string
  // Volume
  mute: string
  unmute: string
  volume: string
  // Progress
  seekBackward: string
  seekForward: string
  seekTo: string
  duration: string
  currentTime: string
  played: string
  buffered: string
  // Fullscreen
  enterFullscreen: string
  exitFullscreen: string
  // PiP
  enterPiP: string
  exitPiP: string
  // Captions
  enableCaptions: string
  disableCaptions: string
  captions: string
  captionsOff: string
  // Settings
  settings: string
  quality: string
  auto: string
  speed: string
  normal: string
  loop: string
  loopEnabled: string
  loopDisabled: string
  // Audio
  audioBoost: string
  audioTrack: string
  // Live
  live: string
  liveEdge: string
  seekToLive: string
  behindLive: string
  // Errors
  networkError: string
  mediaError: string
  unknownError: string
  // Loading
  loading: string
  buffering: string
  // Chapters
  chapters: string
  // AirPlay / Cast
  airPlay: string
  googleCast: string
  casting: string
  // Misc
  download: string
  share: string
  close: string
  menu: string
  back: string
}

export type TranslationKey = keyof TranslationStrings

export interface I18nConfig {
  /** Current language code */
  language?: string
  /** Fallback language code */
  fallbackLanguage?: string
  /** Custom translations */
  translations?: Partial<Record<string, Partial<TranslationStrings>>>
  /** Interpolation pattern (default: {key}) */
  interpolationPattern?: RegExp
}

// =============================================================================
// Default Translations
// =============================================================================

export const englishStrings: TranslationStrings = {
  // Playback
  play: 'Play',
  pause: 'Pause',
  replay: 'Replay',
  // Volume
  mute: 'Mute',
  unmute: 'Unmute',
  volume: 'Volume',
  // Progress
  seekBackward: 'Seek backward {seconds} seconds',
  seekForward: 'Seek forward {seconds} seconds',
  seekTo: 'Seek to {time}',
  duration: 'Duration',
  currentTime: 'Current time',
  played: 'Played',
  buffered: 'Buffered',
  // Fullscreen
  enterFullscreen: 'Enter fullscreen',
  exitFullscreen: 'Exit fullscreen',
  // PiP
  enterPiP: 'Enter picture-in-picture',
  exitPiP: 'Exit picture-in-picture',
  // Captions
  enableCaptions: 'Enable captions',
  disableCaptions: 'Disable captions',
  captions: 'Captions',
  captionsOff: 'Off',
  // Settings
  settings: 'Settings',
  quality: 'Quality',
  auto: 'Auto',
  speed: 'Speed',
  normal: 'Normal',
  loop: 'Loop',
  loopEnabled: 'Loop enabled',
  loopDisabled: 'Loop disabled',
  // Audio
  audioBoost: 'Audio boost',
  audioTrack: 'Audio track',
  // Live
  live: 'LIVE',
  liveEdge: 'At live edge',
  seekToLive: 'Seek to live edge',
  behindLive: '{seconds}s behind',
  // Errors
  networkError: 'A network error occurred',
  mediaError: 'The media could not be loaded',
  unknownError: 'An unknown error occurred',
  // Loading
  loading: 'Loading',
  buffering: 'Buffering',
  // Chapters
  chapters: 'Chapters',
  // AirPlay / Cast
  airPlay: 'AirPlay',
  googleCast: 'Cast',
  casting: 'Casting to {device}',
  // Misc
  download: 'Download',
  share: 'Share',
  close: 'Close',
  menu: 'Menu',
  back: 'Back',
}

export const spanishStrings: TranslationStrings = {
  play: 'Reproducir',
  pause: 'Pausar',
  replay: 'Repetir',
  mute: 'Silenciar',
  unmute: 'Activar sonido',
  volume: 'Volumen',
  seekBackward: 'Retroceder {seconds} segundos',
  seekForward: 'Avanzar {seconds} segundos',
  seekTo: 'Ir a {time}',
  duration: 'Duración',
  currentTime: 'Tiempo actual',
  played: 'Reproducido',
  buffered: 'Almacenado',
  enterFullscreen: 'Pantalla completa',
  exitFullscreen: 'Salir de pantalla completa',
  enterPiP: 'Imagen en imagen',
  exitPiP: 'Salir de imagen en imagen',
  enableCaptions: 'Activar subtítulos',
  disableCaptions: 'Desactivar subtítulos',
  captions: 'Subtítulos',
  captionsOff: 'Desactivados',
  settings: 'Ajustes',
  quality: 'Calidad',
  auto: 'Automático',
  speed: 'Velocidad',
  normal: 'Normal',
  loop: 'Bucle',
  loopEnabled: 'Bucle activado',
  loopDisabled: 'Bucle desactivado',
  audioBoost: 'Aumento de audio',
  audioTrack: 'Pista de audio',
  live: 'EN VIVO',
  liveEdge: 'En vivo',
  seekToLive: 'Ir al directo',
  behindLive: '{seconds}s de retraso',
  networkError: 'Error de red',
  mediaError: 'No se pudo cargar el medio',
  unknownError: 'Error desconocido',
  loading: 'Cargando',
  buffering: 'Almacenando',
  chapters: 'Capítulos',
  airPlay: 'AirPlay',
  googleCast: 'Enviar',
  casting: 'Enviando a {device}',
  download: 'Descargar',
  share: 'Compartir',
  close: 'Cerrar',
  menu: 'Menú',
  back: 'Volver',
}

export const frenchStrings: TranslationStrings = {
  play: 'Lecture',
  pause: 'Pause',
  replay: 'Relire',
  mute: 'Muet',
  unmute: 'Son activé',
  volume: 'Volume',
  seekBackward: 'Reculer de {seconds} secondes',
  seekForward: 'Avancer de {seconds} secondes',
  seekTo: 'Aller à {time}',
  duration: 'Durée',
  currentTime: 'Temps actuel',
  played: 'Joué',
  buffered: 'Mis en mémoire tampon',
  enterFullscreen: 'Plein écran',
  exitFullscreen: 'Quitter le plein écran',
  enterPiP: 'Image dans l\'image',
  exitPiP: 'Quitter l\'image dans l\'image',
  enableCaptions: 'Activer les sous-titres',
  disableCaptions: 'Désactiver les sous-titres',
  captions: 'Sous-titres',
  captionsOff: 'Désactivés',
  settings: 'Paramètres',
  quality: 'Qualité',
  auto: 'Auto',
  speed: 'Vitesse',
  normal: 'Normal',
  loop: 'Boucle',
  loopEnabled: 'Boucle activée',
  loopDisabled: 'Boucle désactivée',
  audioBoost: 'Amplification audio',
  audioTrack: 'Piste audio',
  live: 'EN DIRECT',
  liveEdge: 'En direct',
  seekToLive: 'Aller au direct',
  behindLive: '{seconds}s de retard',
  networkError: 'Erreur réseau',
  mediaError: 'Le média n\'a pas pu être chargé',
  unknownError: 'Erreur inconnue',
  loading: 'Chargement',
  buffering: 'Mise en mémoire tampon',
  chapters: 'Chapitres',
  airPlay: 'AirPlay',
  googleCast: 'Caster',
  casting: 'Diffusion sur {device}',
  download: 'Télécharger',
  share: 'Partager',
  close: 'Fermer',
  menu: 'Menu',
  back: 'Retour',
}

export const germanStrings: TranslationStrings = {
  play: 'Abspielen',
  pause: 'Pause',
  replay: 'Wiederholen',
  mute: 'Stumm',
  unmute: 'Ton an',
  volume: 'Lautstärke',
  seekBackward: '{seconds} Sekunden zurück',
  seekForward: '{seconds} Sekunden vor',
  seekTo: 'Zu {time} springen',
  duration: 'Dauer',
  currentTime: 'Aktuelle Zeit',
  played: 'Abgespielt',
  buffered: 'Gepuffert',
  enterFullscreen: 'Vollbild',
  exitFullscreen: 'Vollbild beenden',
  enterPiP: 'Bild-in-Bild',
  exitPiP: 'Bild-in-Bild beenden',
  enableCaptions: 'Untertitel aktivieren',
  disableCaptions: 'Untertitel deaktivieren',
  captions: 'Untertitel',
  captionsOff: 'Aus',
  settings: 'Einstellungen',
  quality: 'Qualität',
  auto: 'Auto',
  speed: 'Geschwindigkeit',
  normal: 'Normal',
  loop: 'Schleife',
  loopEnabled: 'Schleife aktiviert',
  loopDisabled: 'Schleife deaktiviert',
  audioBoost: 'Audio-Verstärkung',
  audioTrack: 'Audiospur',
  live: 'LIVE',
  liveEdge: 'Am Live-Punkt',
  seekToLive: 'Zum Live-Punkt',
  behindLive: '{seconds}s hinter Live',
  networkError: 'Netzwerkfehler',
  mediaError: 'Medium konnte nicht geladen werden',
  unknownError: 'Unbekannter Fehler',
  loading: 'Wird geladen',
  buffering: 'Puffern',
  chapters: 'Kapitel',
  airPlay: 'AirPlay',
  googleCast: 'Streamen',
  casting: 'Streame zu {device}',
  download: 'Herunterladen',
  share: 'Teilen',
  close: 'Schließen',
  menu: 'Menü',
  back: 'Zurück',
}

export const japaneseStrings: TranslationStrings = {
  play: '再生',
  pause: '一時停止',
  replay: 'リプレイ',
  mute: 'ミュート',
  unmute: 'ミュート解除',
  volume: '音量',
  seekBackward: '{seconds}秒戻る',
  seekForward: '{seconds}秒進む',
  seekTo: '{time}にシーク',
  duration: '長さ',
  currentTime: '現在の時間',
  played: '再生済み',
  buffered: 'バッファ済み',
  enterFullscreen: 'フルスクリーン',
  exitFullscreen: 'フルスクリーン終了',
  enterPiP: 'ピクチャーインピクチャー',
  exitPiP: 'ピクチャーインピクチャー終了',
  enableCaptions: '字幕を有効化',
  disableCaptions: '字幕を無効化',
  captions: '字幕',
  captionsOff: 'オフ',
  settings: '設定',
  quality: '画質',
  auto: '自動',
  speed: '再生速度',
  normal: '通常',
  loop: 'ループ',
  loopEnabled: 'ループ有効',
  loopDisabled: 'ループ無効',
  audioBoost: 'オーディオブースト',
  audioTrack: 'オーディオトラック',
  live: 'ライブ',
  liveEdge: 'ライブ中',
  seekToLive: 'ライブに移動',
  behindLive: '{seconds}秒遅れ',
  networkError: 'ネットワークエラー',
  mediaError: 'メディアを読み込めません',
  unknownError: '不明なエラー',
  loading: '読み込み中',
  buffering: 'バッファリング',
  chapters: 'チャプター',
  airPlay: 'AirPlay',
  googleCast: 'キャスト',
  casting: '{device}にキャスト中',
  download: 'ダウンロード',
  share: '共有',
  close: '閉じる',
  menu: 'メニュー',
  back: '戻る',
}

export const chineseStrings: TranslationStrings = {
  play: '播放',
  pause: '暂停',
  replay: '重播',
  mute: '静音',
  unmute: '取消静音',
  volume: '音量',
  seekBackward: '后退{seconds}秒',
  seekForward: '前进{seconds}秒',
  seekTo: '跳转到{time}',
  duration: '时长',
  currentTime: '当前时间',
  played: '已播放',
  buffered: '已缓冲',
  enterFullscreen: '全屏',
  exitFullscreen: '退出全屏',
  enterPiP: '画中画',
  exitPiP: '退出画中画',
  enableCaptions: '开启字幕',
  disableCaptions: '关闭字幕',
  captions: '字幕',
  captionsOff: '关闭',
  settings: '设置',
  quality: '画质',
  auto: '自动',
  speed: '播放速度',
  normal: '正常',
  loop: '循环',
  loopEnabled: '循环已开启',
  loopDisabled: '循环已关闭',
  audioBoost: '音频增强',
  audioTrack: '音轨',
  live: '直播',
  liveEdge: '直播中',
  seekToLive: '跳转到直播',
  behindLive: '落后{seconds}秒',
  networkError: '网络错误',
  mediaError: '无法加载媒体',
  unknownError: '未知错误',
  loading: '加载中',
  buffering: '缓冲中',
  chapters: '章节',
  airPlay: 'AirPlay',
  googleCast: '投射',
  casting: '正在投射到{device}',
  download: '下载',
  share: '分享',
  close: '关闭',
  menu: '菜单',
  back: '返回',
}

export const defaultTranslations: Record<string, TranslationStrings> = {
  en: englishStrings,
  es: spanishStrings,
  fr: frenchStrings,
  de: germanStrings,
  ja: japaneseStrings,
  zh: chineseStrings,
}

// =============================================================================
// I18n Class
// =============================================================================

export class I18n {
  private language: string
  private fallbackLanguage: string
  private translations: Record<string, Partial<TranslationStrings>>
  private interpolationPattern: RegExp

  constructor(config: I18nConfig = {}) {
    this.language = config.language || this.detectLanguage() || 'en'
    this.fallbackLanguage = config.fallbackLanguage || 'en'
    this.translations = { ...defaultTranslations }

    // Merge custom translations
    if (config.translations) {
      for (const [lang, strings] of Object.entries(config.translations)) {
        if (strings) {
          this.translations[lang] = { ...this.translations[lang], ...strings }
        }
      }
    }

    this.interpolationPattern = config.interpolationPattern || /\{(\w+)\}/g
  }

  /**
   * Detect browser language
   */
  private detectLanguage(): string | null {
    if (typeof navigator === 'undefined') return null

    const lang = navigator.language || (navigator as any).userLanguage
    if (!lang) return null

    // Try exact match first
    if (this.translations[lang]) {
      return lang
    }

    // Try base language (e.g., 'en' from 'en-US')
    const baseLang = lang.split('-')[0]
    if (this.translations[baseLang]) {
      return baseLang
    }

    return null
  }

  /**
   * Get current language
   */
  getLanguage(): string {
    return this.language
  }

  /**
   * Set current language
   */
  setLanguage(language: string): void {
    this.language = language
  }

  /**
   * Get translation for a key
   */
  t(key: TranslationKey, params?: Record<string, string | number>): string {
    // Try current language
    let str = this.translations[this.language]?.[key]

    // Fall back to fallback language
    if (!str) {
      str = this.translations[this.fallbackLanguage]?.[key]
    }

    // Return key if no translation found
    if (!str) {
      return key
    }

    // Interpolate params
    if (params) {
      str = str.replace(this.interpolationPattern, (match, paramKey) => {
        const value = params[paramKey]
        return value !== undefined ? String(value) : match
      })
    }

    return str
  }

  /**
   * Add or update translations for a language
   */
  addTranslations(language: string, strings: Partial<TranslationStrings>): void {
    this.translations[language] = {
      ...this.translations[language],
      ...strings,
    }
  }

  /**
   * Get all translations for a language
   */
  getTranslations(language: string): Partial<TranslationStrings> | undefined {
    return this.translations[language]
  }

  /**
   * Get all available languages
   */
  getAvailableLanguages(): string[] {
    return Object.keys(this.translations)
  }

  /**
   * Check if a language is available
   */
  hasLanguage(language: string): boolean {
    return language in this.translations
  }
}

// =============================================================================
// Factory
// =============================================================================

let globalI18n: I18n | null = null

/**
 * Create an I18n instance
 */
export function createI18n(config?: I18nConfig): I18n {
  return new I18n(config)
}

/**
 * Get or create global I18n instance
 */
export function getI18n(config?: I18nConfig): I18n {
  if (!globalI18n) {
    globalI18n = createI18n(config)
  }
  return globalI18n
}

/**
 * Set global I18n instance
 */
export function setI18n(i18n: I18n): void {
  globalI18n = i18n
}

/**
 * Quick translation helper using global instance
 */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  return getI18n().t(key, params)
}

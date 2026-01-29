/**
 * CSS Variables / Theming System
 *
 * Provides a comprehensive theming system using CSS custom properties.
 *
 * @module core/themes
 */

// =============================================================================
// Theme Types
// =============================================================================

export interface ThemeColors {
  /** Primary brand color (default: #00a8ff) */
  primary?: string
  /** Secondary accent color */
  secondary?: string
  /** Background color */
  background?: string
  /** Text color */
  text?: string
  /** Text color on primary background */
  textOnPrimary?: string
  /** Border color */
  border?: string
  /** Focus ring color */
  focus?: string
  /** Error/danger color */
  error?: string
  /** Success color */
  success?: string
  /** Warning color */
  warning?: string
}

export interface ThemeTypography {
  /** Font family for UI elements */
  fontFamily?: string
  /** Base font size */
  fontSize?: string
  /** Small font size */
  fontSizeSmall?: string
  /** Large font size */
  fontSizeLarge?: string
  /** Font weight */
  fontWeight?: string
  /** Bold font weight */
  fontWeightBold?: string
  /** Line height */
  lineHeight?: string
}

export interface ThemeSpacing {
  /** Extra small spacing (4px) */
  xs?: string
  /** Small spacing (8px) */
  sm?: string
  /** Medium spacing (12px) */
  md?: string
  /** Large spacing (16px) */
  lg?: string
  /** Extra large spacing (24px) */
  xl?: string
}

export interface ThemeBorderRadius {
  /** Small border radius */
  sm?: string
  /** Medium border radius */
  md?: string
  /** Large border radius */
  lg?: string
  /** Full/round border radius */
  full?: string
}

export interface ThemeShadows {
  /** Small shadow */
  sm?: string
  /** Medium shadow */
  md?: string
  /** Large shadow */
  lg?: string
}

export interface ThemeTransitions {
  /** Fast transition duration */
  fast?: string
  /** Normal transition duration */
  normal?: string
  /** Slow transition duration */
  slow?: string
  /** Default easing function */
  easing?: string
}

export interface ThemeSlider {
  /** Slider track height */
  trackHeight?: string
  /** Slider thumb size */
  thumbSize?: string
  /** Slider track background */
  trackBg?: string
  /** Slider track fill background */
  trackFillBg?: string
  /** Slider buffered background */
  bufferedBg?: string
  /** Slider thumb background */
  thumbBg?: string
  /** Slider thumb border */
  thumbBorder?: string
}

export interface ThemeControls {
  /** Controls bar height */
  height?: string
  /** Controls background */
  background?: string
  /** Controls padding */
  padding?: string
  /** Button size */
  buttonSize?: string
  /** Icon size */
  iconSize?: string
  /** Tooltip background */
  tooltipBg?: string
  /** Tooltip text color */
  tooltipText?: string
}

export interface ThemeMenu {
  /** Menu background */
  background?: string
  /** Menu border radius */
  borderRadius?: string
  /** Menu shadow */
  shadow?: string
  /** Menu item height */
  itemHeight?: string
  /** Menu item hover background */
  itemHoverBg?: string
  /** Menu item active background */
  itemActiveBg?: string
}

export interface ThemeCaptions {
  /** Caption font family */
  fontFamily?: string
  /** Caption font size */
  fontSize?: string
  /** Caption text color */
  textColor?: string
  /** Caption background */
  background?: string
  /** Caption text shadow */
  textShadow?: string
  /** Caption border radius */
  borderRadius?: string
  /** Caption padding */
  padding?: string
}

export interface ThemeThumbnails {
  /** Thumbnail width */
  width?: string
  /** Thumbnail height */
  height?: string
  /** Thumbnail border radius */
  borderRadius?: string
  /** Thumbnail border */
  border?: string
  /** Thumbnail shadow */
  shadow?: string
}

export interface ThemeLive {
  /** Live indicator color */
  indicatorColor?: string
  /** Live indicator size */
  indicatorSize?: string
  /** Live badge background */
  badgeBg?: string
  /** Live badge text color */
  badgeText?: string
}

export interface Theme {
  colors?: ThemeColors
  typography?: ThemeTypography
  spacing?: ThemeSpacing
  borderRadius?: ThemeBorderRadius
  shadows?: ThemeShadows
  transitions?: ThemeTransitions
  slider?: ThemeSlider
  controls?: ThemeControls
  menu?: ThemeMenu
  captions?: ThemeCaptions
  thumbnails?: ThemeThumbnails
  live?: ThemeLive
}

// =============================================================================
// Default Theme
// =============================================================================

export const defaultTheme: Required<Theme> = {
  colors: {
    primary: '#00a8ff',
    secondary: '#6c5ce7',
    background: 'rgba(0, 0, 0, 0.85)',
    text: '#ffffff',
    textOnPrimary: '#ffffff',
    border: 'rgba(255, 255, 255, 0.1)',
    focus: '#00a8ff',
    error: '#ff4757',
    success: '#2ed573',
    warning: '#ffa502',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: '14px',
    fontSizeSmall: '12px',
    fontSizeLarge: '16px',
    fontWeight: '400',
    fontWeightBold: '600',
    lineHeight: '1.5',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.2)',
    md: '0 4px 6px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.4)',
  },
  transitions: {
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  slider: {
    trackHeight: '4px',
    thumbSize: '14px',
    trackBg: 'rgba(255, 255, 255, 0.2)',
    trackFillBg: 'var(--tsvp-color-primary)',
    bufferedBg: 'rgba(255, 255, 255, 0.4)',
    thumbBg: '#ffffff',
    thumbBorder: 'none',
  },
  controls: {
    height: '48px',
    background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
    padding: '0 12px',
    buttonSize: '40px',
    iconSize: '24px',
    tooltipBg: 'rgba(0, 0, 0, 0.9)',
    tooltipText: '#ffffff',
  },
  menu: {
    background: 'rgba(20, 20, 20, 0.95)',
    borderRadius: '8px',
    shadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
    itemHeight: '40px',
    itemHoverBg: 'rgba(255, 255, 255, 0.1)',
    itemActiveBg: 'rgba(0, 168, 255, 0.2)',
  },
  captions: {
    fontFamily: 'inherit',
    fontSize: '1.5em',
    textColor: '#ffffff',
    background: 'rgba(0, 0, 0, 0.75)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
    borderRadius: '4px',
    padding: '4px 8px',
  },
  thumbnails: {
    width: '160px',
    height: '90px',
    borderRadius: '4px',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    shadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
  },
  live: {
    indicatorColor: '#ff0000',
    indicatorSize: '8px',
    badgeBg: '#ff0000',
    badgeText: '#ffffff',
  },
}

// =============================================================================
// Preset Themes
// =============================================================================

export const darkTheme: Theme = {
  colors: {
    primary: '#00a8ff',
    background: 'rgba(0, 0, 0, 0.9)',
    text: '#ffffff',
  },
}

export const lightTheme: Theme = {
  colors: {
    primary: '#0070f3',
    background: 'rgba(255, 255, 255, 0.95)',
    text: '#1a1a1a',
    textOnPrimary: '#ffffff',
    border: 'rgba(0, 0, 0, 0.1)',
  },
  controls: {
    background: 'linear-gradient(transparent, rgba(255, 255, 255, 0.9))',
    tooltipBg: 'rgba(0, 0, 0, 0.8)',
  },
  menu: {
    background: 'rgba(255, 255, 255, 0.98)',
    shadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    itemHoverBg: 'rgba(0, 0, 0, 0.05)',
    itemActiveBg: 'rgba(0, 112, 243, 0.1)',
  },
  captions: {
    background: 'rgba(255, 255, 255, 0.9)',
    textColor: '#1a1a1a',
  },
}

export const minimalTheme: Theme = {
  colors: {
    primary: '#ffffff',
    background: 'transparent',
  },
  controls: {
    height: '40px',
    background: 'transparent',
  },
  slider: {
    trackHeight: '2px',
    thumbSize: '10px',
  },
}

export const netflixTheme: Theme = {
  colors: {
    primary: '#e50914',
    background: 'rgba(0, 0, 0, 0.85)',
  },
  slider: {
    trackFillBg: '#e50914',
  },
  live: {
    indicatorColor: '#e50914',
    badgeBg: '#e50914',
  },
}

export const youtubeTheme: Theme = {
  colors: {
    primary: '#ff0000',
    background: 'rgba(0, 0, 0, 0.85)',
  },
  slider: {
    trackHeight: '3px',
    thumbSize: '13px',
    trackFillBg: '#ff0000',
  },
  controls: {
    height: '48px',
  },
  live: {
    indicatorColor: '#ff0000',
    badgeBg: '#ff0000',
  },
}

export const vimeoTheme: Theme = {
  colors: {
    primary: '#00adef',
    background: 'rgba(0, 0, 0, 0.85)',
  },
  slider: {
    trackFillBg: '#00adef',
  },
}

export const presetThemes = {
  dark: darkTheme,
  light: lightTheme,
  minimal: minimalTheme,
  netflix: netflixTheme,
  youtube: youtubeTheme,
  vimeo: vimeoTheme,
} as const

export type PresetThemeName = keyof typeof presetThemes

// =============================================================================
// Theme Utilities
// =============================================================================

/**
 * Deep merge two theme objects
 */
export function mergeThemes(base: Theme, override: Theme): Theme {
  const result: Theme = { ...base }

  for (const key of Object.keys(override) as (keyof Theme)[]) {
    const baseValue = base[key]
    const overrideValue = override[key]

    if (overrideValue && typeof overrideValue === 'object') {
      result[key] = {
        ...(baseValue || {}),
        ...overrideValue,
      } as any
    }
    else if (overrideValue !== undefined) {
      result[key] = overrideValue as any
    }
  }

  return result
}

/**
 * Generate CSS custom properties from a theme
 */
export function generateThemeCSS(theme: Theme, prefix = 'tsvp'): string {
  const merged = mergeThemes(defaultTheme, theme)
  const vars: string[] = []

  // Colors
  if (merged.colors) {
    vars.push(`--${prefix}-color-primary: ${merged.colors.primary};`)
    vars.push(`--${prefix}-color-secondary: ${merged.colors.secondary};`)
    vars.push(`--${prefix}-color-background: ${merged.colors.background};`)
    vars.push(`--${prefix}-color-text: ${merged.colors.text};`)
    vars.push(`--${prefix}-color-text-on-primary: ${merged.colors.textOnPrimary};`)
    vars.push(`--${prefix}-color-border: ${merged.colors.border};`)
    vars.push(`--${prefix}-color-focus: ${merged.colors.focus};`)
    vars.push(`--${prefix}-color-error: ${merged.colors.error};`)
    vars.push(`--${prefix}-color-success: ${merged.colors.success};`)
    vars.push(`--${prefix}-color-warning: ${merged.colors.warning};`)
  }

  // Typography
  if (merged.typography) {
    vars.push(`--${prefix}-font-family: ${merged.typography.fontFamily};`)
    vars.push(`--${prefix}-font-size: ${merged.typography.fontSize};`)
    vars.push(`--${prefix}-font-size-sm: ${merged.typography.fontSizeSmall};`)
    vars.push(`--${prefix}-font-size-lg: ${merged.typography.fontSizeLarge};`)
    vars.push(`--${prefix}-font-weight: ${merged.typography.fontWeight};`)
    vars.push(`--${prefix}-font-weight-bold: ${merged.typography.fontWeightBold};`)
    vars.push(`--${prefix}-line-height: ${merged.typography.lineHeight};`)
  }

  // Spacing
  if (merged.spacing) {
    vars.push(`--${prefix}-spacing-xs: ${merged.spacing.xs};`)
    vars.push(`--${prefix}-spacing-sm: ${merged.spacing.sm};`)
    vars.push(`--${prefix}-spacing-md: ${merged.spacing.md};`)
    vars.push(`--${prefix}-spacing-lg: ${merged.spacing.lg};`)
    vars.push(`--${prefix}-spacing-xl: ${merged.spacing.xl};`)
  }

  // Border Radius
  if (merged.borderRadius) {
    vars.push(`--${prefix}-radius-sm: ${merged.borderRadius.sm};`)
    vars.push(`--${prefix}-radius-md: ${merged.borderRadius.md};`)
    vars.push(`--${prefix}-radius-lg: ${merged.borderRadius.lg};`)
    vars.push(`--${prefix}-radius-full: ${merged.borderRadius.full};`)
  }

  // Shadows
  if (merged.shadows) {
    vars.push(`--${prefix}-shadow-sm: ${merged.shadows.sm};`)
    vars.push(`--${prefix}-shadow-md: ${merged.shadows.md};`)
    vars.push(`--${prefix}-shadow-lg: ${merged.shadows.lg};`)
  }

  // Transitions
  if (merged.transitions) {
    vars.push(`--${prefix}-transition-fast: ${merged.transitions.fast};`)
    vars.push(`--${prefix}-transition-normal: ${merged.transitions.normal};`)
    vars.push(`--${prefix}-transition-slow: ${merged.transitions.slow};`)
    vars.push(`--${prefix}-transition-easing: ${merged.transitions.easing};`)
  }

  // Slider
  if (merged.slider) {
    vars.push(`--${prefix}-slider-track-height: ${merged.slider.trackHeight};`)
    vars.push(`--${prefix}-slider-thumb-size: ${merged.slider.thumbSize};`)
    vars.push(`--${prefix}-slider-track-bg: ${merged.slider.trackBg};`)
    vars.push(`--${prefix}-slider-track-fill-bg: ${merged.slider.trackFillBg};`)
    vars.push(`--${prefix}-slider-buffered-bg: ${merged.slider.bufferedBg};`)
    vars.push(`--${prefix}-slider-thumb-bg: ${merged.slider.thumbBg};`)
    vars.push(`--${prefix}-slider-thumb-border: ${merged.slider.thumbBorder};`)
  }

  // Controls
  if (merged.controls) {
    vars.push(`--${prefix}-controls-height: ${merged.controls.height};`)
    vars.push(`--${prefix}-controls-bg: ${merged.controls.background};`)
    vars.push(`--${prefix}-controls-padding: ${merged.controls.padding};`)
    vars.push(`--${prefix}-controls-button-size: ${merged.controls.buttonSize};`)
    vars.push(`--${prefix}-controls-icon-size: ${merged.controls.iconSize};`)
    vars.push(`--${prefix}-controls-tooltip-bg: ${merged.controls.tooltipBg};`)
    vars.push(`--${prefix}-controls-tooltip-text: ${merged.controls.tooltipText};`)
  }

  // Menu
  if (merged.menu) {
    vars.push(`--${prefix}-menu-bg: ${merged.menu.background};`)
    vars.push(`--${prefix}-menu-radius: ${merged.menu.borderRadius};`)
    vars.push(`--${prefix}-menu-shadow: ${merged.menu.shadow};`)
    vars.push(`--${prefix}-menu-item-height: ${merged.menu.itemHeight};`)
    vars.push(`--${prefix}-menu-item-hover-bg: ${merged.menu.itemHoverBg};`)
    vars.push(`--${prefix}-menu-item-active-bg: ${merged.menu.itemActiveBg};`)
  }

  // Captions
  if (merged.captions) {
    vars.push(`--${prefix}-captions-font-family: ${merged.captions.fontFamily};`)
    vars.push(`--${prefix}-captions-font-size: ${merged.captions.fontSize};`)
    vars.push(`--${prefix}-captions-text-color: ${merged.captions.textColor};`)
    vars.push(`--${prefix}-captions-bg: ${merged.captions.background};`)
    vars.push(`--${prefix}-captions-text-shadow: ${merged.captions.textShadow};`)
    vars.push(`--${prefix}-captions-radius: ${merged.captions.borderRadius};`)
    vars.push(`--${prefix}-captions-padding: ${merged.captions.padding};`)
  }

  // Thumbnails
  if (merged.thumbnails) {
    vars.push(`--${prefix}-thumbnail-width: ${merged.thumbnails.width};`)
    vars.push(`--${prefix}-thumbnail-height: ${merged.thumbnails.height};`)
    vars.push(`--${prefix}-thumbnail-radius: ${merged.thumbnails.borderRadius};`)
    vars.push(`--${prefix}-thumbnail-border: ${merged.thumbnails.border};`)
    vars.push(`--${prefix}-thumbnail-shadow: ${merged.thumbnails.shadow};`)
  }

  // Live
  if (merged.live) {
    vars.push(`--${prefix}-live-indicator-color: ${merged.live.indicatorColor};`)
    vars.push(`--${prefix}-live-indicator-size: ${merged.live.indicatorSize};`)
    vars.push(`--${prefix}-live-badge-bg: ${merged.live.badgeBg};`)
    vars.push(`--${prefix}-live-badge-text: ${merged.live.badgeText};`)
  }

  return vars.join('\n  ')
}

/**
 * Create a style element with theme CSS
 */
export function createThemeStyleElement(theme: Theme, selector = '.tsvp-player'): HTMLStyleElement {
  const style = document.createElement('style')
  style.setAttribute('data-tsvp-theme', 'true')
  style.textContent = `
${selector} {
  ${generateThemeCSS(theme)}
}
`
  return style
}

/**
 * Apply theme to a player element
 */
export function applyTheme(element: HTMLElement, theme: Theme | PresetThemeName): void {
  const themeObj = typeof theme === 'string' ? presetThemes[theme] : theme

  // Remove existing inline theme
  element.querySelectorAll('style[data-tsvp-theme]').forEach(el => el.remove())

  // Apply new theme
  const css = generateThemeCSS(themeObj)
  element.style.cssText += css.split('\n').map(line => line.trim().replace(';', '')).join('; ')
}

/**
 * Inject global theme styles
 */
export function injectThemeStyles(theme: Theme | PresetThemeName = {}, selector = '.tsvp-player'): void {
  const themeObj = typeof theme === 'string' ? presetThemes[theme] : theme

  // Remove existing global theme
  document.querySelectorAll('style[data-tsvp-theme-global]').forEach(el => el.remove())

  const style = document.createElement('style')
  style.setAttribute('data-tsvp-theme-global', 'true')
  style.textContent = `
${selector} {
  ${generateThemeCSS(themeObj)}
}
`
  document.head.appendChild(style)
}

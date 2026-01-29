# Theming

Customize the player appearance with built-in themes or create your own.

## Built-in Themes

ts-video-player includes several preset themes:

```typescript
import {
  createPlayer,
  defaultTheme,
  darkTheme,
  lightTheme,
  minimalTheme,
  netflixTheme,
  youtubeTheme,
  vimeoTheme,
} from 'ts-video-player'

// Use a preset theme
const player = createPlayer('#container', {
  src: '/video.mp4',
  theme: netflixTheme,
})
```

## Applying Themes

You can apply themes at creation or dynamically:

```typescript
import { createPlayer, applyTheme, youtubeTheme } from 'ts-video-player'

const player = createPlayer('#container', { src: '/video.mp4' })

// Apply theme dynamically
applyTheme(player.el, youtubeTheme)
```

## Custom Themes

Create a custom theme by defining theme properties:

```typescript
import { createPlayer, type Theme } from 'ts-video-player'

const customTheme: Theme = {
  colors: {
    primary: '#e50914',        // Primary accent color
    secondary: '#b81d24',      // Secondary color
    background: '#141414',     // Background color
    surface: '#1f1f1f',        // Surface/card color
    text: '#ffffff',           // Text color
    textMuted: '#808080',      // Muted text color
    error: '#ff4444',          // Error color
    success: '#44ff44',        // Success color
  },

  typography: {
    fontFamily: 'Netflix Sans, Helvetica, Arial, sans-serif',
    fontSize: {
      small: '12px',
      medium: '14px',
      large: '16px',
    },
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },

  borderRadius: {
    small: '2px',
    medium: '4px',
    large: '8px',
  },

  transitions: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease',
  },

  slider: {
    height: '4px',
    thumbSize: '12px',
    hoverHeight: '6px',
  },

  controls: {
    height: '48px',
    iconSize: '24px',
    padding: '12px',
  },
}

const player = createPlayer('#container', {
  src: '/video.mp4',
  theme: customTheme,
})
```

## Merging Themes

Extend an existing theme with custom overrides:

```typescript
import { mergeThemes, netflixTheme, type Theme } from 'ts-video-player'

const customTheme: Partial<Theme> = {
  colors: {
    primary: '#00ff00', // Override just the primary color
  },
}

const mergedTheme = mergeThemes(netflixTheme, customTheme)
```

## CSS Custom Properties

Themes generate CSS custom properties you can override:

```css
.ts-video-player {
  --tsvp-color-primary: #e50914;
  --tsvp-color-secondary: #b81d24;
  --tsvp-color-background: #141414;
  --tsvp-color-surface: #1f1f1f;
  --tsvp-color-text: #ffffff;
  --tsvp-color-text-muted: #808080;

  --tsvp-font-family: sans-serif;
  --tsvp-font-size-small: 12px;
  --tsvp-font-size-medium: 14px;
  --tsvp-font-size-large: 16px;

  --tsvp-spacing-xs: 4px;
  --tsvp-spacing-sm: 8px;
  --tsvp-spacing-md: 12px;
  --tsvp-spacing-lg: 16px;
  --tsvp-spacing-xl: 24px;

  --tsvp-border-radius-small: 2px;
  --tsvp-border-radius-medium: 4px;
  --tsvp-border-radius-large: 8px;

  --tsvp-transition-fast: 150ms ease;
  --tsvp-transition-normal: 300ms ease;
  --tsvp-transition-slow: 500ms ease;

  --tsvp-slider-height: 4px;
  --tsvp-slider-thumb-size: 12px;
  --tsvp-slider-hover-height: 6px;

  --tsvp-controls-height: 48px;
  --tsvp-controls-icon-size: 24px;
  --tsvp-controls-padding: 12px;
}
```

## Theme Presets

### Netflix Theme

Dark theme with red accents, similar to Netflix player.

### YouTube Theme

White controls with red progress bar, similar to YouTube player.

### Vimeo Theme

Clean blue theme, similar to Vimeo player.

### Minimal Theme

Minimal controls with subtle styling.

### Dark Theme

General-purpose dark theme.

### Light Theme

General-purpose light theme for light backgrounds.

## Dynamic Theme Switching

```typescript
import { applyTheme, darkTheme, lightTheme } from 'ts-video-player'

const player = createPlayer('#container', { src: '/video.mp4' })

// Toggle based on system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

function updateTheme() {
  applyTheme(player.el, prefersDark.matches ? darkTheme : lightTheme)
}

prefersDark.addEventListener('change', updateTheme)
updateTheme()
```

## Next Steps

- [Internationalization](/guide/i18n) - Multi-language support
- [Accessibility](/guide/accessibility) - Accessibility features

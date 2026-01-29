# Configuration

Complete reference for all player configuration options.

## Basic Options

```typescript
import { createPlayer, type PlayerOptions } from 'ts-video-player'

const options: PlayerOptions = {
  // Media source
  src: '/video.mp4',

  // Poster image
  poster: '/poster.jpg',

  // Title for accessibility
  title: 'My Video',

  // Autoplay (may be blocked by browser)
  autoplay: false,

  // Show controls
  controls: true,

  // Loop playback
  loop: false,

  // Start muted
  muted: false,

  // Initial volume (0-1)
  volume: 1,

  // Initial playback rate
  playbackRate: 1,

  // Preload strategy
  preload: 'metadata', // 'none' | 'metadata' | 'auto'

  // Cross-origin setting
  crossOrigin: 'anonymous', // 'anonymous' | 'use-credentials'
}

const player = createPlayer('#container', options)
```

## Text Tracks

```typescript
const options: PlayerOptions = {
  src: '/video.mp4',
  textTracks: [
    {
      kind: 'subtitles',
      label: 'English',
      srclang: 'en',
      src: '/captions-en.vtt',
      default: true,
    },
    {
      kind: 'subtitles',
      label: 'Spanish',
      srclang: 'es',
      src: '/captions-es.vtt',
    },
    {
      kind: 'chapters',
      label: 'Chapters',
      srclang: 'en',
      src: '/chapters.vtt',
    },
  ],
}
```

## Controls Configuration

```typescript
const options: PlayerOptions = {
  src: '/video.mp4',
  controls: {
    // Which controls to show
    play: true,
    progress: true,
    currentTime: true,
    duration: true,
    mute: true,
    volume: true,
    captions: true,
    settings: true,
    pip: true,
    fullscreen: true,

    // Seek amount for keyboard/buttons
    seekTime: 10,

    // Control bar position
    position: 'bottom', // 'bottom' | 'top'

    // Auto-hide controls
    autoHide: true,
    autoHideDelay: 3000,
  },
}
```

## Keyboard Configuration

```typescript
const options: PlayerOptions = {
  src: '/video.mp4',
  keyboard: {
    enabled: true,
    global: false, // Listen globally or only when focused
    shortcuts: {
      play: ['Space', 'k'],
      mute: ['m'],
      fullscreen: ['f'],
      pip: ['p'],
      captions: ['c'],
      seekBackward: ['ArrowLeft', 'j'],
      seekForward: ['ArrowRight', 'l'],
      volumeUp: ['ArrowUp'],
      volumeDown: ['ArrowDown'],
      speedUp: ['>'],
      speedDown: ['<'],
    },
  },
}
```

## Storage Configuration

Persist user preferences across sessions:

```typescript
const options: PlayerOptions = {
  src: '/video.mp4',
  storage: {
    enabled: true,
    key: 'ts-video-player',
    persist: ['volume', 'muted', 'playbackRate', 'captions'],
  },
}
```

## Theme Configuration

```typescript
import { createPlayer, netflixTheme } from 'ts-video-player'

const options: PlayerOptions = {
  src: '/video.mp4',
  theme: netflixTheme,
  // Or use a preset name
  // theme: 'netflix',
}
```

## Internationalization

```typescript
import { createPlayer, spanishStrings } from 'ts-video-player'

const options: PlayerOptions = {
  src: '/video.mp4',
  i18n: {
    language: 'es',
    translations: spanishStrings,
  },
}
```

## Provider-Specific Options

### YouTube

```typescript
const options: PlayerOptions = {
  src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  youtube: {
    showRelated: false,
    showInfo: false,
    modestBranding: true,
    enableJsApi: true,
  },
}
```

### Vimeo

```typescript
const options: PlayerOptions = {
  src: 'https://vimeo.com/123456789',
  vimeo: {
    color: 'ff0000',
    byline: false,
    portrait: false,
    title: false,
  },
}
```

### HLS

```typescript
const options: PlayerOptions = {
  src: 'https://example.com/stream.m3u8',
  hls: {
    maxBufferLength: 30,
    maxMaxBufferLength: 600,
    enableWorker: true,
    lowLatencyMode: false,
  },
}
```

### DASH

```typescript
const options: PlayerOptions = {
  src: 'https://example.com/manifest.mpd',
  dash: {
    streaming: {
      abr: {
        autoSwitchBitrate: { video: true },
      },
    },
  },
}
```

## All Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `src` | `string \| Src` | - | Media source URL or object |
| `poster` | `string` | - | Poster image URL |
| `title` | `string` | - | Video title for accessibility |
| `autoplay` | `boolean` | `false` | Auto-start playback |
| `controls` | `boolean \| ControlsConfig` | `true` | Show/configure controls |
| `loop` | `boolean` | `false` | Loop playback |
| `muted` | `boolean` | `false` | Start muted |
| `volume` | `number` | `1` | Initial volume (0-1) |
| `playbackRate` | `number` | `1` | Initial playback rate |
| `preload` | `PreloadStrategy` | `'metadata'` | Preload strategy |
| `crossOrigin` | `CrossOrigin` | - | Cross-origin setting |
| `textTracks` | `TextTrack[]` | `[]` | Subtitles/captions |
| `keyboard` | `boolean \| KeyboardConfig` | `true` | Keyboard controls |
| `storage` | `StorageConfig` | - | Persist preferences |
| `theme` | `Theme \| string` | `defaultTheme` | Player theme |
| `i18n` | `I18nConfig` | - | Internationalization |

## Next Steps

- [Theming](/guide/themes) - Customize appearance
- [Providers](/providers/) - Configure video sources
- [Plugins](/plugins/) - Add functionality

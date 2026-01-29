<p align="center"><img src=".github/art/cover.jpg" alt="Social Card of this repo"></p>

[![npm version][npm-version-src]][npm-version-href]
[![GitHub Actions][github-actions-src]][github-actions-href]
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
<!-- [![npm downloads][npm-downloads-src]][npm-downloads-href] -->
<!-- [![Codecov][codecov-src]][codecov-href] -->

# ts-video-player

A modern, framework-agnostic video player with deep stx integration. Built for performance, accessibility, and extensibility.

## Features

- **Multiple Providers** - HTML5 video, YouTube, Vimeo, HLS, and DASH support
- **Adaptive Streaming** - Automatic quality switching with HLS.js and dash.js integration
- **Rich UI Components** - Play/pause, volume, progress, fullscreen, PiP, and more
- **Accessibility** - Full keyboard navigation and screen reader support
- **Theming** - Built-in themes (Netflix, YouTube, Vimeo, minimal) and custom theme support
- **Internationalization** - Multi-language support with 6 built-in languages
- **Captions & Subtitles** - VTT support with customizable styling
- **Thumbnails** - Seek preview with sprite sheet support
- **Chapters** - VTT-based chapters with markers
- **Remote Playback** - AirPlay and Google Cast support
- **Live Streaming** - DVR controls and live indicator
- **stx Integration** - Native `@video` directive for stx templates

### Plugins

- **Analytics** - Deep integration with ts-analytics for comprehensive video tracking
- **Ads (VAST/VPAID)** - Pre-roll, mid-roll, and post-roll ad support
- **Skip Segments** - Skip intro, outro, recap, credits, and sponsors
- **End Screens** - Recommendations with autoplay countdown
- **Watermarks** - Static and dynamic/forensic watermarking

## Installation

```bash
bun add ts-video-player
# or
npm install ts-video-player
# or
pnpm add ts-video-player
```

## Quick Start

```typescript
import { createPlayer } from 'ts-video-player'

const player = createPlayer('#video-container', {
  src: 'https://example.com/video.mp4',
  poster: '/poster.jpg',
  autoplay: false,
  controls: true,
})

// Listen to events
player.on('playing', () => console.log('Video is playing!'))
player.on('ended', () => console.log('Video ended'))

// Control playback
await player.play()
player.pause()
player.seekTo(30)

// Volume
player.setVolume(0.5)
player.toggleMute()

// Fullscreen
await player.toggleFullscreen()
```

## Providers

### HTML5 Video

```typescript
createPlayer('#container', {
  src: '/video.mp4',
  type: 'video/mp4',
})
```

### YouTube

```typescript
createPlayer('#container', {
  src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
})
```

### Vimeo

```typescript
createPlayer('#container', {
  src: 'https://vimeo.com/123456789',
})
```

### HLS Streaming

```typescript
createPlayer('#container', {
  src: 'https://example.com/stream.m3u8',
})
```

### DASH Streaming

```typescript
createPlayer('#container', {
  src: 'https://example.com/manifest.mpd',
})
```

## Theming

```typescript
import { createPlayer, applyTheme, netflixTheme } from 'ts-video-player'

const player = createPlayer('#container', { src: '/video.mp4' })

// Apply a preset theme
applyTheme(player.el, netflixTheme)

// Or use a custom theme
applyTheme(player.el, {
  colors: {
    primary: '#e50914',
    background: '#141414',
  },
})
```

Available preset themes: `defaultTheme`, `darkTheme`, `lightTheme`, `minimalTheme`, `netflixTheme`, `youtubeTheme`, `vimeoTheme`

## Captions & Subtitles

```typescript
const player = createPlayer('#container', {
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
  ],
})
```

## Plugins

### Analytics Plugin

```typescript
import { createPlayer, analyticsPlugin } from 'ts-video-player'

const player = createPlayer('#container', {
  src: '/video.mp4',
  plugins: [
    analyticsPlugin({
      siteId: 'your-site-id',
      apiEndpoint: '/api/analytics/collect',
      videoId: 'video-123',
      videoTitle: 'My Video',
      milestones: [25, 50, 75, 90],
      heartbeatInterval: 30,
    }),
  ],
})
```

### Ads Plugin (VAST/VPAID)

```typescript
import { createPlayer, adsPlugin } from 'ts-video-player'

const player = createPlayer('#container', {
  src: '/video.mp4',
  plugins: [
    adsPlugin({
      adBreaks: [
        {
          type: 'preroll',
          vastUrl: 'https://ads.example.com/vast.xml',
        },
        {
          type: 'midroll',
          time: 300, // 5 minutes
          vastUrl: 'https://ads.example.com/midroll.xml',
        },
      ],
      skipDelay: 5,
    }),
  ],
})
```

### Skip Segments Plugin

```typescript
import { createPlayer, skipSegmentsPlugin } from 'ts-video-player'

const player = createPlayer('#container', {
  src: '/video.mp4',
  plugins: [
    skipSegmentsPlugin({
      segments: [
        { type: 'intro', startTime: 0, endTime: 30 },
        { type: 'outro', startTime: 1200, endTime: 1260 },
      ],
      showMarkers: true,
    }),
  ],
})
```

### End Screen Plugin

```typescript
import { createPlayer, endScreenPlugin } from 'ts-video-player'

const player = createPlayer('#container', {
  src: '/video.mp4',
  plugins: [
    endScreenPlugin({
      recommendations: [
        {
          id: 'video-2',
          title: 'Next Episode',
          thumbnail: '/thumb-2.jpg',
          duration: 2400,
          url: '/watch/video-2',
        },
      ],
      autoplayDelay: 10,
      showReplayButton: true,
    }),
  ],
})
```

### Watermark Plugin

```typescript
import { createPlayer, watermarkPlugin } from 'ts-video-player'

const player = createPlayer('#container', {
  src: '/video.mp4',
  plugins: [
    watermarkPlugin([
      {
        id: 'logo',
        image: '/logo.png',
        position: 'top-right',
        opacity: 0.7,
      },
    ]),
  ],
})
```

## stx Integration

Use the `@video` directive in your stx templates:

```html
@video('/video.mp4', {
  poster: '/poster.jpg',
  controls: true,
  theme: 'netflix',
  captions: [
    { label: 'English', src: '/en.vtt', default: true }
  ]
})
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` / `K` | Toggle play/pause |
| `M` | Toggle mute |
| `F` | Toggle fullscreen |
| `P` | Toggle picture-in-picture |
| `C` | Toggle captions |
| `←` / `→` | Seek backward/forward 5s |
| `↑` / `↓` | Volume up/down |
| `0-9` | Seek to 0-90% |
| `Home` | Seek to start |
| `End` | Seek to end |

## API Reference

### Player Methods

```typescript
// Playback
player.play(): Promise<void>
player.pause(): void
player.togglePlay(): Promise<void>
player.seekTo(time: number): void
player.seekBy(delta: number): void

// Volume
player.setVolume(level: number): void  // 0-1
player.toggleMute(): void

// Playback Rate
player.setPlaybackRate(rate: number): void

// Fullscreen
player.toggleFullscreen(): Promise<void>
player.requestFullscreen(): Promise<void>
player.exitFullscreen(): Promise<void>

// Picture-in-Picture
player.togglePiP(): Promise<void>

// Quality
player.setQuality(qualityId: string): void

// Captions
player.toggleCaptions(): void
player.setTextTrack(trackId: string): void

// State
player.state: PlayerState  // Current state
player.ready: boolean      // Provider ready
player.el: HTMLElement     // Container element

// Cleanup
player.destroy(): void
```

### Events

```typescript
player.on('init', () => {})
player.on('ready', () => {})
player.on('play', () => {})
player.on('pause', () => {})
player.on('playing', () => {})
player.on('waiting', () => {})
player.on('seeking', () => {})
player.on('seeked', () => {})
player.on('timeupdate', () => {})
player.on('durationchange', () => {})
player.on('progress', () => {})
player.on('ratechange', () => {})
player.on('volumechange', () => {})
player.on('ended', () => {})
player.on('error', (error) => {})
player.on('fullscreenchange', (isFullscreen) => {})
player.on('enterpictureinpicture', () => {})
player.on('leavepictureinpicture', () => {})
player.on('qualitychange', (quality) => {})
player.on('texttrackchange', (track) => {})
```

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Testing

```bash
bun test
```

## Changelog

Please see our [releases](https://github.com/stacksjs/ts-video-player/releases) page for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Community

For help, discussion about best practices, or any other conversation that would benefit from being searchable:

[Discussions on GitHub](https://github.com/stacksjs/ts-video-player/discussions)

For casual chit-chat with others using this package:

[Join the Stacks Discord Server](https://discord.gg/stacksjs)

## Postcardware

“Software that is free, but hopes for a postcard.” We love receiving postcards from around the world showing where Stacks is being used! We showcase them on our website too.

Our address: Stacks.js, 12665 Village Ln #2306, Playa Vista, CA 90094, United States 🌎

## Sponsors

We would like to extend our thanks to the following sponsors for funding Stacks development. If you are interested in becoming a sponsor, please reach out to us.

- [JetBrains](https://www.jetbrains.com/)
- [The Solana Foundation](https://solana.com/)

## License

The MIT License (MIT). Please see [LICENSE](LICENSE.md) for more information.

Made with 💙

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/ts-video-player?style=flat-square
[npm-version-href]: https://npmjs.com/package/ts-video-player
[github-actions-src]: https://img.shields.io/github/actions/workflow/status/stacksjs/ts-video-player/ci.yml?style=flat-square&branch=main
[github-actions-href]: https://github.com/stacksjs/ts-video-player/actions?query=workflow%3Aci

<!-- [codecov-src]: https://img.shields.io/codecov/c/gh/stacksjs/ts-video-player/main?style=flat-square
[codecov-href]: https://codecov.io/gh/stacksjs/ts-video-player -->

# Vimeo Provider

Embed Vimeo videos with full player controls.

## Basic Usage

```typescript
import { createPlayer } from 'ts-video-player'

// Using full URL
const player = createPlayer('#container', {
  src: 'https://vimeo.com/123456789',
})

// Using video ID
const player = createPlayer('#container', {
  src: {
    src: '123456789',
    provider: 'vimeo',
  },
})
```

## Private Videos

For private videos with hash:

```typescript
const player = createPlayer('#container', {
  src: 'https://vimeo.com/123456789/abcdef1234',
})

// Or explicitly
const player = createPlayer('#container', {
  src: {
    src: '123456789',
    provider: 'vimeo',
    hash: 'abcdef1234',
  },
})
```

## Configuration

```typescript
const player = createPlayer('#container', {
  src: 'https://vimeo.com/123456789',

  vimeo: {
    // Accent color (hex without #)
    color: 'ff0000',

    // Show byline (uploader name)
    byline: false,

    // Show portrait (uploader avatar)
    portrait: false,

    // Show title
    title: false,

    // Enable background mode (no controls, loops)
    background: false,

    // Enable Do Not Track
    dnt: true,

    // Keyboard input
    keyboard: true,

    // Pip mode
    pip: true,

    // Playsinline on mobile
    playsinline: true,

    // Quality (auto, 4K, 2K, 1080p, 720p, 540p, 360p, 240p)
    quality: 'auto',

    // Speed control
    speed: true,

    // Text track language
    texttrack: 'en',

    // Transparent background (for videos with alpha)
    transparent: true,
  },
})
```

## Quality Selection

```typescript
// Get available qualities
const qualities = player.state.qualities

// Set quality
player.setQuality('1080p')
```

## Supported URL Formats

```typescript
// All these formats work:
'https://vimeo.com/VIDEO_ID'
'https://vimeo.com/VIDEO_ID/HASH'
'https://player.vimeo.com/video/VIDEO_ID'
'https://vimeo.com/channels/CHANNEL/VIDEO_ID'
'https://vimeo.com/groups/GROUP/videos/VIDEO_ID'
```

## Feature Detection

```typescript
import { isVimeoSource, extractVimeoId, extractVimeoHash } from 'ts-video-player'

isVimeoSource('https://vimeo.com/123456789') // true
extractVimeoId('https://vimeo.com/123456789') // '123456789'
extractVimeoHash('https://vimeo.com/123456789/abcdef') // 'abcdef'
```

## Events

Vimeo-specific events:

```typescript
player.on('qualitychange', (quality) => {
  console.log('Vimeo quality changed:', quality)
})

player.on('texttrackchange', (track) => {
  console.log('Text track changed:', track)
})

player.on('cuechange', (cues) => {
  console.log('Cue changed:', cues)
})
```

## Limitations

- Picture-in-Picture requires Vimeo Pro or higher
- Some features require Vimeo Plus/Pro
- Quality selection depends on video's available qualities

## Next Steps

- [HLS Provider](/providers/hls) - Adaptive streaming
- [DASH Provider](/providers/dash) - MPEG-DASH streaming

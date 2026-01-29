# HTML5 Provider

The HTML5 provider handles native video playback using the browser's built-in `<video>` element.

## Supported Formats

| Format | MIME Type | Browser Support |
|--------|-----------|-----------------|
| MP4 (H.264) | `video/mp4` | All modern browsers |
| WebM (VP8/VP9) | `video/webm` | Chrome, Firefox, Edge |
| Ogg (Theora) | `video/ogg` | Chrome, Firefox |
| MOV | `video/quicktime` | Safari |

## Basic Usage

```typescript
import { createPlayer } from 'ts-video-player'

const player = createPlayer('#container', {
  src: '/video.mp4',
})
```

## Multiple Sources

Provide fallback sources for browser compatibility:

```typescript
const player = createPlayer('#container', {
  src: [
    { src: '/video.webm', type: 'video/webm' },
    { src: '/video.mp4', type: 'video/mp4' },
  ],
})
```

## Configuration

```typescript
const player = createPlayer('#container', {
  src: '/video.mp4',

  // Preload behavior
  preload: 'metadata', // 'none' | 'metadata' | 'auto'

  // Cross-origin
  crossOrigin: 'anonymous', // 'anonymous' | 'use-credentials'

  // Poster image
  poster: '/poster.jpg',

  // Playback
  autoplay: false,
  muted: false,
  loop: false,
  playsinline: true, // Important for iOS
})
```

## Audio Tracks

Access audio tracks for multi-audio content:

```typescript
// Get available audio tracks
const audioTracks = player.state.audioTracks

// Switch audio track
player.setAudioTrack(audioTracks[1].id)
```

## Quality Levels

HTML5 video doesn't natively support quality switching. For adaptive streaming, use [HLS](/providers/hls) or [DASH](/providers/dash).

## Events

The HTML5 provider emits all standard media events:

```typescript
player.on('loadstart', () => console.log('Loading started'))
player.on('loadedmetadata', () => console.log('Metadata loaded'))
player.on('loadeddata', () => console.log('Data loaded'))
player.on('canplay', () => console.log('Can play'))
player.on('canplaythrough', () => console.log('Can play through'))
player.on('playing', () => console.log('Playing'))
player.on('waiting', () => console.log('Buffering'))
player.on('ended', () => console.log('Ended'))
```

## Feature Detection

```typescript
import { isHTML5Source } from 'ts-video-player'

const isHTML5 = isHTML5Source('/video.mp4') // true
const isHTML5 = isHTML5Source('https://youtube.com/watch?v=abc') // false
```

## Browser Compatibility

- Chrome 4+
- Firefox 3.5+
- Safari 4+
- Edge 12+
- IE 9+ (limited)

## Next Steps

- [YouTube Provider](/providers/youtube) - Embed YouTube videos
- [HLS Provider](/providers/hls) - Adaptive streaming

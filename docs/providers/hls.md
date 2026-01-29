# HLS Provider

HTTP Live Streaming (HLS) support using hls.js.

## Overview

HLS is Apple's adaptive streaming protocol. The player uses [hls.js](https://github.com/video-dev/hls.js) for browsers without native HLS support (Chrome, Firefox, Edge) and native HLS for Safari.

## Basic Usage

```typescript
import { createPlayer } from 'ts-video-player'

const player = createPlayer('#container', {
  src: 'https://example.com/stream.m3u8',
})
```

## Configuration

```typescript
const player = createPlayer('#container', {
  src: 'https://example.com/stream.m3u8',

  hls: {
    // Auto start loading
    autoStartLoad: true,

    // Start position (-1 for live edge)
    startPosition: -1,

    // Debug logging
    debug: false,

    // Cap level to player size
    capLevelToPlayerSize: true,

    // Max buffer length in seconds
    maxBufferLength: 30,

    // Max buffer size in bytes (default: 60MB)
    maxBufferSize: 60 * 1000 * 1000,

    // Max max buffer length
    maxMaxBufferLength: 600,

    // Enable ABR (adaptive bitrate)
    abrEwmaDefaultEstimate: 500000,
    abrEwmaFastLive: 3,
    abrEwmaSlow: 9,

    // Low latency mode
    lowLatencyMode: false,
    backBufferLength: 30,

    // Enable web workers
    enableWorker: true,

    // Fragment loading
    fragLoadingTimeOut: 20000,
    fragLoadingMaxRetry: 6,
    fragLoadingRetryDelay: 1000,

    // Manifest loading
    manifestLoadingTimeOut: 10000,
    manifestLoadingMaxRetry: 4,
    manifestLoadingRetryDelay: 500,

    // Level loading
    levelLoadingTimeOut: 10000,
    levelLoadingMaxRetry: 4,
    levelLoadingRetryDelay: 500,
  },
})
```

## Quality Selection

```typescript
// Get available qualities
const qualities = player.state.qualities

// qualities: [
//   { id: '0', height: 1080, bitrate: 5000000, codec: 'avc1.640028' },
//   { id: '1', height: 720, bitrate: 2500000, codec: 'avc1.64001f' },
//   { id: '2', height: 480, bitrate: 1000000, codec: 'avc1.4d401e' },
// ]

// Set specific quality
player.setQuality('0') // 1080p

// Enable auto quality (ABR)
player.setQuality('auto')
```

## Live Streaming

```typescript
const player = createPlayer('#container', {
  src: 'https://example.com/live.m3u8',
})

// Check if live
console.log(player.state.isLive) // true

// Seek to live edge
player.seekTo(player.state.duration)

// Get live edge latency
console.log(player.state.liveLatency)
```

## DRM Support

For DRM-protected content:

```typescript
const player = createPlayer('#container', {
  src: 'https://example.com/drm-stream.m3u8',

  hls: {
    emeEnabled: true,
    drmSystems: {
      'com.widevine.alpha': {
        licenseUrl: 'https://license.example.com/widevine',
      },
      'com.apple.fps': {
        licenseUrl: 'https://license.example.com/fairplay',
        serverCertificateUrl: 'https://license.example.com/fairplay/cert',
      },
    },
  },
})
```

## Audio Tracks

```typescript
// Get audio tracks
const audioTracks = player.state.audioTracks

// Switch audio track
player.setAudioTrack(audioTracks[1].id)
```

## Events

HLS-specific events:

```typescript
player.on('qualitychange', (quality) => {
  console.log('Quality changed:', quality)
})

player.on('levels', (levels) => {
  console.log('Available levels:', levels)
})

player.on('hlsError', (error) => {
  console.error('HLS error:', error)
})
```

## Feature Detection

```typescript
import { isHLSSource, isNativeHLSSupported } from 'ts-video-player'

isHLSSource('https://example.com/stream.m3u8') // true
isNativeHLSSupported() // true on Safari, false on Chrome
```

## Browser Support

- Chrome 39+ (via hls.js)
- Firefox 41+ (via hls.js)
- Safari 8+ (native)
- Edge 79+ (via hls.js)

## Next Steps

- [DASH Provider](/providers/dash) - MPEG-DASH streaming
- [Live Streaming](/features/live) - Live features

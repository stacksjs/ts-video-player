# DASH Provider

MPEG-DASH (Dynamic Adaptive Streaming over HTTP) support using dash.js.

## Overview

DASH is an adaptive streaming protocol similar to HLS. The player uses [dash.js](https://github.com/Dash-Industry-Forum/dash.js) for playback.

## Basic Usage

```typescript
import { createPlayer } from 'ts-video-player'

const player = createPlayer('#container', {
  src: 'https://example.com/manifest.mpd',
})
```

## Configuration

```typescript
const player = createPlayer('#container', {
  src: 'https://example.com/manifest.mpd',

  dash: {
    // Streaming settings
    streaming: {
      // Buffer settings
      buffer: {
        fastSwitchEnabled: true,
        stableBufferTime: 12,
        bufferTimeAtTopQuality: 30,
        bufferTimeAtTopQualityLongForm: 60,
      },

      // ABR (Adaptive Bitrate) settings
      abr: {
        autoSwitchBitrate: {
          video: true,
          audio: true,
        },
        initialBitrate: {
          video: -1, // Auto
          audio: -1,
        },
        maxBitrate: {
          video: -1, // Unlimited
          audio: -1,
        },
        minBitrate: {
          video: -1,
          audio: -1,
        },
        limitBitrateByPortal: true,
      },

      // Delay settings
      delay: {
        liveDelay: 4,
        liveDelayFragmentCount: null,
      },

      // Gap handling
      gaps: {
        jumpGaps: true,
        jumpLargeGaps: true,
        smallGapLimit: 1.5,
      },
    },

    // Debug mode
    debug: {
      logLevel: 0, // 0: none, 1: fatal, 2: error, 3: warning, 4: info, 5: debug
    },
  },
})
```

## Quality Selection

```typescript
// Get available qualities
const qualities = player.state.qualities

// Set specific quality
player.setQuality('0')

// Enable auto quality (ABR)
player.setQuality('auto')
```

## DRM Support

DASH has excellent DRM support:

### Widevine

```typescript
const player = createPlayer('#container', {
  src: 'https://example.com/drm.mpd',

  dash: {
    drm: {
      'com.widevine.alpha': {
        serverURL: 'https://license.example.com/widevine',
        httpRequestHeaders: {
          'X-Custom-Header': 'value',
        },
      },
    },
  },
})
```

### PlayReady

```typescript
const player = createPlayer('#container', {
  src: 'https://example.com/drm.mpd',

  dash: {
    drm: {
      'com.microsoft.playready': {
        serverURL: 'https://license.example.com/playready',
      },
    },
  },
})
```

### ClearKey

```typescript
const player = createPlayer('#container', {
  src: 'https://example.com/clearkey.mpd',

  dash: {
    drm: {
      'org.w3.clearkey': {
        clearkeys: {
          'key-id-hex': 'key-value-hex',
        },
      },
    },
  },
})
```

## Live Streaming

```typescript
const player = createPlayer('#container', {
  src: 'https://example.com/live.mpd',
})

// Low latency live
const player = createPlayer('#container', {
  src: 'https://example.com/live.mpd',
  dash: {
    streaming: {
      lowLatencyEnabled: true,
      delay: {
        liveDelay: 2,
      },
    },
  },
})
```

## Multi-Period Content

DASH supports multi-period content (e.g., ads):

```typescript
player.on('periodSwitch', (period) => {
  console.log('Switched to period:', period)
})
```

## Audio/Text Tracks

```typescript
// Get audio tracks
const audioTracks = player.state.audioTracks

// Switch audio track
player.setAudioTrack(audioTracks[1].id)

// Get text tracks
const textTracks = player.state.textTracks

// Enable text track
player.setTextTrack(textTracks[0].id)
```

## Events

DASH-specific events:

```typescript
player.on('qualitychange', (quality) => {
  console.log('Quality changed:', quality)
})

player.on('dashError', (error) => {
  console.error('DASH error:', error)
})

player.on('manifestLoaded', (manifest) => {
  console.log('Manifest loaded:', manifest)
})
```

## Feature Detection

```typescript
import { isDASHSource } from 'ts-video-player'

isDASHSource('https://example.com/manifest.mpd') // true
```

## Browser Support

- Chrome 35+
- Firefox 42+
- Safari 13+ (limited)
- Edge 79+

## Next Steps

- [HLS Provider](/providers/hls) - Alternative streaming
- [Live Streaming](/features/live) - Live features

# State

Reference for the player state object.

## Accessing State

```typescript
const state = player.state

// Or subscribe to changes
player.on('statechange', (state, key) => {
  console.log(key, 'changed to', state[key])
})
```

## Playback State

### `playbackState`

Current playback state.

```typescript
state.playbackState // 'idle' | 'playing' | 'paused' | 'ended'
```

### `loadingState`

Current loading state.

```typescript
state.loadingState // 'idle' | 'loading' | 'loaded' | 'error'
```

### `currentTime`

Current playback position in seconds.

```typescript
state.currentTime // number
```

### `duration`

Total duration in seconds.

```typescript
state.duration // number
```

### `buffered`

Buffered time ranges.

```typescript
state.buffered // TimeRange[]
// [{ start: 0, end: 30 }, { start: 40, end: 60 }]
```

### `seekable`

Seekable time ranges.

```typescript
state.seekable // TimeRange[]
```

### `played`

Played time ranges.

```typescript
state.played // TimeRange[]
```

## Volume State

### `volume`

Current volume (0-1).

```typescript
state.volume // number (0-1)
```

### `muted`

Whether muted.

```typescript
state.muted // boolean
```

## Playback Settings

### `playbackRate`

Current playback rate.

```typescript
state.playbackRate // number (0.25-4)
```

### `loop`

Whether looping.

```typescript
state.loop // boolean
```

### `autoplay`

Whether autoplay is enabled.

```typescript
state.autoplay // boolean
```

## Display State

### `isFullscreen`

Whether in fullscreen.

```typescript
state.isFullscreen // boolean
```

### `isPiP`

Whether in picture-in-picture.

```typescript
state.isPiP // boolean
```

### `poster`

Poster image URL.

```typescript
state.poster // string
```

### `title`

Video title.

```typescript
state.title // string
```

## Quality State

### `qualities`

Available quality levels.

```typescript
state.qualities // VideoQuality[]
// [
//   { id: 'auto', height: 0, selected: true },
//   { id: '0', height: 1080, bitrate: 5000000 },
//   { id: '1', height: 720, bitrate: 2500000 },
// ]
```

### `currentQuality`

Currently selected quality.

```typescript
state.currentQuality // VideoQuality | null
```

## Track State

### `textTracks`

Available text tracks.

```typescript
state.textTracks // TextTrack[]
```

### `textTrack`

Currently active text track.

```typescript
state.textTrack // TextTrack | null
```

### `audioTracks`

Available audio tracks.

```typescript
state.audioTracks // AudioTrack[]
```

### `audioTrack`

Currently active audio track.

```typescript
state.audioTrack // AudioTrack | null
```

## Live State

### `isLive`

Whether this is a live stream.

```typescript
state.isLive // boolean
```

### `liveLatency`

Latency from live edge in seconds.

```typescript
state.liveLatency // number
```

## Error State

### `error`

Current error, if any.

```typescript
state.error // MediaError | null
// { code: 3, message: 'MEDIA_ERR_DECODE' }
```

## Media Info

### `videoWidth`

Video width in pixels.

```typescript
state.videoWidth // number
```

### `videoHeight`

Video height in pixels.

```typescript
state.videoHeight // number
```

### `preload`

Preload strategy.

```typescript
state.preload // 'none' | 'metadata' | 'auto'
```

### `crossOrigin`

Cross-origin setting.

```typescript
state.crossOrigin // 'anonymous' | 'use-credentials' | null
```

## Computed Selectors

Import helper selectors for computed values:

```typescript
import {
  selectBufferedAmount,
  selectProgress,
  selectRemainingTime,
  selectIsIdle,
  selectIsLoading,
  selectIsLive,
  selectCurrentQuality,
  selectCurrentTextTrack,
} from 'ts-video-player'

// Get buffered amount in seconds
const buffered = selectBufferedAmount(state)

// Get progress percentage (0-100)
const progress = selectProgress(state)

// Get remaining time
const remaining = selectRemainingTime(state)

// Check states
const isIdle = selectIsIdle(state)
const isLoading = selectIsLoading(state)
```

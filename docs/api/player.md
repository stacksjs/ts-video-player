# Player API

Complete API reference for the Player class.

## Creating a Player

```typescript
import { createPlayer, Player } from 'ts-video-player'

// Using factory function
const player = createPlayer('#container', options)

// Using class directly
const player = new Player('#container', options)

// Get existing player
const player = getPlayer('#container')
```

## Properties

### `el`

The player's container element.

```typescript
player.el // HTMLElement
```

### `state`

Current player state (read-only).

```typescript
player.state // PlayerState
```

### `provider`

Current media provider.

```typescript
player.provider // Provider | null
```

### `ready`

Whether the provider is ready.

```typescript
player.ready // boolean
```

## Playback Methods

### `play()`

Start playback.

```typescript
await player.play()
```

### `pause()`

Pause playback.

```typescript
player.pause()
```

### `togglePlay()`

Toggle play/pause.

```typescript
await player.togglePlay()
```

### `seekTo(time)`

Seek to specific time in seconds.

```typescript
player.seekTo(30) // Seek to 30 seconds
```

### `seekBy(delta)`

Seek relative to current position.

```typescript
player.seekBy(10)  // Forward 10 seconds
player.seekBy(-5)  // Backward 5 seconds
```

## Volume Methods

### `setVolume(level)`

Set volume (0-1).

```typescript
player.setVolume(0.5) // 50% volume
```

### `toggleMute()`

Toggle mute state.

```typescript
player.toggleMute()
```

## Playback Rate

### `setPlaybackRate(rate)`

Set playback speed.

```typescript
player.setPlaybackRate(1.5) // 1.5x speed
player.setPlaybackRate(0.5) // 0.5x speed
```

## Fullscreen

### `toggleFullscreen()`

Toggle fullscreen mode.

```typescript
await player.toggleFullscreen()
```

### `requestFullscreen()`

Enter fullscreen.

```typescript
await player.requestFullscreen()
```

### `exitFullscreen()`

Exit fullscreen.

```typescript
await player.exitFullscreen()
```

## Picture-in-Picture

### `togglePiP()`

Toggle picture-in-picture.

```typescript
await player.togglePiP()
```

### `requestPiP()`

Enter PiP mode.

```typescript
await player.requestPiP()
```

### `exitPiP()`

Exit PiP mode.

```typescript
await player.exitPiP()
```

## Quality

### `setQuality(qualityId)`

Set video quality.

```typescript
player.setQuality('0')    // Specific quality
player.setQuality('auto') // Auto quality
```

## Captions

### `toggleCaptions()`

Toggle captions on/off.

```typescript
player.toggleCaptions()
```

### `setTextTrack(trackId)`

Enable specific text track.

```typescript
player.setTextTrack('0')   // Enable track
player.setTextTrack(null)  // Disable captions
```

## Audio

### `setAudioTrack(trackId)`

Set audio track.

```typescript
player.setAudioTrack('1')
```

## Source

### `setSrc(src)`

Change media source.

```typescript
await player.setSrc('/new-video.mp4')
await player.setSrc('https://youtube.com/watch?v=abc')
```

## Events

### `on(event, handler)`

Subscribe to event.

```typescript
player.on('play', () => console.log('Playing'))
```

### `off(event, handler)`

Unsubscribe from event.

```typescript
player.off('play', handler)
```

### `once(event, handler)`

Subscribe to event once.

```typescript
player.once('ready', () => console.log('Ready'))
```

## Lifecycle

### `destroy()`

Destroy the player and clean up.

```typescript
player.destroy()
```

## Full Options Reference

```typescript
interface PlayerOptions {
  // Source
  src?: string | Src | Src[]

  // Metadata
  poster?: string
  title?: string

  // Playback
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  volume?: number
  playbackRate?: number
  preload?: 'none' | 'metadata' | 'auto'
  crossOrigin?: 'anonymous' | 'use-credentials'
  playsinline?: boolean

  // Tracks
  textTracks?: TextTrack[]

  // UI
  controls?: boolean | ControlsConfig
  keyboard?: boolean | KeyboardConfig
  theme?: Theme | string

  // Storage
  storage?: StorageConfig

  // i18n
  i18n?: I18nConfig

  // Provider-specific
  youtube?: YouTubeConfig
  vimeo?: VimeoConfig
  hls?: HLSConfig
  dash?: DASHConfig

  // Plugins
  plugins?: Plugin[]
}
```

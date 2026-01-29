# Quick Start

Learn how to create your first video player.

## Basic Usage

```typescript
import { createPlayer } from 'ts-video-player'

const player = createPlayer('#video-container', {
  src: 'https://example.com/video.mp4',
  poster: '/poster.jpg',
  autoplay: false,
  controls: true,
})
```

## HTML Setup

Add a container element to your HTML:

```html
<div id="video-container"></div>
```

The player will create all necessary DOM elements inside this container.

## Listening to Events

```typescript
// Playback events
player.on('playing', () => console.log('Video is playing!'))
player.on('pause', () => console.log('Video paused'))
player.on('ended', () => console.log('Video ended'))

// Progress events
player.on('timeupdate', () => {
  console.log('Current time:', player.state.currentTime)
})

// Error handling
player.on('error', (error) => {
  console.error('Playback error:', error)
})
```

## Controlling Playback

```typescript
// Play/Pause
await player.play()
player.pause()
player.togglePlay()

// Seeking
player.seekTo(30)        // Seek to 30 seconds
player.seekBy(10)        // Seek forward 10 seconds
player.seekBy(-10)       // Seek backward 10 seconds

// Volume
player.setVolume(0.5)    // Set volume to 50%
player.toggleMute()

// Playback rate
player.setPlaybackRate(1.5)  // 1.5x speed
```

## Fullscreen & Picture-in-Picture

```typescript
// Fullscreen
await player.toggleFullscreen()
await player.requestFullscreen()
await player.exitFullscreen()

// Picture-in-Picture
await player.togglePiP()
```

## Accessing State

```typescript
const state = player.state

console.log(state.currentTime)    // Current playback time
console.log(state.duration)       // Video duration
console.log(state.volume)         // Current volume (0-1)
console.log(state.muted)          // Is muted
console.log(state.playbackState)  // 'idle' | 'playing' | 'paused' | 'ended'
console.log(state.isFullscreen)   // Is fullscreen
console.log(state.qualities)      // Available quality levels
```

## Cleanup

Always destroy the player when you're done:

```typescript
player.destroy()
```

## Complete Example

```typescript
import { createPlayer } from 'ts-video-player'

// Create player
const player = createPlayer('#video-container', {
  src: 'https://example.com/video.mp4',
  poster: '/poster.jpg',
  autoplay: false,
  controls: true,
  volume: 0.8,
  muted: false,
  loop: false,
  playbackRate: 1,
  preload: 'metadata',
  textTracks: [
    {
      kind: 'subtitles',
      label: 'English',
      srclang: 'en',
      src: '/captions-en.vtt',
      default: true,
    },
  ],
})

// Listen to events
player.on('ready', () => {
  console.log('Player is ready')
})

player.on('playing', () => {
  console.log('Video is playing')
})

player.on('ended', () => {
  console.log('Video ended')
})

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  player.destroy()
})
```

## Next Steps

- [Configuration](/guide/config) - All configuration options
- [Theming](/guide/themes) - Customize the player appearance
- [Providers](/providers/) - Use different video sources

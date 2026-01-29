# Live Streaming

Support for live streams with DVR controls.

## Basic Usage

```typescript
const player = createPlayer('#container', {
  src: 'https://example.com/live.m3u8',
})

// Check if live
console.log(player.state.isLive)
```

## Live Indicator

```typescript
import { createLiveIndicator } from 'ts-video-player'

const indicator = createLiveIndicator(player)
player.el.appendChild(indicator.element)
```

## Seek to Live

```typescript
import { createSeekToLiveButton } from 'ts-video-player'

const button = createSeekToLiveButton(player)
player.el.appendChild(button.element)

// Or programmatically
player.seekTo(player.state.duration) // Seek to live edge
```

## Live Controller

```typescript
import { createLiveController } from 'ts-video-player'

const liveController = createLiveController(player, {
  // Edge tolerance in seconds
  liveEdgeTolerance: 10,

  // Show live indicator
  showIndicator: true,

  // Show seek to live button
  showSeekToLive: true,
})

liveController.attach(player.el)
```

## DVR (Timeshift)

For streams with DVR support:

```typescript
// Seek back in time
player.seekTo(player.state.duration - 300) // 5 minutes behind live

// Check if at live edge
const isAtLive = player.state.currentTime >= player.state.duration - 10
```

## Events

```typescript
player.on('livechange', (isLive) => {
  console.log('Live status:', isLive)
})
```

## State Properties

```typescript
const state = player.state

console.log(state.isLive)        // Is live stream
console.log(state.liveLatency)   // Latency from live edge
console.log(state.seekableStart) // Start of seekable range
console.log(state.seekableEnd)   // End of seekable range (live edge)
```

## Low Latency

For low-latency live streaming:

```typescript
const player = createPlayer('#container', {
  src: 'https://example.com/ll-hls.m3u8',
  hls: {
    lowLatencyMode: true,
    backBufferLength: 30,
  },
})
```

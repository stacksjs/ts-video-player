# Quality Selection

Allow users to select video quality for adaptive streaming.

## Automatic Quality

By default, quality adapts automatically based on network conditions:

```typescript
const player = createPlayer('#container', {
  src: 'https://example.com/stream.m3u8', // HLS
})

// Quality is auto-selected
```

## Getting Available Qualities

```typescript
const qualities = player.state.qualities

// Example output:
// [
//   { id: 'auto', height: 0, selected: true },
//   { id: '0', height: 1080, bitrate: 5000000, codec: 'avc1.640028' },
//   { id: '1', height: 720, bitrate: 2500000, codec: 'avc1.64001f' },
//   { id: '2', height: 480, bitrate: 1000000, codec: 'avc1.4d401e' },
//   { id: '3', height: 360, bitrate: 500000, codec: 'avc1.42001e' },
// ]
```

## Setting Quality

```typescript
// Set specific quality
player.setQuality('0') // 1080p

// Enable auto quality
player.setQuality('auto')
```

## Quality Change Events

```typescript
player.on('qualitychange', (quality) => {
  console.log('Quality changed to:', quality.height + 'p')
})

player.on('qualities', (qualities) => {
  console.log('Available qualities:', qualities)
})
```

## Settings Menu

The built-in settings menu includes quality selection:

```typescript
import { createSettingsMenu } from 'ts-video-player'

const menu = createSettingsMenu(player, player.el, {
  quality: true,
  speed: true,
  captions: true,
})
```

## Quality Labels

Quality labels are automatically generated:

| Height | Label |
|--------|-------|
| 2160 | 4K |
| 1440 | 1440p |
| 1080 | 1080p |
| 720 | 720p |
| 480 | 480p |
| 360 | 360p |
| 240 | 240p |
| 144 | 144p |

## Provider-Specific

### HLS

```typescript
const player = createPlayer('#container', {
  src: 'https://example.com/stream.m3u8',
  hls: {
    capLevelToPlayerSize: true, // Cap quality to player size
  },
})
```

### DASH

```typescript
const player = createPlayer('#container', {
  src: 'https://example.com/manifest.mpd',
  dash: {
    streaming: {
      abr: {
        autoSwitchBitrate: { video: true },
        maxBitrate: { video: 5000000 }, // Limit max quality
      },
    },
  },
})
```

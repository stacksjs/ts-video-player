# Events

Complete list of player events.

## Lifecycle Events

### `init`

Fired when player is initialized.

```typescript
player.on('init', () => {
  console.log('Player initialized')
})
```

### `ready`

Fired when provider is ready.

```typescript
player.on('ready', () => {
  console.log('Provider ready')
})
```

### `destroy`

Fired when player is destroyed.

```typescript
player.on('destroy', () => {
  console.log('Player destroyed')
})
```

## Playback Events

### `play`

Fired when play is requested.

```typescript
player.on('play', () => {
  console.log('Play requested')
})
```

### `playing`

Fired when playback starts.

```typescript
player.on('playing', () => {
  console.log('Now playing')
})
```

### `pause`

Fired when paused.

```typescript
player.on('pause', () => {
  console.log('Paused')
})
```

### `ended`

Fired when playback ends.

```typescript
player.on('ended', () => {
  console.log('Video ended')
})
```

### `seeking`

Fired when seek starts.

```typescript
player.on('seeking', () => {
  console.log('Seeking...')
})
```

### `seeked`

Fired when seek completes.

```typescript
player.on('seeked', () => {
  console.log('Seek complete')
})
```

### `waiting`

Fired when buffering.

```typescript
player.on('waiting', () => {
  console.log('Buffering...')
})
```

### `canplay`

Fired when can start playing.

```typescript
player.on('canplay', () => {
  console.log('Can play')
})
```

### `canplaythrough`

Fired when can play without buffering.

```typescript
player.on('canplaythrough', () => {
  console.log('Can play through')
})
```

## Time Events

### `timeupdate`

Fired periodically during playback.

```typescript
player.on('timeupdate', () => {
  console.log('Current time:', player.state.currentTime)
})
```

### `durationchange`

Fired when duration changes.

```typescript
player.on('durationchange', () => {
  console.log('Duration:', player.state.duration)
})
```

### `progress`

Fired when buffer progress updates.

```typescript
player.on('progress', () => {
  console.log('Buffered:', player.state.buffered)
})
```

## State Events

### `statechange`

Fired when any state changes.

```typescript
player.on('statechange', (state, key) => {
  console.log('State changed:', key, state[key])
})
```

### `volumechange`

Fired when volume changes.

```typescript
player.on('volumechange', () => {
  console.log('Volume:', player.state.volume)
  console.log('Muted:', player.state.muted)
})
```

### `ratechange`

Fired when playback rate changes.

```typescript
player.on('ratechange', () => {
  console.log('Playback rate:', player.state.playbackRate)
})
```

## Quality Events

### `qualitychange`

Fired when quality changes.

```typescript
player.on('qualitychange', (quality) => {
  console.log('Quality:', quality.height + 'p')
})
```

### `qualities`

Fired when quality list is available.

```typescript
player.on('qualities', (qualities) => {
  console.log('Available qualities:', qualities)
})
```

## Track Events

### `texttrackchange`

Fired when text track changes.

```typescript
player.on('texttrackchange', (track) => {
  console.log('Text track:', track?.label || 'Off')
})
```

### `audiotrackchange`

Fired when audio track changes.

```typescript
player.on('audiotrackchange', (track) => {
  console.log('Audio track:', track.label)
})
```

### `cuechange`

Fired when caption cues change.

```typescript
player.on('cuechange', (cues) => {
  console.log('Active cues:', cues)
})
```

## Fullscreen Events

### `fullscreenchange`

Fired when fullscreen state changes.

```typescript
player.on('fullscreenchange', (isFullscreen) => {
  console.log('Fullscreen:', isFullscreen)
})
```

## PiP Events

### `enterpictureinpicture`

Fired when entering PiP.

```typescript
player.on('enterpictureinpicture', () => {
  console.log('Entered PiP')
})
```

### `leavepictureinpicture`

Fired when leaving PiP.

```typescript
player.on('leavepictureinpicture', () => {
  console.log('Left PiP')
})
```

## Error Events

### `error`

Fired when an error occurs.

```typescript
player.on('error', (error) => {
  console.error('Error:', error.message)
})
```

## Loading Events

### `loadstart`

Fired when loading starts.

```typescript
player.on('loadstart', () => {
  console.log('Loading started')
})
```

### `loadedmetadata`

Fired when metadata is loaded.

```typescript
player.on('loadedmetadata', () => {
  console.log('Metadata loaded')
})
```

### `loadeddata`

Fired when data is loaded.

```typescript
player.on('loadeddata', () => {
  console.log('Data loaded')
})
```

## Source Events

### `sourcechange`

Fired when source changes.

```typescript
player.on('sourcechange', (src) => {
  console.log('Source changed:', src)
})
```

### `providerchange`

Fired when provider changes.

```typescript
player.on('providerchange', (provider) => {
  console.log('Provider changed:', provider)
})
```

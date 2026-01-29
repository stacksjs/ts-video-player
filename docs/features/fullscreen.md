# Fullscreen

Enable fullscreen playback.

## Basic Usage

```typescript
const player = createPlayer('#container', {
  src: '/video.mp4',
  controls: {
    fullscreen: true, // Show fullscreen button
  },
})

// Toggle fullscreen
await player.toggleFullscreen()
```

## API Methods

```typescript
// Enter fullscreen
await player.requestFullscreen()

// Exit fullscreen
await player.exitFullscreen()

// Toggle fullscreen
await player.toggleFullscreen()

// Check if fullscreen
console.log(player.state.isFullscreen)
```

## Events

```typescript
player.on('fullscreenchange', (isFullscreen) => {
  if (isFullscreen) {
    console.log('Entered fullscreen')
  } else {
    console.log('Exited fullscreen')
  }
})
```

## Keyboard Shortcut

Press `F` to toggle fullscreen (when player is focused).

## iOS Fullscreen

On iOS, fullscreen uses the native video fullscreen:

```typescript
const player = createPlayer('#container', {
  src: '/video.mp4',
  playsinline: true, // Prevent auto-fullscreen on play
})
```

## Styling in Fullscreen

```css
.ts-video-player:fullscreen {
  /* Fullscreen styles */
}

.ts-video-player::backdrop {
  background: black;
}
```

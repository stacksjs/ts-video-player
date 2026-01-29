# Keyboard Shortcuts

ts-video-player includes comprehensive keyboard controls.

## Default Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Toggle play/pause |
| `K` | Toggle play/pause |
| `M` | Toggle mute |
| `F` | Toggle fullscreen |
| `P` | Toggle picture-in-picture |
| `C` | Toggle captions |
| `←` (ArrowLeft) | Seek backward 5s |
| `→` (ArrowRight) | Seek forward 5s |
| `J` | Seek backward 10s |
| `L` | Seek forward 10s |
| `↑` (ArrowUp) | Volume up 10% |
| `↓` (ArrowDown) | Volume down 10% |
| `0-9` | Seek to 0-90% of duration |
| `Home` | Seek to start |
| `End` | Seek to end |
| `>` | Increase playback speed |
| `<` | Decrease playback speed |

## Configuration

### Disable Keyboard Controls

```typescript
const player = createPlayer('#container', {
  src: '/video.mp4',
  keyboard: false,
})
```

### Custom Shortcuts

```typescript
const player = createPlayer('#container', {
  src: '/video.mp4',
  keyboard: {
    enabled: true,
    global: false, // Only when player is focused
    shortcuts: {
      play: ['Space', 'k'],
      mute: ['m'],
      fullscreen: ['f'],
      pip: ['p'],
      captions: ['c'],
      seekBackward: ['ArrowLeft', 'j'],
      seekForward: ['ArrowRight', 'l'],
      volumeUp: ['ArrowUp'],
      volumeDown: ['ArrowDown'],
      speedUp: ['>'],
      speedDown: ['<'],
    },
  },
})
```

### Global Keyboard Listener

By default, keyboard shortcuts only work when the player is focused. Enable global listening:

```typescript
const player = createPlayer('#container', {
  src: '/video.mp4',
  keyboard: {
    enabled: true,
    global: true, // Listen to keyboard events globally
  },
})
```

## Custom Keyboard Handler

For advanced use cases, create a custom keyboard handler:

```typescript
import { createPlayer, createKeyboardHandler } from 'ts-video-player'

const player = createPlayer('#container', {
  src: '/video.mp4',
  keyboard: false, // Disable default handler
})

// Create custom handler
const keyboardHandler = createKeyboardHandler({
  togglePlay: () => player.togglePlay(),
  toggleMute: () => player.toggleMute(),
  toggleFullscreen: () => player.toggleFullscreen(),
  seekBackward: () => player.seekBy(-10),
  seekForward: () => player.seekBy(10),
  volumeUp: () => player.setVolume(Math.min(1, player.state.volume + 0.1)),
  volumeDown: () => player.setVolume(Math.max(0, player.state.volume - 0.1)),
})

// Attach to container
player.el.addEventListener('keydown', keyboardHandler)
```

## Preventing Default Behavior

The player prevents default browser behavior for handled keys. For example, `Space` won't scroll the page when the player is focused.

## Focus Management

```typescript
// Focus the player programmatically
player.el.focus()

// Check if player is focused
const isFocused = document.activeElement === player.el
```

## Accessibility Notes

- All shortcuts are announced to screen readers
- Focus indicators are visible
- Shortcuts work in fullscreen mode
- Tab navigation moves through controls

## Next Steps

- [Accessibility](/guide/accessibility) - Full accessibility features
- [Configuration](/guide/config) - All configuration options

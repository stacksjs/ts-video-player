# Accessibility

ts-video-player is built with accessibility in mind, following WCAG 2.1 guidelines.

## Keyboard Navigation

Full keyboard support for all player controls:

| Key | Action |
|-----|--------|
| `Space` / `K` | Toggle play/pause |
| `M` | Toggle mute |
| `F` | Toggle fullscreen |
| `P` | Toggle picture-in-picture |
| `C` | Toggle captions |
| `←` / `→` | Seek backward/forward 5s |
| `↑` / `↓` | Volume up/down |
| `0-9` | Seek to 0-90% |
| `Home` | Seek to start |
| `End` | Seek to end |
| `>` / `<` | Increase/decrease speed |

## Screen Reader Support

All controls include proper ARIA labels:

```html
<button
  aria-label="Play"
  aria-pressed="false"
  role="button"
>
  <!-- Play icon -->
</button>

<input
  type="range"
  role="slider"
  aria-label="Seek"
  aria-valuemin="0"
  aria-valuemax="120"
  aria-valuenow="30"
  aria-valuetext="30 seconds of 2 minutes"
/>
```

## Focus Management

- Visible focus indicators on all interactive elements
- Focus trap in fullscreen mode
- Focus returns to appropriate element after modal/menu close

## ARIA Live Regions

Dynamic content announcements:

```html
<div role="status" aria-live="polite" aria-atomic="true">
  <!-- Announces: "Playing", "Paused", "Volume 50%", etc. -->
</div>
```

## Configuration

Enable or configure accessibility features:

```typescript
const player = createPlayer('#container', {
  src: '/video.mp4',
  title: 'Introduction Video', // Used for aria-label

  keyboard: {
    enabled: true,
    global: false, // Only when player is focused
  },

  controls: {
    // All controls have proper ARIA labels
    play: true,
    mute: true,
    fullscreen: true,
    captions: true,
  },
})
```

## Captions

Always provide captions for accessibility:

```typescript
const player = createPlayer('#container', {
  src: '/video.mp4',
  textTracks: [
    {
      kind: 'captions', // Use 'captions' for accessibility
      label: 'English (CC)',
      srclang: 'en',
      src: '/captions-en.vtt',
      default: true,
    },
  ],
})
```

## Color Contrast

All themes meet WCAG AA contrast requirements:

- Text on backgrounds: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

## Reduced Motion

The player respects `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .ts-video-player * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Testing Accessibility

```typescript
// Check if captions are enabled
console.log(player.state.textTrack)

// Listen for caption changes
player.on('texttrackchange', (track) => {
  console.log('Caption track changed:', track?.label)
})
```

## Best Practices

1. **Always provide captions** - Use WebVTT format
2. **Use descriptive titles** - Set the `title` option
3. **Don't autoplay with sound** - Autoplay should be muted
4. **Provide audio descriptions** - For visually complex content
5. **Test with screen readers** - VoiceOver, NVDA, JAWS

## Next Steps

- [Keyboard Shortcuts](/guide/keyboard) - Customize keyboard controls
- [Captions](/features/captions) - Configure captions

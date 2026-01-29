# Picture-in-Picture

Enable picture-in-picture mode for multitasking.

## Basic Usage

```typescript
const player = createPlayer('#container', {
  src: '/video.mp4',
  controls: {
    pip: true, // Show PiP button
  },
})

// Toggle PiP
await player.togglePiP()
```

## API Methods

```typescript
// Enter PiP
await player.requestPiP()

// Exit PiP
await player.exitPiP()

// Toggle PiP
await player.togglePiP()

// Check if in PiP
console.log(player.state.isPiP)
```

## Events

```typescript
player.on('enterpictureinpicture', () => {
  console.log('Entered PiP mode')
})

player.on('leavepictureinpicture', () => {
  console.log('Left PiP mode')
})
```

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome 70+ | Yes |
| Edge 79+ | Yes |
| Safari 13.1+ | Yes |
| Firefox 71+ | Yes (limited) |

## Feature Detection

```typescript
const isPiPSupported = 'pictureInPictureEnabled' in document

if (isPiPSupported) {
  // Show PiP button
}
```

## Limitations

- YouTube and Vimeo embeds don't support PiP
- Must have user gesture to enter PiP
- Only one PiP window at a time

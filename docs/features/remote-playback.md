# Remote Playback

Cast videos to AirPlay and Google Cast devices.

## AirPlay

```typescript
import { createPlayer, createAirPlayButton, isAirPlaySupported } from 'ts-video-player'

const player = createPlayer('#container', { src: '/video.mp4' })

if (isAirPlaySupported()) {
  const airplayButton = createAirPlayButton(player)
  player.el.appendChild(airplayButton.element)
}
```

## Google Cast

```typescript
import {
  createPlayer,
  createGoogleCastButton,
  loadGoogleCastSDK,
  initializeGoogleCast,
} from 'ts-video-player'

// Load Cast SDK
await loadGoogleCastSDK()

// Initialize
initializeGoogleCast({
  receiverApplicationId: 'YOUR_APP_ID', // Or use default
})

const player = createPlayer('#container', { src: '/video.mp4' })

const castButton = createGoogleCastButton(player)
player.el.appendChild(castButton.element)
```

## Remote Playback Controller

```typescript
import { createRemotePlaybackController } from 'ts-video-player'

const controller = createRemotePlaybackController(player, {
  airplay: true,
  googleCast: true,
})

controller.attach(player.el)
```

## Events

```typescript
player.on('remoteplaybackconnecting', () => {
  console.log('Connecting to remote device...')
})

player.on('remoteplaybackconnect', (device) => {
  console.log('Connected to:', device.name)
})

player.on('remoteplaybackdisconnect', () => {
  console.log('Disconnected from remote device')
})
```

## API Methods

```typescript
// Show AirPlay picker
await showAirPlayPicker(player)

// Check if casting
console.log(isCasting())
console.log(isAirPlaying())

// End cast session
await endCastSession()
```

## Browser Support

| Feature | Browser |
|---------|---------|
| AirPlay | Safari 9+ |
| Google Cast | Chrome 72+, Edge 79+ |

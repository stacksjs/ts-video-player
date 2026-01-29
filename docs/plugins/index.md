# Plugins Overview

Extend ts-video-player with powerful plugins.

## Available Plugins

| Plugin | Description |
|--------|-------------|
| [Analytics](/plugins/analytics) | Video analytics with ts-analytics integration |
| [Ads](/plugins/ads) | VAST/VPAID ad support |
| [Skip Segments](/plugins/skip-segments) | Skip intro, outro, recap, etc. |
| [End Screen](/plugins/end-screen) | Recommendations and autoplay |
| [Watermarks](/plugins/watermarks) | Static and dynamic watermarks |

## Using Plugins

Plugins are added via the `plugins` option:

```typescript
import {
  createPlayer,
  analyticsPlugin,
  adsPlugin,
  skipSegmentsPlugin,
  endScreenPlugin,
  watermarkPlugin,
} from 'ts-video-player'

const player = createPlayer('#container', {
  src: '/video.mp4',
  plugins: [
    analyticsPlugin({ /* config */ }),
    adsPlugin({ /* config */ }),
    skipSegmentsPlugin({ /* config */ }),
    endScreenPlugin({ /* config */ }),
    watermarkPlugin([ /* watermarks */ ]),
  ],
})
```

## Plugin API

After installation, plugins expose their API on the player instance:

```typescript
// Analytics
player.analytics.trackEvent('custom_event', { data: 'value' })

// Ads
player.ads.skip()
player.ads.getState()

// Skip Segments
player.skipSegments.addSegment({ type: 'intro', startTime: 0, endTime: 30 })

// End Screen
player.endScreen.show()
player.endScreen.setRecommendations([...])

// Watermarks
player.watermark.add('logo', { image: '/logo.png' })
```

## Creating Custom Plugins

Plugins follow a simple interface:

```typescript
interface Plugin {
  name: string
  install(player: Player, container: HTMLElement): () => void
}

const myPlugin = {
  name: 'myPlugin',

  install(player, container) {
    // Setup code
    console.log('Plugin installed')

    // Subscribe to events
    player.on('play', () => {
      console.log('Video started')
    })

    // Return cleanup function
    return () => {
      console.log('Plugin destroyed')
    }
  },
}

// Use the plugin
const player = createPlayer('#container', {
  src: '/video.mp4',
  plugins: [myPlugin],
})
```

## Plugin Lifecycle

1. **Install** - Called when player is created
2. **Active** - Plugin responds to player events
3. **Destroy** - Cleanup function called when player is destroyed

```typescript
const myPlugin = {
  name: 'myPlugin',

  install(player, container) {
    // 1. Install - setup UI, state, event listeners
    const element = document.createElement('div')
    container.appendChild(element)

    const handlePlay = () => console.log('Playing')
    player.on('play', handlePlay)

    // 2. Active - plugin is now responding to events

    // 3. Return cleanup function
    return () => {
      element.remove()
      player.off('play', handlePlay)
    }
  },
}
```

## Next Steps

- [Analytics Plugin](/plugins/analytics) - Track video engagement
- [Ads Plugin](/plugins/ads) - Monetize with ads
- [Skip Segments Plugin](/plugins/skip-segments) - Improve UX

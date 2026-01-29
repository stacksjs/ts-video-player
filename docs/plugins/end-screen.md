# End Screen Plugin

Show recommendations and autoplay next video.

## Installation

```typescript
import { createPlayer, endScreenPlugin } from 'ts-video-player'

const player = createPlayer('#container', {
  src: '/video.mp4',
  plugins: [
    endScreenPlugin({
      recommendations: [
        {
          id: 'video-2',
          title: 'Next Episode',
          thumbnail: '/thumb-2.jpg',
          duration: 2400,
          url: '/watch/video-2',
        },
      ],
      autoplayDelay: 10,
    }),
  ],
})
```

## Configuration

```typescript
endScreenPlugin({
  // Recommendations
  recommendations: [
    {
      id: 'video-2',
      title: 'Episode 2: The Journey Continues',
      description: 'Our heroes face new challenges...',
      thumbnail: '/thumbnails/ep2.jpg',
      duration: 2580, // Duration in seconds
      url: '/watch/episode-2',
      metadata: {
        season: 1,
        episode: 2,
      },
    },
    {
      id: 'video-3',
      title: 'Episode 3: Rising Action',
      thumbnail: '/thumbnails/ep3.jpg',
      duration: 2700,
      url: '/watch/episode-3',
    },
    // Up to 6 recommendations
  ],

  // Show end screen before video ends
  showBeforeEnd: 10, // Show 10 seconds before end

  // Autoplay settings
  autoplay: true,
  autoplayDelay: 10, // Countdown seconds

  // Show replay button
  showReplayButton: true,

  // Layout
  layout: 'grid', // 'grid' | 'list' | 'featured'
})
```

## Events

```typescript
// Recommendation clicked
player.endScreen.on('recommendationClick', (recommendation) => {
  console.log('Clicked:', recommendation.title)
  // Navigate to the video
  window.location.href = recommendation.url
})

// Replay clicked
player.endScreen.on('replay', () => {
  console.log('Replay clicked')
})

// Autoplay triggered
player.endScreen.on('autoplay', (recommendation) => {
  console.log('Autoplaying:', recommendation.title)
})

// Autoplay cancelled
player.endScreen.on('autoplayCancel', () => {
  console.log('Autoplay cancelled by user')
})
```

## API Methods

```typescript
// Show end screen manually
player.endScreen.show()

// Hide end screen
player.endScreen.hide()

// Update recommendations
player.endScreen.setRecommendations([
  { id: 'new-video', title: 'New Video', ... },
])

// Start autoplay countdown
player.endScreen.startAutoplay()

// Cancel autoplay
player.endScreen.cancelAutoplay()

// Get current state
const state = player.endScreen.getState()
// {
//   visible: true,
//   countdown: 5,
//   isAutoplayPending: true,
// }
```

## Recommendation Object

```typescript
interface EndScreenRecommendation {
  // Required
  id: string
  title: string
  thumbnail: string

  // Optional
  description?: string
  duration?: number      // Seconds
  url?: string
  metadata?: Record<string, unknown>
}
```

## Layout Options

### Grid Layout (Default)

Shows recommendations in a grid:

```typescript
endScreenPlugin({
  recommendations: [...],
  layout: 'grid',
})
```

### Featured Layout

Highlights first recommendation:

```typescript
endScreenPlugin({
  recommendations: [...],
  layout: 'featured',
})
```

### List Layout

Vertical list of recommendations:

```typescript
endScreenPlugin({
  recommendations: [...],
  layout: 'list',
})
```

## Autoplay Behavior

```typescript
endScreenPlugin({
  recommendations: [...],
  autoplay: true,
  autoplayDelay: 10, // 10 second countdown
})

// The first recommendation will autoplay after countdown
// User can cancel by clicking "Cancel" or interacting
```

## Dynamic Recommendations

Fetch recommendations dynamically:

```typescript
const player = createPlayer('#container', {
  src: '/video.mp4',
  plugins: [endScreenPlugin({ recommendations: [] })],
})

// Fetch and set recommendations
player.on('loadedmetadata', async () => {
  const response = await fetch(`/api/recommendations?videoId=${videoId}`)
  const recommendations = await response.json()
  player.endScreen.setRecommendations(recommendations)
})
```

## Styling

CSS classes for customization:

```css
.tsvp-end-screen {
  /* End screen container */
}

.tsvp-end-screen__title {
  /* "Up Next" title */
}

.tsvp-end-screen__grid {
  /* Recommendations grid */
}

.tsvp-end-screen__item {
  /* Individual recommendation */
}

.tsvp-end-screen__thumbnail {
  /* Thumbnail image */
}

.tsvp-end-screen__item-title {
  /* Recommendation title */
}

.tsvp-end-screen__replay {
  /* Replay button */
}

.tsvp-end-screen__autoplay {
  /* Autoplay countdown */
}
```

## Next Steps

- [Watermarks Plugin](/plugins/watermarks) - Add watermarks
- [Skip Segments Plugin](/plugins/skip-segments) - Skip content

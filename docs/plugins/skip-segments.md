# Skip Segments Plugin

Let users skip intro, outro, recap, and other segments.

## Installation

```typescript
import { createPlayer, skipSegmentsPlugin } from 'ts-video-player'

const player = createPlayer('#container', {
  src: '/video.mp4',
  plugins: [
    skipSegmentsPlugin({
      segments: [
        { type: 'intro', startTime: 0, endTime: 30 },
        { type: 'outro', startTime: 1200, endTime: 1260 },
      ],
    }),
  ],
})
```

## Configuration

```typescript
skipSegmentsPlugin({
  // Segments to skip
  segments: [
    {
      type: 'intro',
      startTime: 0,
      endTime: 30,
      buttonText: 'Skip Intro', // Optional custom text
      autoSkipDelay: 5, // Auto-skip after 5 seconds
      showCountdown: true,
    },
    {
      type: 'recap',
      startTime: 30,
      endTime: 90,
    },
    {
      type: 'outro',
      startTime: 1200,
      endTime: 1260,
    },
    {
      type: 'credits',
      startTime: 1260,
      endTime: 1320,
      skipTo: 0, // Skip to start for binge watching
    },
  ],

  // Button visibility duration (ms)
  buttonVisibleDuration: 10000,

  // Default auto-skip delay (0 = no auto-skip)
  defaultAutoSkipDelay: 0,

  // Button position
  buttonPosition: 'bottom-right', // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

  // Show markers on progress bar
  showMarkers: true,

  // Marker color
  markerColor: 'rgba(255, 255, 0, 0.8)',

  // Enable Enter key to skip
  keyboardShortcut: true,
})
```

## Segment Types

| Type | Default Button Text |
|------|---------------------|
| `intro` | "Skip Intro" |
| `outro` | "Skip Outro" |
| `recap` | "Skip Recap" |
| `preview` | "Skip Preview" |
| `credits` | "Skip Credits" |
| `sponsor` | "Skip" |
| `custom` | "Skip" |

## Events

```typescript
// Segment entered
player.skipSegments.on('segmentEnter', (segment) => {
  console.log('Entered segment:', segment.type)
})

// Segment exited
player.skipSegments.on('segmentExit', (segment) => {
  console.log('Exited segment:', segment.type)
})

// Segment skipped
player.skipSegments.on('skip', (segment) => {
  console.log('Skipped:', segment.type)
})
```

## API Methods

```typescript
// Skip current segment
player.skipSegments.skip()

// Add segment dynamically
player.skipSegments.addSegment({
  type: 'sponsor',
  startTime: 500,
  endTime: 530,
})

// Remove segments by type
player.skipSegments.removeSegment('intro')

// Clear all segments
player.skipSegments.clearSegments()

// Set new segments
player.skipSegments.setSegments([
  { type: 'intro', startTime: 0, endTime: 25 },
])

// Get all segments
const segments = player.skipSegments.getSegments()

// Get current state
const state = player.skipSegments.getState()
// {
//   activeSegment: { type: 'intro', ... },
//   buttonVisible: true,
//   countdown: 3,
//   isAutoSkipping: true,
// }
```

## Auto-Skip

Configure auto-skip with countdown:

```typescript
{
  type: 'intro',
  startTime: 0,
  endTime: 30,
  autoSkipDelay: 5,    // Start counting after 5 seconds
  showCountdown: true, // Show "Skip Intro (3)"
}
```

## Skip To Position

By default, skip goes to `endTime`. Override with `skipTo`:

```typescript
{
  type: 'credits',
  startTime: 1200,
  endTime: 1260,
  skipTo: 0, // Skip to beginning (for "Watch Again")
}
```

## Progress Bar Markers

When `showMarkers: true`, segments appear as colored regions on the progress bar:

```typescript
skipSegmentsPlugin({
  segments: [...],
  showMarkers: true,
  markerColor: 'rgba(255, 255, 0, 0.6)', // Yellow semi-transparent
})
```

## Keyboard Support

When a skip button is visible, press `Enter` to skip (if `keyboardShortcut: true`).

## Styling

The skip button uses these CSS classes:

```css
.tsvp-skip-button {
  /* Button styles */
}

.tsvp-skip-markers {
  /* Markers container */
}

.tsvp-skip-marker {
  /* Individual marker */
}
```

## Use Cases

### Netflix-style Skip Intro

```typescript
skipSegmentsPlugin({
  segments: [
    { type: 'intro', startTime: 0, endTime: 30, autoSkipDelay: 0 },
  ],
  buttonPosition: 'bottom-right',
})
```

### YouTube-style SponsorBlock

```typescript
skipSegmentsPlugin({
  segments: [
    { type: 'sponsor', startTime: 120, endTime: 150 },
    { type: 'sponsor', startTime: 500, endTime: 530 },
  ],
  showMarkers: true,
  markerColor: 'rgba(0, 255, 0, 0.5)',
})
```

## Next Steps

- [End Screen Plugin](/plugins/end-screen) - Recommendations
- [Analytics Plugin](/plugins/analytics) - Track skips

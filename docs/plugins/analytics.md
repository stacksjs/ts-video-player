# Analytics Plugin

Deep video analytics integration with ts-analytics.

## Installation

```typescript
import { createPlayer, analyticsPlugin } from 'ts-video-player'

const player = createPlayer('#container', {
  src: '/video.mp4',
  plugins: [
    analyticsPlugin({
      siteId: 'your-site-id',
      apiEndpoint: '/api/analytics/collect',
      videoId: 'video-123',
      videoTitle: 'My Video',
    }),
  ],
})
```

## Configuration

```typescript
analyticsPlugin({
  // Required
  siteId: 'your-site-id',
  apiEndpoint: '/api/analytics/collect',

  // Video identification
  videoId: 'video-123',
  videoTitle: 'Introduction Video',
  duration: 300, // Duration in seconds (auto-detected if not provided)

  // Content metadata
  contentType: 'episode',  // 'movie' | 'episode' | 'clip' | 'trailer' | 'live'
  category: 'tutorial',
  creatorId: 'creator-456',
  seriesId: 'series-789',
  season: 1,
  episode: 5,

  // Tracking options
  milestones: [25, 50, 75, 90],    // Percentage milestones
  heartbeatInterval: 30,           // Seconds between heartbeats
  trackQualityChanges: true,
  trackSeeking: true,
  trackBuffering: true,
  trackErrors: true,
  trackEngagement: true,

  // Custom properties sent with every event
  customProperties: {
    experiment: 'new-player-ui',
    userTier: 'premium',
  },

  // Visitor/session IDs (auto-generated if not provided)
  visitorId: 'visitor-abc',

  // Disable tracking
  disabled: false,
})
```

## Tracked Events

| Event | Description |
|-------|-------------|
| `video_start` | First play of the video |
| `video_play` | Any play event |
| `video_pause` | Video paused |
| `video_resume` | Video resumed after pause |
| `video_seek` | User seeked |
| `video_buffer_start` | Buffering started |
| `video_buffer_end` | Buffering ended |
| `video_quality_change` | Quality changed |
| `video_milestone` | Reached percentage milestone |
| `video_quartile` | Reached 25%, 50%, 75%, or 100% |
| `video_complete` | Video completed |
| `video_heartbeat` | Periodic heartbeat |
| `video_error` | Playback error |

## Manual Event Tracking

```typescript
// Track custom events
player.analytics.trackEvent('custom_event', {
  action: 'share',
  platform: 'twitter',
})

// Get analytics summary
const summary = player.analytics.getSummary()
console.log(summary)
// {
//   watchTime: 120,
//   seekCount: 3,
//   pauseCount: 2,
//   bufferCount: 1,
//   completedMilestones: [25, 50],
//   maxProgress: 67,
// }
```

## Event Payload

Events are sent to your analytics endpoint with this structure:

```typescript
{
  s: 'site-id',           // Site ID
  sid: 'session-id',      // Session ID
  vid: 'visitor-id',      // Visitor ID
  e: 'event',             // Event type
  u: 'https://...',       // Page URL
  p: {                    // Properties
    eventName: 'video_play',
    videoId: 'video-123',
    videoTitle: 'My Video',
    currentTime: 30.5,
    duration: 300,
    progress: 10.17,
    watchTime: 30,
    // ... more properties
  }
}
```

## Integration with ts-analytics

This plugin is designed to work with [ts-analytics](https://github.com/stacksjs/ts-analytics):

```typescript
// ts-analytics server receives events at /collect
// Events are batched and sent efficiently
```

## Detaching Analytics

```typescript
// Manually detach (automatically called on player.destroy())
player.analytics.detach()
```

## Events

Listen to analytics events:

```typescript
player.on('analytics:event', (event) => {
  console.log('Analytics event:', event.name, event.properties)
})
```

## Best Practices

1. **Set video metadata** - Always provide `videoId` and `videoTitle`
2. **Use meaningful milestones** - Default `[25, 50, 75, 90]` works well
3. **Adjust heartbeat** - 30s is good for long content, shorter for clips
4. **Track quality changes** - Helps identify streaming issues
5. **Include custom properties** - Add A/B test data, user segments

## Next Steps

- [Ads Plugin](/plugins/ads) - Monetize with ads
- [API Reference](/api/player) - Full API documentation

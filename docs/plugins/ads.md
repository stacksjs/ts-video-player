# Ads Plugin

VAST/VPAID ad support for video monetization.

## Installation

```typescript
import { createPlayer, adsPlugin } from 'ts-video-player'

const player = createPlayer('#container', {
  src: '/video.mp4',
  plugins: [
    adsPlugin({
      adBreaks: [
        {
          type: 'preroll',
          vastUrl: 'https://ads.example.com/vast.xml',
        },
      ],
    }),
  ],
})
```

## Configuration

```typescript
adsPlugin({
  // Ad breaks
  adBreaks: [
    {
      type: 'preroll',
      vastUrl: 'https://ads.example.com/preroll.xml',
    },
    {
      type: 'midroll',
      time: 300, // 5 minutes into video
      vastUrl: 'https://ads.example.com/midroll.xml',
    },
    {
      type: 'midroll',
      time: 600, // 10 minutes
      vastUrl: 'https://ads.example.com/midroll2.xml',
    },
    {
      type: 'postroll',
      vastUrl: 'https://ads.example.com/postroll.xml',
    },
  ],

  // Skip settings
  skipDelay: 5, // Show skip button after 5 seconds

  // VAST settings
  maxRedirects: 5, // Max VAST wrapper redirects
  timeout: 10000,  // VAST request timeout (ms)

  // VPAID (experimental)
  vpaidEnabled: false,

  // Preload ads
  preloadAds: true,

  // Debug mode
  debug: false,
})
```

## Ad Break Types

### Preroll

Plays before the main content:

```typescript
{
  type: 'preroll',
  vastUrl: 'https://ads.example.com/preroll.xml',
}
```

### Midroll

Plays at a specific time:

```typescript
{
  type: 'midroll',
  time: 300, // Time in seconds
  vastUrl: 'https://ads.example.com/midroll.xml',
}
```

### Postroll

Plays after the main content:

```typescript
{
  type: 'postroll',
  vastUrl: 'https://ads.example.com/postroll.xml',
}
```

## VAST Support

The plugin supports VAST 2.0, 3.0, and 4.0/4.1:

- Linear ads (video)
- Wrapper/redirect ads
- Tracking events
- Click-through URLs
- Skip offset

## Events

```typescript
// Ad started
player.ads.on('adStart', (ad) => {
  console.log('Ad started:', ad.title)
})

// Ad completed
player.ads.on('adComplete', (ad) => {
  console.log('Ad completed:', ad.title)
})

// Ad skipped
player.ads.on('adSkip', (ad) => {
  console.log('Ad skipped:', ad.title)
})

// Ad clicked
player.ads.on('adClick', (ad) => {
  console.log('Ad clicked:', ad.clickThroughUrl)
})

// Ad error
player.ads.on('adError', (error) => {
  console.error('Ad error:', error)
})

// All ads in break completed
player.ads.on('allAdsComplete', () => {
  console.log('All ads complete, resuming content')
})
```

## API Methods

```typescript
// Skip current ad (if allowed)
player.ads.skip()

// Get current state
const state = player.ads.getState()
// {
//   isPlaying: true,
//   isLoading: false,
//   currentAd: { ... },
//   currentBreak: { ... },
//   timeRemaining: 15,
//   canSkip: true,
// }

// Add ad break dynamically
player.ads.addBreak({
  type: 'midroll',
  time: 900,
  vastUrl: 'https://ads.example.com/midroll3.xml',
})

// Remove ad break
player.ads.removeBreak('midroll', 300)
```

## VAST Parsing

You can also parse VAST directly:

```typescript
import { VASTParser } from 'ts-video-player'

const parser = new VASTParser({
  maxRedirects: 5,
  timeout: 10000,
})

// From URL
const ads = await parser.parseFromUrl('https://ads.example.com/vast.xml')

// From XML string
const ads = parser.parseFromXml(vastXmlString)
```

## Ad UI

The plugin creates an ad overlay with:

- Ad video player
- "Ad" label
- Skip button (after skipDelay)
- Click-through area
- Remaining time

## Tracking Events

The plugin automatically sends VAST tracking events:

- `impression`
- `start`
- `firstQuartile`
- `midpoint`
- `thirdQuartile`
- `complete`
- `skip`
- `clickThrough`
- `error`

## Best Practices

1. **Use preloading** - Set `preloadAds: true` for faster ad starts
2. **Handle errors gracefully** - Always listen to `adError`
3. **Reasonable skip delay** - 5 seconds is industry standard
4. **Limit midrolls** - Don't interrupt content too often
5. **Test VAST tags** - Validate your VAST XML

## Next Steps

- [Skip Segments Plugin](/plugins/skip-segments) - Skip content segments
- [Analytics Plugin](/plugins/analytics) - Track ad performance

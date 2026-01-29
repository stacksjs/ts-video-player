# YouTube Provider

Embed YouTube videos with full player controls.

## Basic Usage

```typescript
import { createPlayer } from 'ts-video-player'

// Using full URL
const player = createPlayer('#container', {
  src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
})

// Using short URL
const player = createPlayer('#container', {
  src: 'https://youtu.be/dQw4w9WgXcQ',
})

// Using video ID
const player = createPlayer('#container', {
  src: {
    src: 'dQw4w9WgXcQ',
    provider: 'youtube',
  },
})
```

## Configuration

```typescript
const player = createPlayer('#container', {
  src: 'https://youtube.com/watch?v=dQw4w9WgXcQ',

  youtube: {
    // Hide related videos at end
    showRelated: false,

    // Hide video info (title, uploader)
    showInfo: false,

    // Use modest branding
    modestBranding: true,

    // Start time in seconds
    start: 30,

    // End time in seconds
    end: 120,

    // Enable JavaScript API
    enableJsApi: true,

    // Player controls (0 = hide, 1 = show, 2 = show after play)
    controls: 1,

    // Disable keyboard controls from iframe
    disableKeyboard: false,

    // Show fullscreen button
    fullscreen: true,

    // Force high definition
    hd: false,

    // Interface language (ISO 639-1)
    hl: 'en',

    // Captions language
    ccLangPref: 'en',

    // Show closed captions by default
    ccLoadPolicy: false,

    // Color of progress bar ('red' or 'white')
    color: 'red',

    // Enable privacy-enhanced mode
    noCookie: true,

    // Origin for postMessage
    origin: window.location.origin,
  },
})
```

## Quality Selection

YouTube handles quality selection internally, but you can access available qualities:

```typescript
// Get available qualities
const qualities = player.state.qualities

// Request a quality (YouTube may override based on conditions)
player.setQuality('hd1080')
```

## Supported URL Formats

The player automatically detects YouTube URLs:

```typescript
// All these formats work:
'https://www.youtube.com/watch?v=VIDEO_ID'
'https://youtube.com/watch?v=VIDEO_ID'
'https://youtu.be/VIDEO_ID'
'https://www.youtube.com/embed/VIDEO_ID'
'https://youtube.com/v/VIDEO_ID'
```

## Feature Detection

```typescript
import { isYouTubeSource, extractYouTubeId } from 'ts-video-player'

isYouTubeSource('https://youtube.com/watch?v=abc123') // true
extractYouTubeId('https://youtube.com/watch?v=abc123') // 'abc123'
```

## Limitations

- Picture-in-Picture not supported (YouTube restriction)
- Some keyboard shortcuts handled by YouTube iframe
- Quality selection is advisory only
- Ads may be shown (YouTube's ad policy)

## Privacy Mode

Use YouTube's privacy-enhanced mode:

```typescript
const player = createPlayer('#container', {
  src: 'https://youtube.com/watch?v=abc123',
  youtube: {
    noCookie: true, // Uses youtube-nocookie.com
  },
})
```

## Events

YouTube-specific events:

```typescript
player.on('qualitychange', (quality) => {
  console.log('YouTube quality changed:', quality)
})

player.on('statechange', (state) => {
  // YouTube player state: -1, 0, 1, 2, 3, 5
  console.log('YouTube state:', state)
})
```

## Next Steps

- [Vimeo Provider](/providers/vimeo) - Embed Vimeo videos
- [HLS Provider](/providers/hls) - Adaptive streaming

# Video Directive

Use the `@video` directive in your stx templates.

## Basic Usage

```html
@video('/video.mp4')
```

## With Options

```html
@video('/video.mp4', {
  poster: '/poster.jpg',
  controls: true,
  autoplay: false,
  muted: false,
  loop: false,
})
```

## Full Example

```html
@video('/video.mp4', {
  poster: '/poster.jpg',
  controls: true,
  theme: 'netflix',
  captions: [
    { label: 'English', src: '/en.vtt', default: true },
    { label: 'Spanish', src: '/es.vtt' },
  ],
  chapters: '/chapters.vtt',
  thumbnails: '/thumbnails.vtt',
})
```

## YouTube

```html
@video('https://youtube.com/watch?v=dQw4w9WgXcQ', {
  youtube: {
    showRelated: false,
    modestBranding: true,
  },
})
```

## Vimeo

```html
@video('https://vimeo.com/123456789', {
  vimeo: {
    color: 'ff0000',
    byline: false,
  },
})
```

## HLS Streaming

```html
@video('https://example.com/stream.m3u8', {
  hls: {
    maxBufferLength: 30,
  },
})
```

## With Plugins

```html
@video('/video.mp4', {
  plugins: {
    analytics: {
      siteId: 'your-site-id',
      apiEndpoint: '/api/analytics',
      videoId: 'video-123',
    },
    skipSegments: {
      segments: [
        { type: 'intro', startTime: 0, endTime: 30 },
      ],
    },
  },
})
```

## Directive Options

| Option | Type | Description |
|--------|------|-------------|
| `poster` | `string` | Poster image URL |
| `controls` | `boolean` | Show controls |
| `autoplay` | `boolean` | Auto-start playback |
| `muted` | `boolean` | Start muted |
| `loop` | `boolean` | Loop playback |
| `theme` | `string` | Theme name |
| `captions` | `array` | Text tracks |
| `chapters` | `string` | Chapters VTT URL |
| `thumbnails` | `string` | Thumbnails VTT URL |
| `youtube` | `object` | YouTube options |
| `vimeo` | `object` | Vimeo options |
| `hls` | `object` | HLS options |
| `dash` | `object` | DASH options |
| `plugins` | `object` | Plugin configurations |

## Registering the Directive

In your stx configuration:

```typescript
import { registerVideoDirectives } from 'ts-video-player'

// In your stx config
export default {
  customDirectives: [
    ...registerVideoDirectives(),
  ],
}
```

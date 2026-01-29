# Providers Overview

ts-video-player supports multiple video sources through a provider system.

## Supported Providers

| Provider | Description | Auto-detected |
|----------|-------------|---------------|
| [HTML5](/providers/html5) | Native HTML5 video | Yes |
| [YouTube](/providers/youtube) | YouTube embeds | Yes |
| [Vimeo](/providers/vimeo) | Vimeo embeds | Yes |
| [HLS](/providers/hls) | HTTP Live Streaming | Yes |
| [DASH](/providers/dash) | MPEG-DASH streaming | Yes |

## Automatic Detection

The player automatically detects the appropriate provider based on the source URL:

```typescript
// HTML5 - detected by file extension
createPlayer('#container', { src: '/video.mp4' })

// YouTube - detected by URL
createPlayer('#container', { src: 'https://youtube.com/watch?v=abc123' })

// Vimeo - detected by URL
createPlayer('#container', { src: 'https://vimeo.com/123456789' })

// HLS - detected by .m3u8 extension
createPlayer('#container', { src: 'https://example.com/stream.m3u8' })

// DASH - detected by .mpd extension
createPlayer('#container', { src: 'https://example.com/manifest.mpd' })
```

## Manual Provider Selection

You can explicitly specify the provider:

```typescript
createPlayer('#container', {
  src: {
    src: 'https://example.com/video',
    type: 'video/mp4',
    provider: 'html5',
  },
})
```

## Provider Capabilities

| Feature | HTML5 | YouTube | Vimeo | HLS | DASH |
|---------|-------|---------|-------|-----|------|
| Quality selection | Limited | Yes | Yes | Yes | Yes |
| Playback rate | Yes | Yes | Yes | Yes | Yes |
| Captions | Yes | Yes | Yes | Yes | Yes |
| Picture-in-Picture | Yes | No | No | Yes | Yes |
| Fullscreen | Yes | Yes | Yes | Yes | Yes |
| Live streaming | Limited | Yes | Yes | Yes | Yes |
| DRM | No | N/A | N/A | Yes* | Yes* |

*Requires additional configuration

## Custom Providers

You can create custom providers by extending the base provider:

```typescript
import { BaseProvider, type Provider } from 'ts-video-player'

class CustomProvider extends BaseProvider implements Provider {
  // Implement required methods
}
```

## Next Steps

- [HTML5 Provider](/providers/html5) - Native video
- [YouTube Provider](/providers/youtube) - YouTube embeds
- [HLS Provider](/providers/hls) - Adaptive streaming

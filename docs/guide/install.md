# Installation

Install ts-video-player using your preferred package manager.

## Package Managers

::: code-group

```sh [bun]
bun add ts-video-player
```

```sh [npm]
npm install ts-video-player
```

```sh [pnpm]
pnpm add ts-video-player
```

```sh [yarn]
yarn add ts-video-player
```

:::

## CDN Usage

You can also use ts-video-player directly from a CDN:

```html
<script src="https://unpkg.com/ts-video-player/dist/index.js"></script>
<link rel="stylesheet" href="https://unpkg.com/ts-video-player/dist/styles/player.css">

<script>
  const player = TSVideoPlayer.createPlayer('#video-container', {
    src: 'https://example.com/video.mp4',
  })
</script>
```

## TypeScript

ts-video-player is written in TypeScript and includes type definitions out of the box. No additional `@types` package is needed.

```typescript
import { createPlayer, type PlayerOptions } from 'ts-video-player'

const options: PlayerOptions = {
  src: '/video.mp4',
  autoplay: false,
}

const player = createPlayer('#container', options)
```

## Peer Dependencies

ts-video-player has an optional peer dependency on `stx` for template integration:

```json
{
  "peerDependencies": {
    "stx": ">=0.65.0"
  },
  "peerDependenciesMeta": {
    "stx": {
      "optional": true
    }
  }
}
```

If you're not using stx, you can safely ignore this peer dependency warning.

## Next Steps

- [Quick Start](/guide/usage) - Create your first player
- [Configuration](/guide/config) - Configure player options

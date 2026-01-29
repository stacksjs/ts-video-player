# Thumbnails

Show seek preview thumbnails on the progress bar.

## Basic Usage

```typescript
import { createPlayer, createThumbnails } from 'ts-video-player'

const player = createPlayer('#container', { src: '/video.mp4' })

const thumbnails = createThumbnails({
  src: '/thumbnails.vtt',
})

thumbnails.attach(player)
```

## VTT Format

Thumbnails use WebVTT format with image references:

```vtt
WEBVTT

00:00:00.000 --> 00:00:05.000
/thumbnails/sprite.jpg#xywh=0,0,160,90

00:00:05.000 --> 00:00:10.000
/thumbnails/sprite.jpg#xywh=160,0,160,90

00:00:10.000 --> 00:00:15.000
/thumbnails/sprite.jpg#xywh=320,0,160,90
```

## Sprite Sheets

Use sprite sheets for efficient loading:

```typescript
import { generateSpriteCues } from 'ts-video-player'

// Generate cues from sprite sheet
const cues = generateSpriteCues({
  src: '/thumbnails/sprite.jpg',
  width: 160,
  height: 90,
  columns: 10,
  rows: 10,
  interval: 5, // One thumbnail every 5 seconds
  duration: 500, // Video duration
})
```

## Configuration

```typescript
const thumbnails = createThumbnails({
  // VTT file with thumbnail cues
  src: '/thumbnails.vtt',

  // Or sprite sheet config
  sprite: {
    src: '/thumbnails/sprite.jpg',
    width: 160,
    height: 90,
    columns: 10,
    rows: 10,
    interval: 5,
  },

  // Display options
  width: 160,
  height: 90,
  offset: 10, // Offset from progress bar
})
```

## API Methods

```typescript
// Get thumbnail at time
const thumbnail = thumbnails.getThumbnailAt(30) // At 30 seconds
// { src: '/sprite.jpg', x: 160, y: 0, width: 160, height: 90 }

// Show thumbnail preview
thumbnails.show(30)

// Hide thumbnail preview
thumbnails.hide()
```

## Generating Thumbnails

Use FFmpeg to generate thumbnail sprites:

```bash
# Generate thumbnails every 5 seconds
ffmpeg -i video.mp4 -vf "fps=1/5,scale=160:90,tile=10x10" sprite.jpg

# Generate VTT file
# (Use a script to generate the VTT from the sprite)
```

## Events

```typescript
thumbnails.on('show', (time, thumbnail) => {
  console.log('Showing thumbnail at', time)
})

thumbnails.on('hide', () => {
  console.log('Thumbnail hidden')
})
```

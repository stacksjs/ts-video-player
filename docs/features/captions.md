# Captions & Subtitles

Add captions and subtitles to your videos using WebVTT format.

## Basic Usage

```typescript
const player = createPlayer('#container', {
  src: '/video.mp4',
  textTracks: [
    {
      kind: 'subtitles',
      label: 'English',
      srclang: 'en',
      src: '/captions-en.vtt',
      default: true,
    },
    {
      kind: 'subtitles',
      label: 'Spanish',
      srclang: 'es',
      src: '/captions-es.vtt',
    },
  ],
})
```

## Track Types

| Kind | Description |
|------|-------------|
| `subtitles` | Translation of dialogue |
| `captions` | Includes sound effects (for deaf/hard-of-hearing) |
| `descriptions` | Audio descriptions for blind users |
| `chapters` | Chapter markers |
| `metadata` | Metadata for scripts |

## WebVTT Format

```vtt
WEBVTT

00:00:00.000 --> 00:00:03.000
Welcome to the video tutorial.

00:00:03.500 --> 00:00:07.000
Today we'll learn about video players.

00:00:08.000 --> 00:00:12.000
<v Speaker>Let's get started!</v>
```

## Controlling Captions

```typescript
// Get available text tracks
const tracks = player.state.textTracks

// Enable a track
player.setTextTrack(tracks[0].id)

// Disable captions
player.setTextTrack(null)

// Toggle captions
player.toggleCaptions()
```

## Caption Styling

Customize caption appearance:

```typescript
import { createPlayer, createCaptionStyleManager } from 'ts-video-player'

const player = createPlayer('#container', { src: '/video.mp4' })

const styleManager = createCaptionStyleManager(player.el)

styleManager.setStyle({
  fontFamily: 'Arial',
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#ffffff',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
  edgeStyle: 'dropshadow',
})
```

## Caption Presets

```typescript
import { captionPresets } from 'ts-video-player'

// Available presets
styleManager.setStyle(captionPresets.default)
styleManager.setStyle(captionPresets.largeText)
styleManager.setStyle(captionPresets.highContrast)
styleManager.setStyle(captionPresets.yellowOnBlack)
```

## Caption Settings Menu

Add a settings menu for user customization:

```typescript
import { createCaptionSettingsMenu } from 'ts-video-player'

const menu = createCaptionSettingsMenu(player.el, styleManager)
menu.show()
```

## Events

```typescript
player.on('texttrackchange', (track) => {
  if (track) {
    console.log('Captions enabled:', track.label)
  } else {
    console.log('Captions disabled')
  }
})

player.on('cuechange', (cues) => {
  console.log('Active cues:', cues)
})
```

## Multiple Languages

```typescript
const player = createPlayer('#container', {
  src: '/video.mp4',
  textTracks: [
    { kind: 'subtitles', label: 'English', srclang: 'en', src: '/en.vtt', default: true },
    { kind: 'subtitles', label: 'Spanish', srclang: 'es', src: '/es.vtt' },
    { kind: 'subtitles', label: 'French', srclang: 'fr', src: '/fr.vtt' },
    { kind: 'subtitles', label: 'German', srclang: 'de', src: '/de.vtt' },
    { kind: 'subtitles', label: 'Japanese', srclang: 'ja', src: '/ja.vtt' },
    { kind: 'subtitles', label: 'Chinese', srclang: 'zh', src: '/zh.vtt' },
  ],
})
```

## Styling Options

| Property | Description |
|----------|-------------|
| `fontFamily` | Font family |
| `fontSize` | Font size |
| `fontWeight` | Font weight |
| `color` | Text color |
| `backgroundColor` | Background color |
| `textShadow` | Text shadow |
| `edgeStyle` | Edge style (none, dropshadow, raised, depressed, uniform) |
| `opacity` | Background opacity |

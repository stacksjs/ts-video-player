# Chapters

Add chapter markers to your videos for easy navigation.

## Basic Usage

```typescript
import { createPlayer, createChaptersManager } from 'ts-video-player'

const player = createPlayer('#container', {
  src: '/video.mp4',
  textTracks: [
    {
      kind: 'chapters',
      label: 'Chapters',
      srclang: 'en',
      src: '/chapters.vtt',
    },
  ],
})

const chapters = createChaptersManager({
  src: '/chapters.vtt',
})

chapters.attach(player, player.el)
```

## VTT Format

```vtt
WEBVTT

00:00:00.000 --> 00:02:30.000
Introduction

00:02:30.000 --> 00:08:00.000
Chapter 1: Getting Started

00:08:00.000 --> 00:15:00.000
Chapter 2: Core Concepts

00:15:00.000 --> 00:25:00.000
Chapter 3: Advanced Topics

00:25:00.000 --> 00:30:00.000
Conclusion
```

## Configuration

```typescript
const chapters = createChaptersManager({
  // VTT file
  src: '/chapters.vtt',

  // Or inline chapters
  chapters: [
    { title: 'Introduction', startTime: 0, endTime: 150 },
    { title: 'Chapter 1', startTime: 150, endTime: 480 },
    { title: 'Chapter 2', startTime: 480, endTime: 900 },
  ],

  // Show markers on progress bar
  showMarkers: true,

  // Marker style
  markerColor: 'rgba(255, 255, 255, 0.8)',
})
```

## Chapter Menu

Create a chapter selection menu:

```typescript
import { createChapterMenu } from 'ts-video-player'

const menu = createChapterMenu(chapters, player.el)

// Show menu
menu.show()

// Hide menu
menu.hide()
```

## API Methods

```typescript
// Get all chapters
const allChapters = chapters.getChapters()

// Get current chapter
const current = chapters.getCurrentChapter()

// Navigate to chapter
chapters.goToChapter(2) // Go to chapter index 2

// Get chapter at time
const chapter = chapters.getChapterAt(300) // At 5 minutes
```

## Events

```typescript
chapters.on('chapterChange', (chapter) => {
  console.log('Now playing:', chapter.title)
})
```

## Progress Bar Markers

Chapters automatically add markers to the progress bar:

```typescript
const chapters = createChaptersManager({
  src: '/chapters.vtt',
  showMarkers: true,
  markerColor: 'rgba(255, 255, 255, 0.5)',
})
```

## Thumbnail Support

Combine chapters with thumbnails:

```vtt
WEBVTT

00:00:00.000 --> 00:02:30.000
Introduction
NOTE thumbnail:/thumbs/intro.jpg

00:02:30.000 --> 00:08:00.000
Chapter 1: Getting Started
NOTE thumbnail:/thumbs/chapter1.jpg
```

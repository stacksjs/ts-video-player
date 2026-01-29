# Video Components

Use ts-video-player as stx components.

## VideoPlayer Component

Create a reusable video player component:

```html
<!-- components/VideoPlayer.stx -->
<script>
export const src = ''
export const poster = ''
export const autoplay = false
</script>

<div class="video-wrapper">
  @video(src, {
    poster,
    autoplay,
    controls: true,
  })
</div>

<style>
.video-wrapper {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}
</style>
```

Usage:

```html
<VideoPlayer
  src="/video.mp4"
  poster="/poster.jpg"
/>
```

## VideoGallery Component

```html
<!-- components/VideoGallery.stx -->
<script>
export const videos = []
</script>

<div class="video-gallery">
  @foreach(videos as video)
    <div class="video-item">
      @video(video.src, {
        poster: video.poster,
        controls: true,
      })
      <h3>{{ video.title }}</h3>
    </div>
  @endforeach
</div>
```

## VideoWithTranscript Component

```html
<!-- components/VideoWithTranscript.stx -->
<script>
export const src = ''
export const captions = []
export const transcript = ''
</script>

<div class="video-transcript-layout">
  <div class="video-container">
    @video(src, {
      captions,
      controls: true,
    })
  </div>
  <div class="transcript">
    <h3>Transcript</h3>
    <div class="transcript-content">
      {{ transcript }}
    </div>
  </div>
</div>
```

## HeroVideo Component

```html
<!-- components/HeroVideo.stx -->
<script>
export const src = ''
export const title = ''
export const subtitle = ''
</script>

<section class="hero-video">
  @video(src, {
    autoplay: true,
    muted: true,
    loop: true,
    controls: false,
  })
  <div class="hero-overlay">
    <h1>{{ title }}</h1>
    <p>{{ subtitle }}</p>
  </div>
</section>

<style>
.hero-video {
  position: relative;
  width: 100%;
  height: 100vh;
}

.hero-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
}
</style>
```

## Integration with Layouts

```html
<!-- layouts/VideoPage.stx -->
<script>
export const video = {}
</script>

<!DOCTYPE html>
<html>
<head>
  <title>{{ video.title }}</title>
</head>
<body>
  <main>
    @video(video.src, {
      poster: video.poster,
      captions: video.captions,
      theme: 'netflix',
    })

    <article>
      @slot
    </article>
  </main>
</body>
</html>
```

Usage:

```html
@extends('layouts/VideoPage', {
  video: {
    src: '/video.mp4',
    title: 'My Video',
    poster: '/poster.jpg',
  },
})

@section('default')
  <h1>Video Description</h1>
  <p>This is the video description...</p>
@endsection
```

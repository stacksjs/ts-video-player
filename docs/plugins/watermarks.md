# Watermarks Plugin

Add static and dynamic watermarks to videos.

## Installation

```typescript
import { createPlayer, watermarkPlugin } from 'ts-video-player'

const player = createPlayer('#container', {
  src: '/video.mp4',
  plugins: [
    watermarkPlugin([
      {
        id: 'logo',
        image: '/logo.png',
        position: 'top-right',
        opacity: 0.7,
      },
    ]),
  ],
})
```

## Configuration

### Image Watermark

```typescript
watermarkPlugin([
  {
    id: 'logo',
    image: '/logo.png',
    position: 'top-right',
    opacity: 0.7,
    size: '100px',
    offset: { x: 16, y: 16 },
    url: 'https://example.com', // Click-through
    newTab: true,
  },
])
```

### Text Watermark

```typescript
watermarkPlugin([
  {
    id: 'copyright',
    text: '© 2024 Company Name',
    position: 'bottom-left',
    opacity: 0.5,
    size: '14px',
  },
])
```

### HTML Watermark

```typescript
watermarkPlugin([
  {
    id: 'custom',
    html: '<div class="custom-watermark">Custom HTML</div>',
    position: 'center',
  },
])
```

## Watermark Options

```typescript
interface WatermarkConfig {
  // Content (one of these)
  image?: string
  text?: string
  html?: string

  // Position
  position?: WatermarkPosition
  offset?: { x?: number | string; y?: number | string }

  // Appearance
  opacity?: number      // 0-1
  size?: string         // CSS size
  rotate?: number       // Degrees

  // Behavior
  url?: string          // Click-through URL
  newTab?: boolean      // Open in new tab
  showOnlyDuringPlayback?: boolean

  // Animation
  fadeIn?: number       // ms
  fadeOut?: number      // ms
  animation?: {
    type: 'fade' | 'slide' | 'bounce' | 'pulse' | 'none'
    duration?: number
    delay?: number
    repeat?: boolean
  }

  // Custom styles
  styles?: Partial<CSSStyleDeclaration>
}
```

## Position Options

| Position | Description |
|----------|-------------|
| `top-left` | Top left corner |
| `top-center` | Top center |
| `top-right` | Top right corner |
| `center-left` | Center left |
| `center` | Center |
| `center-right` | Center right |
| `bottom-left` | Bottom left corner |
| `bottom-center` | Bottom center |
| `bottom-right` | Bottom right corner |

## Dynamic Watermarks

For forensic marking (user identification):

```typescript
// Add dynamic watermark
player.watermark.addDynamic('forensic', {
  userId: 'user-123',
  showTimestamp: true,
  customText: 'Confidential',
  updateInterval: 30000,      // Update text every 30s
  randomizePosition: true,    // Move around
  moveInterval: 60000,        // Move every 60s
}, {
  opacity: 0.3,
  size: '12px',
})
```

## API Methods

```typescript
// Add watermark
player.watermark.add('logo', {
  image: '/logo.png',
  position: 'top-right',
})

// Remove watermark
player.watermark.remove('logo')

// Remove all watermarks
player.watermark.removeAll()

// Update watermark
player.watermark.update('logo', {
  opacity: 0.5,
  position: 'bottom-right',
})

// Show/hide watermark
player.watermark.show('logo')
player.watermark.hide('logo')

// Show/hide all
player.watermark.showAll()
player.watermark.hideAll()

// Get watermark element
const element = player.watermark.get('logo')

// Get all watermark IDs
const ids = player.watermark.getAll() // ['logo', 'copyright']
```

## Playback-Only Watermarks

Show watermark only during playback:

```typescript
watermarkPlugin([
  {
    id: 'logo',
    image: '/logo.png',
    position: 'top-right',
    showOnlyDuringPlayback: true, // Hides when paused
    fadeIn: 300,
    fadeOut: 300,
  },
])
```

## Animated Watermarks

```typescript
watermarkPlugin([
  {
    id: 'promo',
    text: 'Special Offer!',
    position: 'top-center',
    animation: {
      type: 'pulse',
      duration: 1000,
      repeat: true,
    },
  },
])
```

Animation types:
- `fade` - Fades in and out
- `slide` - Slides left and right
- `bounce` - Bounces up and down
- `pulse` - Scales up and down
- `none` - No animation

## Styling

```css
.tsvp-watermark {
  /* Watermark container */
}

.tsvp-watermark img {
  /* Watermark image */
}

.tsvp-watermark span {
  /* Watermark text */
}
```

## Use Cases

### Brand Logo

```typescript
watermarkPlugin([
  {
    id: 'brand',
    image: '/brand-logo.png',
    position: 'top-right',
    opacity: 0.8,
    size: '80px',
    offset: { x: 20, y: 20 },
  },
])
```

### User Identification (Anti-Piracy)

```typescript
player.watermark.addDynamic('user', {
  userId: currentUser.id,
  showTimestamp: true,
  randomizePosition: true,
  moveInterval: 30000,
}, {
  opacity: 0.2,
  size: '10px',
})
```

### Promotional Overlay

```typescript
watermarkPlugin([
  {
    id: 'promo',
    html: '<a href="/upgrade" class="promo-banner">Upgrade to Premium</a>',
    position: 'bottom-center',
    offset: { y: 60 },
    showOnlyDuringPlayback: true,
  },
])
```

## Next Steps

- [Analytics Plugin](/plugins/analytics) - Track engagement
- [End Screen Plugin](/plugins/end-screen) - Recommendations

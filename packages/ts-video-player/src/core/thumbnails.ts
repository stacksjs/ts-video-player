/**
 * Thumbnail Sprites / Seek Preview
 *
 * Provides thumbnail preview functionality during seeking.
 *
 * @module core/thumbnails
 */

// =============================================================================
// Types
// =============================================================================

export interface ThumbnailSprite {
  /** URL to the sprite image */
  url: string
  /** Width of each thumbnail in pixels */
  width: number
  /** Height of each thumbnail in pixels */
  height: number
  /** Number of columns in the sprite */
  cols: number
  /** Number of rows in the sprite */
  rows: number
  /** Duration each thumbnail represents in seconds */
  interval: number
  /** Starting time offset in seconds */
  startTime?: number
}

export interface ThumbnailCue {
  /** Start time in seconds */
  startTime: number
  /** End time in seconds */
  endTime: number
  /** URL to the thumbnail image (or sprite) */
  url: string
  /** X position in sprite (if using sprite) */
  x?: number
  /** Y position in sprite (if using sprite) */
  y?: number
  /** Width of thumbnail */
  width: number
  /** Height of thumbnail */
  height: number
}

export interface ThumbnailsConfig {
  /** Source for thumbnails - URL to VTT file or sprite config */
  src?: string | ThumbnailSprite | ThumbnailCue[]
  /** Whether to preload thumbnail images */
  preload?: boolean
  /** Custom thumbnail renderer */
  renderer?: (cue: ThumbnailCue, container: HTMLElement) => void
}

// =============================================================================
// VTT Thumbnail Parser
// =============================================================================

/**
 * Parse a WebVTT file containing thumbnail cues
 *
 * VTT format for thumbnails:
 * ```
 * WEBVTT
 *
 * 00:00:00.000 --> 00:00:05.000
 * sprite.jpg#xywh=0,0,160,90
 *
 * 00:00:05.000 --> 00:00:10.000
 * sprite.jpg#xywh=160,0,160,90
 * ```
 */
export async function parseThumbnailVTT(url: string): Promise<ThumbnailCue[]> {
  const response = await fetch(url)
  const text = await response.text()

  const cues: ThumbnailCue[] = []
  const lines = text.split('\n')

  let i = 0

  // Skip WEBVTT header
  while (i < lines.length && !lines[i].includes('-->')) {
    i++
  }

  // Parse cues
  while (i < lines.length) {
    const line = lines[i].trim()

    // Find timestamp line
    if (line.includes('-->')) {
      const [startStr, endStr] = line.split('-->')
      const startTime = parseVTTTime(startStr.trim())
      const endTime = parseVTTTime(endStr.trim())

      // Next line should be the thumbnail URL
      i++
      if (i < lines.length) {
        const urlLine = lines[i].trim()
        if (urlLine) {
          const cue = parseThumbnailUrl(urlLine, startTime, endTime)
          if (cue) {
            cues.push(cue)
          }
        }
      }
    }

    i++
  }

  return cues
}

/**
 * Parse VTT timestamp to seconds
 */
function parseVTTTime(timeStr: string): number {
  const parts = timeStr.split(':')
  let seconds = 0

  if (parts.length === 3) {
    // HH:MM:SS.mmm
    seconds += Number.parseFloat(parts[0]) * 3600
    seconds += Number.parseFloat(parts[1]) * 60
    seconds += Number.parseFloat(parts[2])
  }
  else if (parts.length === 2) {
    // MM:SS.mmm
    seconds += Number.parseFloat(parts[0]) * 60
    seconds += Number.parseFloat(parts[1])
  }

  return seconds
}

/**
 * Parse thumbnail URL with optional sprite coordinates
 */
function parseThumbnailUrl(urlLine: string, startTime: number, endTime: number): ThumbnailCue | null {
  // Check for xywh fragment
  const xywhMatch = urlLine.match(/(.+)#xywh=(\d+),(\d+),(\d+),(\d+)/)

  if (xywhMatch) {
    return {
      startTime,
      endTime,
      url: xywhMatch[1],
      x: Number.parseInt(xywhMatch[2], 10),
      y: Number.parseInt(xywhMatch[3], 10),
      width: Number.parseInt(xywhMatch[4], 10),
      height: Number.parseInt(xywhMatch[5], 10),
    }
  }

  // Plain URL - try to extract dimensions from filename or use defaults
  return {
    startTime,
    endTime,
    url: urlLine,
    width: 160,
    height: 90,
  }
}

// =============================================================================
// Sprite Thumbnail Generator
// =============================================================================

/**
 * Generate thumbnail cues from a sprite configuration
 */
export function generateSpriteCues(sprite: ThumbnailSprite, duration: number): ThumbnailCue[] {
  const cues: ThumbnailCue[] = []
  const totalThumbnails = sprite.cols * sprite.rows
  const startTime = sprite.startTime || 0

  for (let i = 0; i < totalThumbnails; i++) {
    const cueStart = startTime + i * sprite.interval
    const cueEnd = cueStart + sprite.interval

    // Don't create cues beyond video duration
    if (cueStart >= duration) break

    const col = i % sprite.cols
    const row = Math.floor(i / sprite.cols)

    cues.push({
      startTime: cueStart,
      endTime: Math.min(cueEnd, duration),
      url: sprite.url,
      x: col * sprite.width,
      y: row * sprite.height,
      width: sprite.width,
      height: sprite.height,
    })
  }

  return cues
}

// =============================================================================
// Thumbnails Class
// =============================================================================

export class Thumbnails {
  private cues: ThumbnailCue[] = []
  private preloadedImages = new Map<string, HTMLImageElement>()
  private container: HTMLElement | null = null
  private _currentCue: ThumbnailCue | null = null
  private config: ThumbnailsConfig

  constructor(config: ThumbnailsConfig = {}) {
    this.config = config
  }

  /**
   * Initialize thumbnails from config
   */
  async initialize(duration: number): Promise<void> {
    const { src } = this.config

    if (!src) return

    if (typeof src === 'string') {
      // VTT URL
      this.cues = await parseThumbnailVTT(src)
    }
    else if (Array.isArray(src)) {
      // Direct cue array
      this.cues = src
    }
    else {
      // Sprite config
      this.cues = generateSpriteCues(src, duration)
    }

    // Preload images if enabled
    if (this.config.preload) {
      this.preloadImages()
    }
  }

  /**
   * Preload all unique thumbnail images
   */
  private preloadImages(): void {
    const uniqueUrls = new Set(this.cues.map(cue => cue.url))

    for (const url of uniqueUrls) {
      if (!this.preloadedImages.has(url)) {
        const img = new Image()
        img.src = url
        this.preloadedImages.set(url, img)
      }
    }
  }

  /**
   * Get thumbnail cue for a specific time
   */
  getCueForTime(time: number): ThumbnailCue | null {
    for (const cue of this.cues) {
      if (time >= cue.startTime && time < cue.endTime) {
        return cue
      }
    }
    return null
  }

  /**
   * Create thumbnail preview element
   */
  createPreviewElement(): HTMLElement {
    this.container = document.createElement('div')
    this.container.className = 'tsvp-thumbnail-preview'
    this.container.style.cssText = `
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 12px;
      pointer-events: none;
      opacity: 0;
      transition: opacity var(--tsvp-transition-normal, 200ms) var(--tsvp-transition-easing, ease);
      z-index: 10;
      background: var(--tsvp-thumbnail-border, rgba(0, 0, 0, 0.8));
      border-radius: var(--tsvp-thumbnail-radius, 4px);
      padding: 2px;
      box-shadow: var(--tsvp-thumbnail-shadow, 0 4px 12px rgba(0, 0, 0, 0.4));
      overflow: hidden;
    `

    const inner = document.createElement('div')
    inner.className = 'tsvp-thumbnail-inner'
    inner.style.cssText = `
      width: var(--tsvp-thumbnail-width, 160px);
      height: var(--tsvp-thumbnail-height, 90px);
      background-size: cover;
      background-position: center;
      border-radius: calc(var(--tsvp-thumbnail-radius, 4px) - 2px);
      overflow: hidden;
    `
    this.container.appendChild(inner)

    const time = document.createElement('div')
    time.className = 'tsvp-thumbnail-time'
    time.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
      color: #fff;
      font-size: var(--tsvp-font-size-sm, 12px);
      padding: 4px 6px 2px;
      text-align: center;
      font-family: var(--tsvp-font-family, sans-serif);
    `
    this.container.appendChild(time)

    return this.container
  }

  /**
   * Update thumbnail preview for a specific time
   */
  updatePreview(time: number, position?: number): void {
    if (!this.container) return

    const cue = this.getCueForTime(time)
    const inner = this.container.querySelector('.tsvp-thumbnail-inner') as HTMLElement
    const timeEl = this.container.querySelector('.tsvp-thumbnail-time') as HTMLElement

    if (cue && inner) {
      // Custom renderer
      if (this.config.renderer) {
        this.config.renderer(cue, inner)
      }
      else {
        // Default rendering
        if (cue.x !== undefined && cue.y !== undefined) {
          // Sprite thumbnail
          inner.style.backgroundImage = `url(${cue.url})`
          inner.style.backgroundPosition = `-${cue.x}px -${cue.y}px`
          inner.style.backgroundSize = 'auto'
          inner.style.width = `${cue.width}px`
          inner.style.height = `${cue.height}px`
        }
        else {
          // Individual thumbnail
          inner.style.backgroundImage = `url(${cue.url})`
          inner.style.backgroundPosition = 'center'
          inner.style.backgroundSize = 'cover'
          inner.style.width = `${cue.width}px`
          inner.style.height = `${cue.height}px`
        }
      }

      // Update time display
      if (timeEl) {
        timeEl.textContent = formatTime(time)
      }

      this._currentCue = cue
    }

    // Update horizontal position if provided
    if (position !== undefined) {
      this.container.style.left = `${position}px`
    }
  }

  /**
   * Show thumbnail preview
   */
  show(): void {
    if (this.container) {
      this.container.style.opacity = '1'
    }
  }

  /**
   * Hide thumbnail preview
   */
  hide(): void {
    if (this.container) {
      this.container.style.opacity = '0'
    }
  }

  /**
   * Get all cues
   */
  getCues(): ThumbnailCue[] {
    return [...this.cues]
  }

  /**
   * Add cues manually
   */
  addCues(cues: ThumbnailCue[]): void {
    this.cues.push(...cues)
  }

  /**
   * Get current cue
   */
  getCurrentCue(): ThumbnailCue | null {
    return this._currentCue
  }

  /**
   * Clear all cues
   */
  clear(): void {
    this.cues = []
    this.preloadedImages.clear()
    this._currentCue = null
  }

  /**
   * Destroy thumbnails instance
   */
  destroy(): void {
    this.clear()
    if (this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
    this.container = null
  }
}

// =============================================================================
// Factory
// =============================================================================

export function createThumbnails(config?: ThumbnailsConfig): Thumbnails {
  return new Thumbnails(config)
}

// =============================================================================
// Helpers
// =============================================================================

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}

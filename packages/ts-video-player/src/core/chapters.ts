/**
 * Chapters Support
 *
 * VTT chapters parsing and chapter markers for the progress bar.
 *
 * @module core/chapters
 */

// =============================================================================
// Types
// =============================================================================

export interface Chapter {
  /** Chapter ID */
  id: string
  /** Start time in seconds */
  startTime: number
  /** End time in seconds */
  endTime: number
  /** Chapter title */
  title: string
  /** Optional thumbnail URL */
  thumbnail?: string
}

export interface ChaptersConfig {
  /** VTT chapters URL or array of chapters */
  src?: string | Chapter[]
  /** Show chapter markers on progress bar */
  showMarkers?: boolean
  /** Show chapter title on hover */
  showTitles?: boolean
  /** Marker color */
  markerColor?: string
  /** Active marker color */
  activeMarkerColor?: string
}

// =============================================================================
// VTT Chapters Parser
// =============================================================================

/**
 * Parse VTT file for chapters
 */
export async function parseChaptersVTT(url: string): Promise<Chapter[]> {
  const response = await fetch(url)
  const text = await response.text()

  const chapters: Chapter[] = []
  const lines = text.split('\n')

  let i = 0
  let chapterIndex = 0

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

      // Next line(s) should be the chapter title
      i++
      let title = ''
      while (i < lines.length && lines[i].trim() !== '') {
        if (title) title += ' '
        title += lines[i].trim()
        i++
      }

      if (title) {
        chapters.push({
          id: `chapter-${chapterIndex++}`,
          startTime,
          endTime,
          title,
        })
      }
    }

    i++
  }

  return chapters
}

/**
 * Parse VTT timestamp to seconds
 */
function parseVTTTime(timeStr: string): number {
  const parts = timeStr.split(':')
  let seconds = 0

  if (parts.length === 3) {
    seconds += Number.parseFloat(parts[0]) * 3600
    seconds += Number.parseFloat(parts[1]) * 60
    seconds += Number.parseFloat(parts[2])
  }
  else if (parts.length === 2) {
    seconds += Number.parseFloat(parts[0]) * 60
    seconds += Number.parseFloat(parts[1])
  }

  return seconds
}

// =============================================================================
// Chapters Manager
// =============================================================================

export class ChaptersManager {
  private chapters: Chapter[] = []
  private config: Required<ChaptersConfig>
  private markersContainer: HTMLElement | null = null
  private titleElement: HTMLElement | null = null
  private currentChapter: Chapter | null = null
  private duration = 0

  constructor(config: ChaptersConfig = {}) {
    this.config = {
      src: config.src || [],
      showMarkers: config.showMarkers ?? true,
      showTitles: config.showTitles ?? true,
      markerColor: config.markerColor || 'rgba(255, 255, 255, 0.5)',
      activeMarkerColor: config.activeMarkerColor || 'var(--tsvp-color-primary, #00a8ff)',
    }
  }

  /**
   * Initialize chapters
   */
  async initialize(duration: number): Promise<void> {
    this.duration = duration
    const { src } = this.config

    if (!src) return

    if (typeof src === 'string') {
      this.chapters = await parseChaptersVTT(src)
    }
    else if (Array.isArray(src)) {
      this.chapters = src
    }
  }

  /**
   * Get all chapters
   */
  getChapters(): Chapter[] {
    return [...this.chapters]
  }

  /**
   * Get chapter at specific time
   */
  getChapterAtTime(time: number): Chapter | null {
    for (const chapter of this.chapters) {
      if (time >= chapter.startTime && time < chapter.endTime) {
        return chapter
      }
    }
    return null
  }

  /**
   * Get current chapter
   */
  getCurrentChapter(): Chapter | null {
    return this.currentChapter
  }

  /**
   * Update current time and chapter
   */
  updateTime(time: number): Chapter | null {
    const chapter = this.getChapterAtTime(time)

    if (chapter !== this.currentChapter) {
      this.currentChapter = chapter
      this.updateActiveMarker()
    }

    return chapter
  }

  /**
   * Seek to chapter by ID
   */
  seekToChapter(id: string): number | null {
    const chapter = this.chapters.find(c => c.id === id)
    return chapter ? chapter.startTime : null
  }

  /**
   * Get next chapter
   */
  getNextChapter(currentTime: number): Chapter | null {
    for (const chapter of this.chapters) {
      if (chapter.startTime > currentTime) {
        return chapter
      }
    }
    return null
  }

  /**
   * Get previous chapter
   */
  getPreviousChapter(currentTime: number): Chapter | null {
    let prev: Chapter | null = null
    for (const chapter of this.chapters) {
      if (chapter.startTime >= currentTime) {
        break
      }
      prev = chapter
    }
    return prev
  }

  /**
   * Create chapter markers element for progress bar
   */
  createMarkersElement(): HTMLElement {
    this.markersContainer = document.createElement('div')
    this.markersContainer.className = 'tsvp-chapter-markers'
    this.markersContainer.style.cssText = `
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      pointer-events: none;
    `

    this.renderMarkers()
    return this.markersContainer
  }

  /**
   * Render chapter markers
   */
  private renderMarkers(): void {
    if (!this.markersContainer || !this.duration) return

    this.markersContainer.innerHTML = ''

    for (const chapter of this.chapters) {
      const marker = document.createElement('div')
      marker.className = 'tsvp-chapter-marker'
      marker.dataset.chapterId = chapter.id

      const position = (chapter.startTime / this.duration) * 100

      marker.style.cssText = `
        position: absolute;
        left: ${position}%;
        top: 0;
        bottom: 0;
        width: 2px;
        background: ${this.config.markerColor};
        transform: translateX(-50%);
        transition: background var(--tsvp-transition-fast, 100ms);
      `

      this.markersContainer.appendChild(marker)
    }
  }

  /**
   * Update active marker styling
   */
  private updateActiveMarker(): void {
    if (!this.markersContainer) return

    const markers = this.markersContainer.querySelectorAll('.tsvp-chapter-marker')
    markers.forEach((marker) => {
      const el = marker as HTMLElement
      const isActive = this.currentChapter && el.dataset.chapterId === this.currentChapter.id
      el.style.background = isActive ? this.config.activeMarkerColor : this.config.markerColor
    })
  }

  /**
   * Create chapter title element
   */
  createTitleElement(): HTMLElement {
    this.titleElement = document.createElement('div')
    this.titleElement.className = 'tsvp-chapter-title'
    this.titleElement.style.cssText = `
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 8px;
      padding: 6px 12px;
      background: var(--tsvp-controls-tooltip-bg, rgba(0, 0, 0, 0.9));
      color: var(--tsvp-controls-tooltip-text, #ffffff);
      font-size: var(--tsvp-font-size-sm, 12px);
      font-family: var(--tsvp-font-family, sans-serif);
      border-radius: var(--tsvp-radius-sm, 4px);
      white-space: nowrap;
      opacity: 0;
      transition: opacity var(--tsvp-transition-normal, 200ms);
      pointer-events: none;
      z-index: 10;
    `

    return this.titleElement
  }

  /**
   * Show chapter title
   */
  showTitle(chapter: Chapter): void {
    if (this.titleElement && this.config.showTitles) {
      this.titleElement.textContent = chapter.title
      this.titleElement.style.opacity = '1'
    }
  }

  /**
   * Hide chapter title
   */
  hideTitle(): void {
    if (this.titleElement) {
      this.titleElement.style.opacity = '0'
    }
  }

  /**
   * Get chapter at position (for hover preview)
   */
  getChapterAtPosition(percent: number): Chapter | null {
    const time = (percent / 100) * this.duration
    return this.getChapterAtTime(time)
  }

  /**
   * Add chapters
   */
  addChapters(chapters: Chapter[]): void {
    this.chapters.push(...chapters)
    this.renderMarkers()
  }

  /**
   * Clear all chapters
   */
  clear(): void {
    this.chapters = []
    this.currentChapter = null
    if (this.markersContainer) {
      this.markersContainer.innerHTML = ''
    }
  }

  /**
   * Destroy
   */
  destroy(): void {
    this.clear()
    this.markersContainer?.remove()
    this.titleElement?.remove()
    this.markersContainer = null
    this.titleElement = null
  }
}

// =============================================================================
// Chapter Menu Component
// =============================================================================

export class ChapterMenu {
  private container: HTMLElement
  private chapters: Chapter[] = []
  private onSelect: ((chapter: Chapter) => void) | null = null

  constructor() {
    this.container = document.createElement('div')
    this.container.className = 'tsvp-chapter-menu'
    this.applyStyles()
  }

  private applyStyles(): void {
    this.container.style.cssText = `
      max-height: 300px;
      overflow-y: auto;
      background: var(--tsvp-menu-bg, rgba(20, 20, 20, 0.95));
      border-radius: var(--tsvp-menu-radius, 8px);
      box-shadow: var(--tsvp-menu-shadow, 0 4px 20px rgba(0, 0, 0, 0.5));
    `
  }

  /**
   * Set chapters
   */
  setChapters(chapters: Chapter[]): void {
    this.chapters = chapters
    this.render()
  }

  /**
   * Render chapter list
   */
  private render(): void {
    this.container.innerHTML = ''

    for (const chapter of this.chapters) {
      const item = document.createElement('button')
      item.className = 'tsvp-chapter-menu-item'
      item.type = 'button'

      item.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 10px 16px;
        border: none;
        background: transparent;
        color: var(--tsvp-color-text, #ffffff);
        font-size: var(--tsvp-font-size, 14px);
        font-family: var(--tsvp-font-family, sans-serif);
        text-align: left;
        cursor: pointer;
        transition: background var(--tsvp-transition-fast, 100ms);
      `

      // Thumbnail
      if (chapter.thumbnail) {
        const thumb = document.createElement('img')
        thumb.src = chapter.thumbnail
        thumb.style.cssText = `
          width: 80px;
          height: 45px;
          object-fit: cover;
          border-radius: 4px;
        `
        item.appendChild(thumb)
      }

      // Info
      const info = document.createElement('div')
      info.style.cssText = 'flex: 1;'

      const title = document.createElement('div')
      title.textContent = chapter.title
      title.style.fontWeight = 'var(--tsvp-font-weight-bold, 600)'
      info.appendChild(title)

      const time = document.createElement('div')
      time.textContent = formatTime(chapter.startTime)
      time.style.cssText = `
        font-size: var(--tsvp-font-size-sm, 12px);
        opacity: 0.7;
        margin-top: 2px;
      `
      info.appendChild(time)

      item.appendChild(info)

      // Hover effect
      item.addEventListener('mouseenter', () => {
        item.style.background = 'var(--tsvp-menu-item-hover-bg, rgba(255, 255, 255, 0.1))'
      })
      item.addEventListener('mouseleave', () => {
        item.style.background = 'transparent'
      })

      // Click handler
      item.addEventListener('click', () => {
        if (this.onSelect) {
          this.onSelect(chapter)
        }
      })

      this.container.appendChild(item)
    }
  }

  /**
   * Set select handler
   */
  onChapterSelect(handler: (chapter: Chapter) => void): void {
    this.onSelect = handler
  }

  /**
   * Get element
   */
  getElement(): HTMLElement {
    return this.container
  }

  /**
   * Highlight current chapter
   */
  setActiveChapter(id: string): void {
    const items = this.container.querySelectorAll('.tsvp-chapter-menu-item')
    items.forEach((item, index) => {
      const el = item as HTMLElement
      const isActive = this.chapters[index]?.id === id
      el.style.background = isActive
        ? 'var(--tsvp-menu-item-active-bg, rgba(0, 168, 255, 0.2))'
        : 'transparent'
    })
  }

  /**
   * Destroy
   */
  destroy(): void {
    this.container.remove()
  }
}

// =============================================================================
// Factory
// =============================================================================

export function createChaptersManager(config?: ChaptersConfig): ChaptersManager {
  return new ChaptersManager(config)
}

export function createChapterMenu(): ChapterMenu {
  return new ChapterMenu()
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

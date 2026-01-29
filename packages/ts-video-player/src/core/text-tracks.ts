/**
 * ts-video-player Text Tracks
 *
 * Comprehensive text track management for captions and subtitles.
 * Supports VTT, SRT, and external track loading.
 *
 * @module core/text-tracks
 */

import type { TextTrack, TextTrackCue } from '../types'

// =============================================================================
// Types
// =============================================================================

/**
 * Text track ready state
 */
export enum TextTrackReadyState {
  /** Not loaded */
  NotLoaded = 0,
  /** Loading */
  Loading = 1,
  /** Ready */
  Ready = 2,
  /** Error */
  Error = 3,
}

/**
 * Text track init options
 */
export interface TextTrackInit {
  /** Track kind */
  kind: TextTrack['kind']
  /** Track label */
  label: string
  /** Track language (BCP 47) */
  language: string
  /** Track source URL */
  src?: string
  /** Whether this is the default track */
  default?: boolean
  /** Track content (VTT/SRT string) */
  content?: string
}

/**
 * VTT cue init options
 */
export interface VTTCueInit {
  /** Cue ID */
  id?: string
  /** Start time in seconds */
  startTime: number
  /** End time in seconds */
  endTime: number
  /** Cue text */
  text: string
  /** Vertical setting */
  vertical?: '' | 'rl' | 'lr'
  /** Line position */
  line?: number | 'auto'
  /** Line alignment */
  lineAlign?: 'start' | 'center' | 'end'
  /** Position */
  position?: number | 'auto'
  /** Position alignment */
  positionAlign?: 'line-left' | 'center' | 'line-right' | 'auto'
  /** Size (percentage) */
  size?: number
  /** Alignment */
  align?: 'start' | 'center' | 'end' | 'left' | 'right'
}

// =============================================================================
// Text Track List
// =============================================================================

/**
 * Manages a list of text tracks
 */
export class TextTrackList {
  private tracks: ManagedTextTrack[] = []
  private listeners = new Set<(tracks: TextTrack[]) => void>()
  private video: HTMLVideoElement | null = null

  constructor(video?: HTMLVideoElement) {
    this.video = video || null
  }

  /**
   * Get all tracks
   */
  getAll(): TextTrack[] {
    return this.tracks.map((t) => t.toJSON())
  }

  /**
   * Get track by ID
   */
  get(id: string): TextTrack | null {
    const track = this.tracks.find((t) => t.id === id)
    return track?.toJSON() || null
  }

  /**
   * Get currently showing track
   */
  getShowing(): TextTrack | null {
    const track = this.tracks.find((t) => t.mode === 'showing')
    return track?.toJSON() || null
  }

  /**
   * Add a new text track
   */
  async add(init: TextTrackInit): Promise<TextTrack> {
    const id = `track-${this.tracks.length}`
    const track = new ManagedTextTrack({
      id,
      ...init,
    })

    this.tracks.push(track)

    // Load track if src provided
    if (init.src) {
      await track.load(init.src)
    } else if (init.content) {
      track.parseContent(init.content)
    }

    // Add to video element if available
    if (this.video) {
      this.addToVideo(track)
    }

    this.notify()
    return track.toJSON()
  }

  /**
   * Remove a text track
   */
  remove(id: string): void {
    const index = this.tracks.findIndex((t) => t.id === id)
    if (index !== -1) {
      const track = this.tracks[index]
      track.dispose()
      this.tracks.splice(index, 1)
      this.notify()
    }
  }

  /**
   * Set track mode
   */
  setMode(id: string, mode: TextTrack['mode']): void {
    const track = this.tracks.find((t) => t.id === id)
    if (!track) return

    // Disable other showing tracks if enabling this one
    if (mode === 'showing') {
      for (const t of this.tracks) {
        if (t.id !== id && t.mode === 'showing') {
          t.mode = 'disabled'
        }
      }
    }

    track.mode = mode
    this.notify()
  }

  /**
   * Get active cues at a specific time
   */
  getActiveCues(time: number): TextTrackCue[] {
    const showing = this.tracks.find((t) => t.mode === 'showing')
    if (!showing) return []

    return showing.cues.filter((cue) => time >= cue.startTime && time <= cue.endTime)
  }

  /**
   * Subscribe to track changes
   */
  subscribe(listener: (tracks: TextTrack[]) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Clear all tracks
   */
  clear(): void {
    for (const track of this.tracks) {
      track.dispose()
    }
    this.tracks = []
    this.notify()
  }

  private addToVideo(track: ManagedTextTrack): void {
    if (!this.video) return

    // Create native track element
    const trackEl = document.createElement('track')
    trackEl.kind = track.kind
    trackEl.label = track.label
    trackEl.srclang = track.language
    if (track.src) trackEl.src = track.src
    if (track.default) trackEl.default = true

    this.video.appendChild(trackEl)
  }

  private notify(): void {
    const tracks = this.getAll()
    this.listeners.forEach((l) => l(tracks))
  }
}

// =============================================================================
// Managed Text Track
// =============================================================================

class ManagedTextTrack {
  readonly id: string
  readonly kind: TextTrack['kind']
  readonly label: string
  readonly language: string
  readonly src?: string
  readonly default: boolean

  private _mode: TextTrack['mode'] = 'disabled'
  private _cues: TextTrackCue[] = []
  private _readyState: TextTrackReadyState = TextTrackReadyState.NotLoaded

  constructor(init: TextTrackInit & { id: string }) {
    this.id = init.id
    this.kind = init.kind
    this.label = init.label
    this.language = init.language
    this.src = init.src
    this.default = init.default || false

    if (init.default) {
      this._mode = 'showing'
    }
  }

  get mode(): TextTrack['mode'] {
    return this._mode
  }

  set mode(value: TextTrack['mode']) {
    this._mode = value
  }

  get cues(): TextTrackCue[] {
    return this._cues
  }

  get readyState(): TextTrackReadyState {
    return this._readyState
  }

  /**
   * Load track from URL
   */
  async load(url: string): Promise<void> {
    this._readyState = TextTrackReadyState.Loading

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to load track: ${response.status}`)
      }

      const content = await response.text()
      this.parseContent(content)
      this._readyState = TextTrackReadyState.Ready
    } catch (error) {
      this._readyState = TextTrackReadyState.Error
      console.warn('[ts-video-player] Failed to load text track:', error)
    }
  }

  /**
   * Parse track content (VTT or SRT)
   */
  parseContent(content: string): void {
    // Detect format
    if (content.trim().startsWith('WEBVTT')) {
      this._cues = parseVTT(content)
    } else {
      this._cues = parseSRT(content)
    }
    this._readyState = TextTrackReadyState.Ready
  }

  /**
   * Add a cue
   */
  addCue(cue: VTTCueInit): void {
    this._cues.push({
      id: cue.id || `cue-${this._cues.length}`,
      startTime: cue.startTime,
      endTime: cue.endTime,
      text: cue.text,
      position: cue.position,
      line: cue.line,
      align: cue.align,
    })
  }

  /**
   * Remove a cue
   */
  removeCue(id: string): void {
    const index = this._cues.findIndex((c) => c.id === id)
    if (index !== -1) {
      this._cues.splice(index, 1)
    }
  }

  /**
   * Convert to plain object
   */
  toJSON(): TextTrack {
    return {
      id: this.id,
      kind: this.kind,
      label: this.label,
      language: this.language,
      src: this.src,
      default: this.default,
      mode: this._mode,
      cues: this._cues,
    }
  }

  /**
   * Dispose the track
   */
  dispose(): void {
    this._cues = []
  }
}

// =============================================================================
// VTT Parser
// =============================================================================

/**
 * Parse VTT content
 */
function parseVTT(content: string): TextTrackCue[] {
  const cues: TextTrackCue[] = []
  const lines = content.split(/\r?\n/)

  let i = 0

  // Skip header
  while (i < lines.length && !lines[i].includes('-->')) {
    i++
  }

  while (i < lines.length) {
    const line = lines[i].trim()

    // Check for cue timing line
    if (line.includes('-->')) {
      const [start, end] = line.split('-->').map((t) => parseVTTTime(t.trim()))

      // Collect cue text
      i++
      const textLines: string[] = []
      while (i < lines.length && lines[i].trim() !== '') {
        textLines.push(lines[i])
        i++
      }

      cues.push({
        id: `cue-${cues.length}`,
        startTime: start,
        endTime: end,
        text: textLines.join('\n'),
      })
    }

    i++
  }

  return cues
}

/**
 * Parse VTT time format (00:00:00.000 or 00:00.000)
 */
function parseVTTTime(time: string): number {
  const parts = time.split(':')
  let seconds = 0

  if (parts.length === 3) {
    // HH:MM:SS.mmm
    seconds = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseFloat(parts[2])
  } else if (parts.length === 2) {
    // MM:SS.mmm
    seconds = parseInt(parts[0], 10) * 60 + parseFloat(parts[1])
  }

  return seconds
}

// =============================================================================
// SRT Parser
// =============================================================================

/**
 * Parse SRT content
 */
function parseSRT(content: string): TextTrackCue[] {
  const cues: TextTrackCue[] = []
  const blocks = content.trim().split(/\r?\n\r?\n/)

  for (const block of blocks) {
    const lines = block.split(/\r?\n/)
    if (lines.length < 2) continue

    // Find timing line
    let timingIndex = 0
    while (timingIndex < lines.length && !lines[timingIndex].includes('-->')) {
      timingIndex++
    }

    if (timingIndex >= lines.length) continue

    const timingLine = lines[timingIndex]
    const [start, end] = timingLine.split('-->').map((t) => parseSRTTime(t.trim()))

    // Collect text
    const textLines = lines.slice(timingIndex + 1)

    cues.push({
      id: lines[0] || `cue-${cues.length}`,
      startTime: start,
      endTime: end,
      text: textLines.join('\n'),
    })
  }

  return cues
}

/**
 * Parse SRT time format (00:00:00,000)
 */
function parseSRTTime(time: string): number {
  // SRT uses comma for milliseconds
  const normalized = time.replace(',', '.')
  return parseVTTTime(normalized)
}

// =============================================================================
// Caption Renderer
// =============================================================================

export interface CaptionRendererOptions {
  /** Container element */
  container: HTMLElement
  /** Font size */
  fontSize?: number
  /** Font family */
  fontFamily?: string
  /** Text color */
  color?: string
  /** Background color */
  backgroundColor?: string
  /** Background opacity */
  backgroundOpacity?: number
  /** Text shadow */
  textShadow?: boolean
}

/**
 * Render captions on screen
 */
export class CaptionRenderer {
  private container: HTMLElement
  private element: HTMLElement | null = null
  private options: Required<Omit<CaptionRendererOptions, 'container'>>

  constructor(options: CaptionRendererOptions) {
    this.container = options.container
    this.options = {
      fontSize: options.fontSize || 18,
      fontFamily: options.fontFamily || 'sans-serif',
      color: options.color || '#ffffff',
      backgroundColor: options.backgroundColor || '#000000',
      backgroundOpacity: options.backgroundOpacity || 0.75,
      textShadow: options.textShadow !== false,
    }

    this.createCaptionElement()
  }

  private createCaptionElement(): void {
    this.element = document.createElement('div')
    this.element.className = 'ts-video-player__captions'
    this.element.setAttribute('aria-live', 'polite')
    this.element.setAttribute('aria-atomic', 'true')
    this.applyStyles()
    this.container.appendChild(this.element)
  }

  private applyStyles(): void {
    if (!this.element) return

    const bgColor = this.hexToRgba(this.options.backgroundColor, this.options.backgroundOpacity)

    Object.assign(this.element.style, {
      position: 'absolute',
      bottom: '10%',
      left: '50%',
      transform: 'translateX(-50%)',
      maxWidth: '80%',
      textAlign: 'center',
      fontSize: `${this.options.fontSize}px`,
      fontFamily: this.options.fontFamily,
      color: this.options.color,
      backgroundColor: bgColor,
      padding: '4px 8px',
      borderRadius: '4px',
      lineHeight: '1.4',
      pointerEvents: 'none',
      zIndex: '10',
      whiteSpace: 'pre-wrap',
      textShadow: this.options.textShadow ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
    })
  }

  /**
   * Update the displayed text
   */
  setText(text: string): void {
    if (!this.element) return

    if (text) {
      this.element.textContent = text
      this.element.style.display = 'block'
    } else {
      this.element.style.display = 'none'
    }
  }

  /**
   * Update renderer options
   */
  setOptions(options: Partial<Omit<CaptionRendererOptions, 'container'>>): void {
    Object.assign(this.options, options)
    this.applyStyles()
  }

  /**
   * Destroy the renderer
   */
  destroy(): void {
    this.element?.remove()
    this.element = null
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
}

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Create a new text track list
 */
export function createTextTrackList(video?: HTMLVideoElement): TextTrackList {
  return new TextTrackList(video)
}

/**
 * Create a caption renderer
 */
export function createCaptionRenderer(options: CaptionRendererOptions): CaptionRenderer {
  return new CaptionRenderer(options)
}

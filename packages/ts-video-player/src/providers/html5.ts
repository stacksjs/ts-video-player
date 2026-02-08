/**
 * ts-video-player HTML5 Provider
 *
 * Native HTML5 video/audio element provider.
 *
 * @module providers/html5
 */

import type {
  ProviderType,
  Src,
  MediaSource,
  PlayerOptions,
  AudioTrack,
  TextTrack,
} from '../types'
import { BaseProvider } from './base'
import { MediaEventsNormalizer, onFullscreenChange, onPiPChange } from '../core/events'
import { probeVolumeAvailability } from '../core/features'

/**
 * Check if a source is an HTML5 compatible source
 */
export function isHTML5Source(src: Src): boolean {
  if (typeof src === 'string') {
    const url = src.toLowerCase()
    // Check for supported extensions
    if (
      url.endsWith('.mp4') ||
      url.endsWith('.webm') ||
      url.endsWith('.ogg') ||
      url.endsWith('.ogv') ||
      url.endsWith('.mov') ||
      url.endsWith('.mp3') ||
      url.endsWith('.wav') ||
      url.endsWith('.flac')
    ) {
      return true
    }
    // Check for MIME types
    return false
  }

  if (typeof src === 'object' && 'type' in src) {
    const type = (src as MediaSource).type?.toLowerCase() || ''
    return (
      type.startsWith('video/') ||
      type.startsWith('audio/') ||
      type === 'application/ogg'
    )
  }

  return false
}

/**
 * Get MIME type for a source
 */
function getMimeType(src: string): string {
  const ext = src.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    ogv: 'video/ogg',
    mov: 'video/quicktime',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    flac: 'audio/flac',
  }
  return mimeTypes[ext || ''] || 'video/mp4'
}

/**
 * HTML5 Video/Audio Provider
 */
export class HTML5Provider extends BaseProvider {
  readonly name = 'html5'
  readonly type: ProviderType = 'video'

  private media: HTMLVideoElement | HTMLAudioElement | null = null
  private eventsNormalizer: MediaEventsNormalizer | null = null
  private cleanupFullscreen: (() => void) | null = null
  private cleanupPiP: (() => void) | null = null
  private isAudio = false

  get mediaElement(): HTMLVideoElement | HTMLAudioElement | null {
    return this.media
  }

  // === Lifecycle ===

  protected async initialize(): Promise<void> {
    if (!this.container) {
      throw new Error('Container element is required')
    }

    // Determine if audio or video based on options
    this.isAudio = this.options.mediaType === 'audio'

    // Create media element
    this.media = document.createElement(this.isAudio ? 'audio' : 'video')
    this.media.className = 'ts-video-player__media'

    // Set attributes
    if (this.options.autoplay) this.media.autoplay = true
    if (this.options.loop) this.media.loop = true
    if (this.options.muted) this.media.muted = true
    if (this.options.playsinline && !this.isAudio) {
      (this.media as HTMLVideoElement).playsInline = true
    }
    if (this.options.preload) this.media.preload = this.options.preload
    if (this.options.crossorigin) this.media.crossOrigin = this.options.crossorigin
    if (this.options.poster && !this.isAudio) {
      (this.media as HTMLVideoElement).poster = this.options.poster
    }

    // Set initial volume
    if (this.options.volume !== undefined) {
      this.media.volume = this.options.volume
    }

    // Append to container
    this.container.appendChild(this.media)

    // Setup event normalization
    this.eventsNormalizer = new MediaEventsNormalizer(this.media, this.events)

    // Setup fullscreen listener
    this.cleanupFullscreen = onFullscreenChange((fullscreen) => {
      this.events.emit('fullscreenchange', fullscreen)
    })

    // Setup PiP listener for video
    if (!this.isAudio && this.media instanceof HTMLVideoElement) {
      this.cleanupPiP = onPiPChange(this.media, (pip) => {
        this.events.emit('pipchange', pip)
      })
    }

    // Emit state for dimensions and feature availability
    if (!this.isAudio) {
      this.media.addEventListener('loadedmetadata', () => {
        const video = this.media as HTMLVideoElement
        const fullscreenAvailability = this.getFeatureAvailability('fullscreen')
        const pipAvailability = this.getFeatureAvailability('pip')
        const volumeAvailability = this.getFeatureAvailability('volume')
        this.events.emit('statechange', {
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          aspectRatio: (video.videoHeight > 0 ? video.videoWidth / video.videoHeight : 0) || 16 / 9,
          canFullscreen: fullscreenAvailability === 'available',
          canPictureInPicture: pipAvailability === 'available',
          fullscreenAvailability,
          pipAvailability,
          volumeAvailability,
        })
        this.events.emit('availabilitychange', 'fullscreen', fullscreenAvailability)
        this.events.emit('availabilitychange', 'pip', pipAvailability)
        this.events.emit('availabilitychange', 'volume', volumeAvailability)
      })
    }

    // Async volume probe after loadeddata
    this.media.addEventListener('loadeddata', () => {
      if (!this.media) return
      probeVolumeAvailability(this.media).then((availability) => {
        this.events.emit('statechange', {
          volumeAvailability: availability,
        })
        this.events.emit('availabilitychange', 'volume', availability)
      }).catch(() => {
        // Volume probe failed — keep current availability state
      })
    })

    // iOS Safari PiP via webkitpresentationmodechanged
    if (!this.isAudio && this.media instanceof HTMLVideoElement) {
      this.media.addEventListener('webkitpresentationmodechanged', () => {
        const video = this.media as any
        if (video?.webkitPresentationMode) {
          const isPiP = video.webkitPresentationMode === 'picture-in-picture'
          this.events.emit('pipchange', isPiP)
        }
      })
    }
  }

  protected cleanup(): void {
    this.eventsNormalizer?.destroy()
    this.cleanupFullscreen?.()
    this.cleanupPiP?.()

    if (this.media) {
      this.media.pause()
      this.media.removeAttribute('src')
      this.media.load()
      this.media.remove()
      this.media = null
    }
  }

  // === Loading ===

  canPlay(src: Src): boolean {
    return isHTML5Source(src)
  }

  async load(src: Src): Promise<void> {
    if (!this.media) return

    // Clear existing sources
    this.media.innerHTML = ''
    this.media.removeAttribute('src')

    // Normalize source
    const sources = Array.isArray(src) ? src : [src]

    for (const source of sources) {
      if (typeof source === 'string') {
        // Simple URL
        const sourceEl = document.createElement('source')
        sourceEl.src = source
        sourceEl.type = getMimeType(source)
        this.media.appendChild(sourceEl)
      } else if ('src' in source && typeof source.src === 'string') {
        // MediaSource object
        const mediaSource = source as MediaSource
        const sourceEl = document.createElement('source')
        sourceEl.src = mediaSource.src
        sourceEl.type = mediaSource.type || getMimeType(mediaSource.src)
        this.media.appendChild(sourceEl)
      }
    }

    // Load the media
    this.media.load()
  }

  // === Playback ===

  async play(): Promise<void> {
    if (!this.media) return
    try {
      await this.media.play()
    } catch (error) {
      // Handle autoplay blocked
      if ((error as Error).name === 'NotAllowedError') {
        this.emitError(1, 'Playback was blocked. User interaction required.', error)
      } else {
        throw error
      }
    }
  }

  pause(): void {
    this.media?.pause()
  }

  // === Seeking ===

  seekTo(time: number): void {
    if (this.media) {
      this.media.currentTime = Math.max(0, Math.min(time, this.getDuration()))
    }
  }

  getCurrentTime(): number {
    return this.media?.currentTime || 0
  }

  getDuration(): number {
    return this.media?.duration || 0
  }

  // === Volume ===

  setVolume(volume: number): void {
    if (this.media) {
      this.media.volume = Math.max(0, Math.min(1, volume))
    }
  }

  getVolume(): number {
    return this.media?.volume || 1
  }

  setMuted(muted: boolean): void {
    if (this.media) {
      this.media.muted = muted
    }
  }

  getMuted(): boolean {
    return this.media?.muted || false
  }

  // === Playback Rate ===

  setPlaybackRate(rate: number): void {
    if (this.media) {
      this.media.playbackRate = Math.max(0.25, Math.min(4, rate))
    }
  }

  getPlaybackRate(): number {
    return this.media?.playbackRate || 1
  }

  // === Text Tracks ===

  getTextTracks(): TextTrack[] {
    if (!this.media) return []

    const tracks: TextTrack[] = []
    const textTracks = this.media.textTracks

    for (let i = 0; i < textTracks.length; i++) {
      const track = textTracks[i]
      tracks.push({
        id: String(i),
        kind: track.kind as TextTrack['kind'],
        label: track.label || `Track ${i + 1}`,
        language: track.language || '',
        mode: track.mode as TextTrack['mode'],
        cues: this.getTrackCues(track),
      })
    }

    return tracks
  }

  private getTrackCues(track: globalThis.TextTrack): TextTrack['cues'] {
    if (!track.cues) return []

    const cues: TextTrack['cues'] = []
    for (let i = 0; i < track.cues.length; i++) {
      const cue = track.cues[i] as VTTCue
      cues.push({
        id: cue.id || String(i),
        startTime: cue.startTime,
        endTime: cue.endTime,
        text: cue.text,
      })
    }
    return cues
  }

  setTextTrackMode(trackId: string, mode: 'disabled' | 'hidden' | 'showing'): void {
    if (!this.media) return

    const index = parseInt(trackId, 10)
    const track = this.media.textTracks[index]
    if (track) {
      track.mode = mode
      this.events.emit('texttrackchange', mode === 'showing' ? this.getTextTracks()[index] : null)
    }
  }

  // === Audio Tracks ===

  getAudioTracks(): AudioTrack[] {
    if (!this.media || this.isAudio) return []

    const video = this.media as HTMLVideoElement
    if (!('audioTracks' in video)) return []

    const audioTracks = (video as any).audioTracks
    const tracks: AudioTrack[] = []

    for (let i = 0; i < audioTracks.length; i++) {
      const track = audioTracks[i]
      tracks.push({
        id: track.id || String(i),
        label: track.label || `Track ${i + 1}`,
        language: track.language || '',
        kind: track.kind || '',
        selected: track.enabled,
      })
    }

    return tracks
  }

  setAudioTrack(trackId: string): void {
    if (!this.media || this.isAudio) return

    const video = this.media as HTMLVideoElement
    if (!('audioTracks' in video)) return

    const audioTracks = (video as any).audioTracks
    for (let i = 0; i < audioTracks.length; i++) {
      const isTarget = audioTracks[i].id === trackId || String(i) === trackId
      audioTracks[i].enabled = isTarget
    }

    this.events.emit('audiotrackchange', this.getAudioTracks().find((t) => t.selected) || null)
  }

  // === Add Text Track ===

  addTextTrack(options: {
    src?: string
    kind?: TextTrack['kind']
    label?: string
    language?: string
    default?: boolean
  }): void {
    if (!this.media) return

    const track = document.createElement('track')
    if (options.src) track.src = options.src
    track.kind = options.kind || 'subtitles'
    track.label = options.label || ''
    track.srclang = options.language || ''
    if (options.default) track.default = true

    this.media.appendChild(track)
  }
}

/**
 * HTML5 Provider Loader
 */
export const html5Loader = {
  name: 'html5',
  type: 'video' as ProviderType,

  canPlay(src: Src): boolean {
    return isHTML5Source(src)
  },

  mediaType(src: Src): 'video' | 'audio' | 'unknown' {
    if (typeof src === 'string') {
      const url = src.toLowerCase()
      if (url.endsWith('.mp3') || url.endsWith('.wav') || url.endsWith('.flac')) {
        return 'audio'
      }
      return 'video'
    }

    if (typeof src === 'object' && 'type' in src) {
      const type = (src as MediaSource).type?.toLowerCase() || ''
      if (type.startsWith('audio/')) return 'audio'
    }

    return 'video'
  },

  async load(container: HTMLElement, options: PlayerOptions): Promise<HTML5Provider> {
    const provider = new HTML5Provider()
    await provider.setup(container, options)
    return provider
  },
}

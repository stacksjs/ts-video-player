/**
 * ts-video-player Audio Gain
 *
 * Audio gain/boost using Web Audio API.
 *
 * @module core/audio-gain
 */

// =============================================================================
// Types
// =============================================================================

export interface AudioGainAdapter {
  /** Current gain value (1.0 = normal, >1.0 = boosted) */
  readonly currentGain: number
  /** Whether audio gain is supported */
  readonly supported: boolean
  /** Set the gain value */
  setGain(gain: number): void
  /** Remove gain (reset to 1.0) */
  removeGain(): void
  /** Destroy the gain node */
  destroy(): void
}

// =============================================================================
// Audio Gain Implementation
// =============================================================================

/**
 * Audio gain controller using Web Audio API
 */
export class AudioGain implements AudioGainAdapter {
  private media: HTMLMediaElement
  private audioContext: AudioContext | null = null
  private sourceNode: MediaElementAudioSourceNode | null = null
  private gainNode: GainNode | null = null
  private _currentGain = 1

  constructor(media: HTMLMediaElement) {
    this.media = media
  }

  get currentGain(): number {
    return this._currentGain
  }

  get supported(): boolean {
    return typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined'
  }

  /**
   * Set the gain value
   *
   * @param gain - Gain value (1.0 = normal, 2.0 = 2x volume)
   */
  setGain(gain: number): void {
    if (!this.supported) return

    // Clamp gain to reasonable range
    const clampedGain = Math.max(0, Math.min(10, gain))

    // If gain is 1, just remove the effect
    if (clampedGain === 1 && this._currentGain !== 1) {
      this.removeGain()
      return
    }

    // Create audio context if needed
    if (!this.audioContext) {
      this.createAudioContext()
    }

    if (!this.gainNode) return

    this._currentGain = clampedGain
    this.gainNode.gain.value = clampedGain
  }

  /**
   * Remove gain (reset to 1.0)
   */
  removeGain(): void {
    this._currentGain = 1

    if (this.gainNode) {
      this.gainNode.gain.value = 1
    }

    // Optionally disconnect to save resources
    // this.disconnectNodes()
  }

  /**
   * Destroy the audio context and nodes
   */
  destroy(): void {
    this.disconnectNodes()

    if (this.audioContext) {
      this.audioContext.close().catch(() => {})
      this.audioContext = null
    }

    this._currentGain = 1
  }

  private createAudioContext(): void {
    try {
      // Create audio context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      this.audioContext = new AudioContextClass()

      // Create source node from media element
      this.sourceNode = this.audioContext.createMediaElementSource(this.media)

      // Create gain node
      this.gainNode = this.audioContext.createGain()
      this.gainNode.gain.value = this._currentGain

      // Connect: source -> gain -> destination
      this.sourceNode.connect(this.gainNode)
      this.gainNode.connect(this.audioContext.destination)
    } catch (error) {
      console.warn('[ts-video-player] Failed to create audio gain context:', error)
    }
  }

  private disconnectNodes(): void {
    try {
      this.sourceNode?.disconnect()
      this.gainNode?.disconnect()
    } catch {
      // Ignore disconnect errors
    }

    this.sourceNode = null
    this.gainNode = null
  }
}

// =============================================================================
// Factory
// =============================================================================

/**
 * Create an audio gain controller for a media element
 */
export function createAudioGain(media: HTMLMediaElement): AudioGainAdapter {
  return new AudioGain(media)
}

// =============================================================================
// Presets
// =============================================================================

/**
 * Common gain presets
 */
export const GAIN_PRESETS = {
  normal: 1.0,
  boost_small: 1.5,
  boost_medium: 2.0,
  boost_large: 3.0,
  boost_max: 5.0,
} as const

/**
 * Available gain steps for UI
 */
export const GAIN_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5] as const

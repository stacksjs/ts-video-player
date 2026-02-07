/**
 * ts-video-player Feature Availability Detection
 *
 * Detects platform capabilities for volume, fullscreen, and PiP.
 *
 * @module core/features
 */

import type { FeatureAvailability } from '../types'

// =============================================================================
// Platform Detection Helpers
// =============================================================================

/**
 * Detect iOS Safari (including iPadOS Safari)
 */
export function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  // iPhone/iPad/iPod with Safari
  if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) return true
  // iPadOS reports as Mac but has touch
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true
  return false
}

/**
 * Detect Safari browser (desktop or mobile)
 */
export function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
}

/**
 * Detect standalone PWA mode
 */
export function isStandalonePWA(): boolean {
  if (typeof window === 'undefined') return false
  return (navigator as any).standalone === true
    || window.matchMedia('(display-mode: standalone)').matches
}

// =============================================================================
// Volume Availability
// =============================================================================

/**
 * Detect volume control availability.
 * iOS Safari silently ignores programmatic volume changes on media elements.
 */
export function detectVolumeAvailability(
  media?: HTMLMediaElement | null,
): FeatureAvailability {
  if (isIOSSafari()) return 'unsupported'
  if (!media) return 'unavailable'
  return 'available'
}

/**
 * Async volume probe: attempts to set volume and reads it back.
 * This is the authoritative check - the sync check is a fast heuristic.
 */
export async function probeVolumeAvailability(
  media: HTMLMediaElement,
): Promise<FeatureAvailability> {
  const original = media.volume
  try {
    const testValue = original === 1 ? 0.5 : 1
    media.volume = testValue
    // Some browsers apply volume asynchronously
    await new Promise((r) => setTimeout(r, 0))
    const changed = media.volume !== original
    media.volume = original
    return changed ? 'available' : 'unsupported'
  } catch {
    try { media.volume = original } catch { /* ignore */ }
    return 'unsupported'
  }
}

// =============================================================================
// Fullscreen Availability
// =============================================================================

interface WebKitDocument extends Document {
  webkitFullscreenEnabled?: boolean
  webkitFullscreenElement?: Element
  webkitExitFullscreen?: () => Promise<void>
  webkitCancelFullScreen?: () => Promise<void>
  mozFullScreenEnabled?: boolean
  msFullscreenEnabled?: boolean
}

interface WebKitVideoElement extends HTMLVideoElement {
  webkitEnterFullscreen?: () => void
  webkitExitFullscreen?: () => void
  webkitSupportsFullscreen?: boolean
  webkitDisplayingFullscreen?: boolean
  webkitPresentationMode?: string
  webkitSetPresentationMode?: (mode: string) => void
  webkitSupportsPresentationMode?: (mode: string) => boolean
}

interface WebKitFullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>
  webkitRequestFullScreen?: () => Promise<void>
}

/**
 * Detect fullscreen API availability.
 */
export function detectFullscreenAvailability(
  container?: HTMLElement | null,
  videoElement?: HTMLVideoElement | null,
): FeatureAvailability {
  const doc = typeof document !== 'undefined' ? document as WebKitDocument : null
  if (!doc) return 'unsupported'

  // Standard API or WebKit prefix
  if (doc.fullscreenEnabled || doc.webkitFullscreenEnabled) return 'available'
  // Moz/MS prefixes
  if (doc.mozFullScreenEnabled || doc.msFullscreenEnabled) return 'available'

  // iOS Safari: video-only fullscreen via webkitEnterFullscreen
  if (videoElement) {
    const video = videoElement as WebKitVideoElement
    if (video.webkitSupportsFullscreen === true) return 'available'
    if (typeof video.webkitEnterFullscreen === 'function') return 'available'
  }

  if (!container && !videoElement) return 'unavailable'
  return 'unsupported'
}

/**
 * Whether this environment only supports video-element fullscreen (iOS Safari),
 * not container-level fullscreen.
 */
export function isVideoOnlyFullscreen(): boolean {
  if (typeof document === 'undefined') return false
  const doc = document as WebKitDocument
  return isIOSSafari()
    && !doc.fullscreenEnabled
    && !doc.webkitFullscreenEnabled
}

/**
 * Enter fullscreen with cross-browser support including iOS Safari.
 */
export async function enterFullscreen(
  container: HTMLElement | null,
  media: HTMLMediaElement | null,
): Promise<void> {
  const video = media as WebKitVideoElement | null

  // Try container first (standard and WebKit APIs)
  if (container) {
    const el = container as WebKitFullscreenElement
    if (typeof el.requestFullscreen === 'function') return el.requestFullscreen()
    if (typeof el.webkitRequestFullscreen === 'function') return el.webkitRequestFullscreen()
    if (typeof el.webkitRequestFullScreen === 'function') return el.webkitRequestFullScreen()
  }

  // Fall back to video element (iOS Safari)
  if (video && typeof video.webkitEnterFullscreen === 'function') {
    video.webkitEnterFullscreen()
    return
  }

  // Last resort: try media element with standard API
  if (media && typeof media.requestFullscreen === 'function') {
    return media.requestFullscreen()
  }
}

/**
 * Exit fullscreen with cross-browser support.
 */
export async function exitFullscreen(media?: HTMLMediaElement | null): Promise<void> {
  const doc = document as WebKitDocument
  const video = media as WebKitVideoElement | null

  if (typeof doc.exitFullscreen === 'function') return doc.exitFullscreen()
  if (typeof doc.webkitExitFullscreen === 'function') return doc.webkitExitFullscreen()
  if (typeof doc.webkitCancelFullScreen === 'function') return doc.webkitCancelFullScreen()

  // iOS Safari video fullscreen
  if (video && typeof video.webkitExitFullscreen === 'function') {
    video.webkitExitFullscreen()
  }
}

// =============================================================================
// Picture-in-Picture Availability
// =============================================================================

/**
 * Detect Picture-in-Picture availability.
 */
export function detectPipAvailability(
  videoElement?: HTMLVideoElement | null,
): FeatureAvailability {
  if (!videoElement) return 'unavailable'

  // Standard PiP API
  if ('requestPictureInPicture' in videoElement) {
    if (typeof document !== 'undefined' && document.pictureInPictureEnabled === false) {
      return 'unavailable'
    }
    // Safari PWAs have the API but it doesn't work
    if (isSafari() && isStandalonePWA()) return 'unavailable'
    return 'available'
  }

  // iOS Safari WebKit presentation mode
  const video = videoElement as WebKitVideoElement
  if (typeof video.webkitSetPresentationMode === 'function') {
    if (isStandalonePWA()) return 'unavailable'
    if (typeof video.webkitSupportsPresentationMode === 'function') {
      return video.webkitSupportsPresentationMode('picture-in-picture')
        ? 'available'
        : 'unsupported'
    }
    return 'available'
  }

  return 'unsupported'
}

/**
 * Enter Picture-in-Picture with cross-browser support.
 */
export async function enterPiP(media: HTMLMediaElement): Promise<void> {
  const video = media as HTMLVideoElement & WebKitVideoElement

  // Standard PiP API
  if (typeof video.requestPictureInPicture === 'function') {
    await video.requestPictureInPicture()
    return
  }

  // iOS Safari WebKit presentation mode
  if (typeof video.webkitSetPresentationMode === 'function') {
    video.webkitSetPresentationMode('picture-in-picture')
  }
}

/**
 * Exit Picture-in-Picture with cross-browser support.
 */
export async function exitPiP(media?: HTMLMediaElement | null): Promise<void> {
  // Standard PiP API
  if (document.pictureInPictureElement && typeof document.exitPictureInPicture === 'function') {
    await document.exitPictureInPicture()
    return
  }

  // iOS Safari WebKit presentation mode
  if (media) {
    const video = media as WebKitVideoElement
    if (video.webkitPresentationMode === 'picture-in-picture'
      && typeof video.webkitSetPresentationMode === 'function') {
      video.webkitSetPresentationMode('inline')
    }
  }
}

// =============================================================================
// Aggregate Detection
// =============================================================================

/**
 * Detect all feature availabilities at once.
 */
export function detectAllFeatures(
  container?: HTMLElement | null,
  videoElement?: HTMLVideoElement | null,
  mediaElement?: HTMLMediaElement | null,
): Record<'volume' | 'fullscreen' | 'pip', FeatureAvailability> {
  return {
    volume: detectVolumeAvailability(mediaElement),
    fullscreen: detectFullscreenAvailability(container, videoElement),
    pip: detectPipAvailability(videoElement),
  }
}

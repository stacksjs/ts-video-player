/**
 * ts-video-player Providers
 *
 * Export all media providers.
 *
 * @module providers
 */

// Base
export { BaseProvider } from './base'

// HTML5 Video/Audio
export { HTML5Provider, html5Loader, isHTML5Source } from './html5'

// YouTube
export { YouTubeProvider, youtubeLoader, isYouTubeSource, extractYouTubeId } from './youtube'

// Vimeo
export { VimeoProvider, vimeoLoader, isVimeoSource, extractVimeoId, extractVimeoHash } from './vimeo'

// HLS
export { HLSProvider, hlsLoader, isHLSSource, isNativeHLSSupported } from './hls'

// DASH
export { DASHProvider, dashLoader, isDASHSource } from './dash'

export type { DASHSource, DRMConfig, DASHProviderConfig } from './dash'

// Re-export types
export type { Provider, ProviderLoader, ProviderType } from '../types'

// =============================================================================
// Provider Registry
// =============================================================================

import type { ProviderLoader, Src } from '../types'
import { html5Loader } from './html5'
import { youtubeLoader } from './youtube'
import { vimeoLoader } from './vimeo'
import { hlsLoader } from './hls'
import { dashLoader } from './dash'

/**
 * Default provider loaders in priority order
 */
export const defaultLoaders: ProviderLoader[] = [
  hlsLoader, // Check HLS first
  dashLoader, // Then DASH
  youtubeLoader, // Then YouTube
  vimeoLoader, // Then Vimeo
  html5Loader, // HTML5 as fallback
]

/**
 * Find the appropriate provider loader for a source
 */
export function findLoader(src: Src, loaders: ProviderLoader[] = defaultLoaders): ProviderLoader | null {
  for (const loader of loaders) {
    if (loader.canPlay(src)) {
      return loader
    }
  }
  return null
}

/**
 * Detect media type from source
 */
export function detectMediaType(src: Src, loaders: ProviderLoader[] = defaultLoaders): 'video' | 'audio' | 'unknown' {
  const loader = findLoader(src, loaders)
  return loader?.mediaType(src) || 'unknown'
}

/**
 * Get preconnect hints for a source
 */
export function getPreconnectHints(src: Src, loaders: ProviderLoader[] = defaultLoaders): string[] {
  const loader = findLoader(src, loaders)
  return loader?.preconnect?.() || []
}

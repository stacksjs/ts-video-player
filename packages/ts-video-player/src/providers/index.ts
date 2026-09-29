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

export type { DASHSource, DASHProviderConfig } from './dash'
export type { DRMConfig } from '../types'

// Re-export types
export type { Provider, ProviderLoader, ProviderType } from '../types'

// =============================================================================
// Provider Registry
// =============================================================================

import type { ProviderLoader, Src } from '../types'
import { getMimeType, html5Loader } from './html5'
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
 * The URL of a source object that says nothing about its kind: `{ src }`,
 * perhaps with a quality or size, but no `type`. Only its URL can tell a
 * YouTube link from an MP4, so that is what the loaders are asked about.
 */
function untypedUrl(src: Src): string | null {
  if (!src || typeof src !== 'object' || typeof src.src !== 'string')
    return null
  return 'type' in src && src.type ? null : src.src
}

/** What a loader's source type is written as, for a source it matched by URL alone. */
const TYPE_FOR_LOADER: Record<string, (url: string) => string> = {
  youtube: () => 'youtube',
  vimeo: () => 'vimeo',
  hls: () => 'application/x-mpegurl',
  dash: () => 'dash',
  video: url => getMimeType(url),
}

function withType(src: Src, loader: ProviderLoader): Src {
  const url = untypedUrl(src)
  const type = url && TYPE_FOR_LOADER[loader.type]
  return url && type ? { ...(src as object), type: type(url) } as Src : src
}

/**
 * Find the appropriate provider loader for a source
 */
export function findLoader(src: Src, loaders: ProviderLoader[] = defaultLoaders): ProviderLoader | null {
  for (const loader of loaders) {
    if (loader.canPlay(src)) {
      return loader
    }
  }
  const url = untypedUrl(src)
  if (url) {
    for (const loader of loaders) {
      if (loader.canPlay(url))
        return loader
    }
  }
  return null
}

export interface SourceCandidate {
  src: Src
  index: number
  loader: ProviderLoader
}

/** Resolve every playable source without discarding ordered fallbacks. */
export function findSourceCandidates(sources: readonly Src[], loaders: ProviderLoader[] = defaultLoaders): SourceCandidate[] {
  const candidates: SourceCandidate[] = []
  sources.forEach((src, index) => {
    const loader = findLoader(src, loaders)
    // Typed for the provider that claimed it, which reads `type` to know how.
    if (loader) candidates.push({ src: withType(src, loader), index, loader })
  })
  return candidates
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

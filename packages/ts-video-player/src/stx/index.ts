/**
 * ts-video-player stx Integration
 *
 * Deep integration with the stx templating framework.
 * Provides components, directives, and runtime for seamless video embedding.
 *
 * @module stx
 */

import type {
  VideoComponentProps,
  VideoDirectiveOptions,
  VideoRenderResult,
  PlayerOptions,
  Src,
} from '../types'
import { extractYouTubeId } from '../providers/youtube'

// =============================================================================
// Video Component
// =============================================================================

/**
 * Render the <Video> component for stx
 *
 * @example
 * ```typescript
 * const result = await renderVideoComponent({
 *   src: '/videos/intro.mp4',
 *   poster: '/images/poster.jpg',
 *   controls: true,
 *   lazy: true,
 * })
 * ```
 */
export async function renderVideoComponent(
  props: VideoComponentProps,
  context: { isDev?: boolean } = {},
): Promise<VideoRenderResult> {
  const {
    src,
    poster,
    title,
    class: className,
    style,
    id = `ts-video-${randomId()}`,
    width,
    height,
    options = {},
    lazy = true,
    autoplay = false,
    loop = false,
    muted = false,
    controls = true,
    playsinline = true,
    preload = 'metadata',
    theme = 'default',
  } = props

  // Detect provider type
  const providerType = detectProviderType(src)
  const isEmbed = providerType === 'youtube' || providerType === 'vimeo'

  // Build player options
  const playerOptions: PlayerOptions = {
    ...options,
    autoplay,
    loop,
    muted,
    playsinline,
    preload,
    poster,
    title,
    controls,
  }

  // Build container attributes
  const attrs: string[] = [
    `id="${id}"`,
    `class="ts-video-player ts-video-player--${theme}${className ? ' ' + escapeAttr(className) : ''}"`,
    `data-ts-video-player`,
    `data-provider="${providerType}"`,
  ]

  if (style) attrs.push(`style="${escapeAttr(style)}"`)
  if (width) attrs.push(`data-width="${width}"`)
  if (height) attrs.push(`data-height="${height}"`)
  if (lazy) attrs.push(`data-lazy`)

  // Build data config
  const config = {
    src: normalizeSrc(src),
    options: playerOptions,
  }
  attrs.push(`data-config='${JSON.stringify(config)}'`)

  // Build HTML
  let html = ''

  if (isEmbed) {
    // Embed placeholder with poster
    html = buildEmbedPlaceholder(id, attrs, poster, title, providerType, src)
  } else {
    // Native video with poster
    html = buildNativeVideoPlaceholder(id, attrs, poster, title, lazy, preload, src)
  }

  // Build initialization script
  const script = generateInitScript(id, lazy)

  // Build styles
  const css = generatePlayerCSS(theme)

  return { html, script, css }
}

/**
 * Parse <Video> component from template
 */
export function parseVideoComponent(content: string): VideoComponentProps | null {
  // Simple attribute parsing
  const srcMatch = content.match(/src=["']([^"']+)["']/)
  const posterMatch = content.match(/poster=["']([^"']+)["']/)
  const titleMatch = content.match(/title=["']([^"']+)["']/)
  const classMatch = content.match(/class=["']([^"']+)["']/)
  const idMatch = content.match(/id=["']([^"']+)["']/)
  const widthMatch = content.match(/width=["']?(\d+)["']?/)
  const heightMatch = content.match(/height=["']?(\d+)["']?/)

  if (!srcMatch) return null

  return {
    src: srcMatch[1],
    poster: posterMatch?.[1],
    title: titleMatch?.[1],
    class: classMatch?.[1],
    id: idMatch?.[1],
    width: widthMatch ? parseInt(widthMatch[1], 10) : undefined,
    height: heightMatch ? parseInt(heightMatch[1], 10) : undefined,
    autoplay: content.includes('autoplay'),
    loop: content.includes('loop'),
    muted: content.includes('muted'),
    controls: !content.includes('controls="false"') && !content.includes(':controls="false"'),
    playsinline: !content.includes('playsinline="false"'),
    lazy: !content.includes('lazy="false"') && !content.includes(':lazy="false"'),
  }
}

// =============================================================================
// Video Directive
// =============================================================================

/**
 * Create the @video directive for stx
 *
 * Usage:
 * ```html
 * @video('/videos/intro.mp4', { poster: '/poster.jpg', controls: true })
 * @video(youtubeUrl, { lazy: true })
 * ```
 */
export function createVideoDirective() {
  return {
    name: 'video',
    hasEndTag: false,
    description: 'Embed a video player with full playback controls',

    transform: async (
      content: string,
      params: Record<string, unknown>,
      context: Record<string, unknown>,
    ): Promise<string> => {
      const props = parseVideoDirectiveArgs(content, params, context)

      if (!props.src) {
        console.warn('@video directive: missing src argument')
        return '<!-- @video: missing src -->'
      }

      const isDev = context.__isDev as boolean || false
      const result = await renderVideoComponent(props, { isDev })

      let output = result.html
      if (result.css) {
        output += `\n<style>${result.css}</style>`
      }
      if (result.script) {
        output += `\n<script>${result.script}</script>`
      }

      return output
    },
  }
}

/**
 * Parse @video directive arguments
 */
function parseVideoDirectiveArgs(
  content: string,
  params: Record<string, unknown>,
  context: Record<string, unknown>,
): VideoComponentProps {
  // If params already structured
  if (params.src) {
    return {
      src: String(params.src),
      ...(params.options || params) as Partial<VideoComponentProps>,
    }
  }

  // Parse from content: @video('/path/to/video.mp4', { options })
  let args = content.trim()
  if (args.startsWith('@video(') || args.startsWith('(')) {
    args = args.replace(/^@video\(/, '').replace(/^\(/, '').replace(/\)$/, '')
  }

  // Split into src and options
  const parts = splitArgs(args)
  const src = resolveValue(parts[0], context) as string || ''
  let options: Partial<VideoComponentProps> = {}

  if (parts[1]) {
    const resolved = resolveValue(parts[1], context)
    if (typeof resolved === 'object' && resolved !== null) {
      options = resolved as Partial<VideoComponentProps>
    }
  }

  return { src, ...options }
}

// =============================================================================
// Helpers
// =============================================================================

function detectProviderType(src: Src | Src[]): string {
  const firstSrc = Array.isArray(src) ? src[0] : src
  const url = typeof firstSrc === 'string' ? firstSrc : (firstSrc as any).src || ''

  if (extractYouTubeId(url)) return 'youtube'
  if (url.includes('vimeo.com')) return 'vimeo'
  if (url.endsWith('.m3u8') || url.includes('application/x-mpegURL')) return 'hls'
  if (url.endsWith('.mpd') || url.includes('application/dash+xml')) return 'dash'

  return 'html5'
}

function normalizeSrc(src: Src | Src[]): Src | Src[] {
  return src
}

function buildEmbedPlaceholder(
  id: string,
  attrs: string[],
  poster: string | undefined,
  title: string | undefined,
  provider: string,
  src: Src | Src[],
): string {
  const posterStyle = poster ? `background-image: url('${escapeAttr(poster)}');` : ''
  const firstSrc = Array.isArray(src) ? src[0] : src
  const url = typeof firstSrc === 'string' ? firstSrc : (firstSrc as any).src || ''

  return `
<div ${attrs.join(' ')}>
  <div class="ts-video-player__container">
    <div class="ts-video-player__placeholder" style="${posterStyle}" data-poster>
      <button class="ts-video-player__play-button" aria-label="Play ${escapeAttr(title || 'video')}">
        <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </button>
    </div>
  </div>
</div>
`.trim()
}

function buildNativeVideoPlaceholder(
  id: string,
  attrs: string[],
  poster: string | undefined,
  title: string | undefined,
  lazy: boolean,
  preload: string,
  src: Src | Src[],
): string {
  const firstSrc = Array.isArray(src) ? src[0] : src
  const url = typeof firstSrc === 'string' ? firstSrc : (firstSrc as any).src || ''

  const videoAttrs = [
    `class="ts-video-player__media"`,
    `playsinline`,
    lazy ? 'preload="none"' : `preload="${preload}"`,
  ]

  if (lazy) {
    videoAttrs.push(`data-poster="${escapeAttr(poster || '')}"`)
    videoAttrs.push(`data-src="${escapeAttr(url)}"`)
  } else {
    if (poster) videoAttrs.push(`poster="${escapeAttr(poster)}"`)
    videoAttrs.push(`src="${escapeAttr(url)}"`)
  }

  if (title) videoAttrs.push(`title="${escapeAttr(title)}"`)

  return `
<div ${attrs.join(' ')}>
  <div class="ts-video-player__container">
    <video ${videoAttrs.join(' ')}>
      ${!lazy ? buildSourceTags(src) : ''}
    </video>
  </div>
</div>
`.trim()
}

function buildSourceTags(src: Src | Src[]): string {
  const sources = Array.isArray(src) ? src : [src]
  return sources
    .map((s) => {
      if (typeof s === 'string') {
        return `<source src="${escapeAttr(s)}" type="${getMimeType(s)}" />`
      }
      const mediaSource = s as { src: string; type?: string }
      return `<source src="${escapeAttr(mediaSource.src)}" type="${mediaSource.type || getMimeType(mediaSource.src)}" />`
    })
    .join('\n')
}

function getMimeType(src: string): string {
  const ext = src.split('.').pop()?.toLowerCase()
  const types: Record<string, string> = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    ogv: 'video/ogg',
    mov: 'video/quicktime',
    m3u8: 'application/x-mpegURL',
    mpd: 'application/dash+xml',
  }
  return types[ext || ''] || 'video/mp4'
}

function generateInitScript(id: string, lazy: boolean): string {
  return `
(function() {
  var container = document.getElementById('${id}');
  if (!container) return;

  var config = JSON.parse(container.dataset.config || '{}');
  var isLazy = container.hasAttribute('data-lazy');

  function initPlayer() {
    if (typeof VideoPlayer === 'undefined') {
      // Load the player library
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/ts-video-player@latest/dist/index.min.js';
      script.onload = function() { createPlayer(); };
      document.head.appendChild(script);
    } else {
      createPlayer();
    }
  }

  function createPlayer() {
    var player = VideoPlayer.createPlayer(container, config.options || {});
    if (config.src) {
      player.setSrc(config.src);
    }
    container.__videoPlayer = player;
  }

  if (isLazy) {
    // Use IntersectionObserver for lazy loading
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          initPlayer();
          observer.disconnect();
        }
      });
    }, { rootMargin: '50px' });
    observer.observe(container);
  } else {
    // Initialize immediately
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initPlayer);
    } else {
      initPlayer();
    }
  }

  // Handle play button click (for embed placeholders)
  var playButton = container.querySelector('.ts-video-player__play-button');
  if (playButton) {
    playButton.addEventListener('click', function() {
      initPlayer();
      // Wait for player to initialize then play
      var checkPlayer = setInterval(function() {
        if (container.__videoPlayer && container.__videoPlayer.ready) {
          container.__videoPlayer.play();
          clearInterval(checkPlayer);
        }
      }, 100);
    });
  }
})();
`.trim()
}

function generatePlayerCSS(theme: string): string {
  return `
.ts-video-player {
  position: relative;
  width: 100%;
  background: #000;
}

.ts-video-player__container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 */
}

.ts-video-player__media,
.ts-video-player__placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.ts-video-player__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1a1a1a;
  background-size: cover;
  background-position: center;
  cursor: pointer;
}

.ts-video-player__play-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
}

.ts-video-player__play-button:hover {
  transform: scale(1.1);
  background: rgba(0, 0, 0, 0.9);
}

.ts-video-player__play-button svg {
  margin-left: 4px;
}

/* Loading state */
.ts-video-player[data-loading="true"]::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40px;
  height: 40px;
  margin: -20px 0 0 -20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: ts-video-spin 0.8s linear infinite;
}

@keyframes ts-video-spin {
  to { transform: rotate(360deg); }
}

/* Controls hidden */
.ts-video-player[data-controls-visible="false"] .ts-video-player__controls {
  opacity: 0;
  pointer-events: none;
}
`.trim()
}

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 8)
}

function splitArgs(str: string): string[] {
  const args: string[] = []
  let current = ''
  let depth = 0
  let inString = false
  let stringChar = ''

  for (const char of str) {
    if ((char === '"' || char === "'") && !inString) {
      inString = true
      stringChar = char
    } else if (char === stringChar && inString) {
      inString = false
      stringChar = ''
    }

    if (!inString) {
      if (char === '{' || char === '[') depth++
      if (char === '}' || char === ']') depth--
      if (char === ',' && depth === 0) {
        args.push(current.trim())
        current = ''
        continue
      }
    }

    current += char
  }

  if (current.trim()) {
    args.push(current.trim())
  }

  return args
}

function resolveValue(value: string | undefined, context: Record<string, unknown>): unknown {
  if (!value) return undefined

  const trimmed = value.trim()

  // Remove quotes
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1)
  }

  // Try to parse as JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed)
    } catch {
      // Not valid JSON
    }
  }

  // Check context
  if (trimmed in context) {
    return context[trimmed]
  }

  return trimmed
}

// =============================================================================
// Exports
// =============================================================================

export const videoDirective = createVideoDirective()

/**
 * Register ts-video-player directives with stx
 */
export function registerVideoDirectives(stx: { config: { customDirectives?: any[] } }): void {
  if (!stx.config.customDirectives) {
    stx.config.customDirectives = []
  }
  stx.config.customDirectives.push(videoDirective)
}

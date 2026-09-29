/**
 * The poster over an embedded video until it plays: when to show it, and
 * with which image.
 *
 * @module core/cover
 */

import type { PlayerState } from '../types'
import { extractYouTubeId } from '../providers/youtube'

export interface EmbedCover {
  show: boolean
  /** The poster to draw, or '' for a plain black cover. */
  image: string
}

/**
 * A YouTube or Vimeo embed draws its own chrome before playback (a title bar,
 * a play button, "Watch on YouTube", and on iOS the system's controls for the
 * embed's own video), none of which can be styled from outside the iframe.
 * Until the first play, and again once it ends (where YouTube shows other
 * videos), the player covers it with its poster instead: the one the page
 * gave it, or else YouTube's thumbnail for the video.
 *
 * `dismissed` is set when a tap on the cover did not start playback, so the
 * embed's own button is left reachable.
 */
export function embedCover(
  state: Pick<PlayerState, 'providerType' | 'started' | 'ended' | 'error' | 'poster' | 'src'>,
  dismissed: boolean,
): EmbedCover {
  const embed = state.providerType === 'youtube' || state.providerType === 'vimeo'
  // Back over the embed when the video ends, where YouTube would otherwise
  // fill the frame with suggestions of other videos.
  const waiting = !state.started || state.ended
  if (!embed || !waiting || state.error || dismissed)
    return { show: false, image: '' }

  if (state.poster)
    return { show: true, image: state.poster }

  const src = state.src
  const url = typeof src === 'string' ? src : src?.src || ''
  const youtubeId = state.providerType === 'youtube' ? extractYouTubeId(url) : null
  return { show: true, image: youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : '' }
}

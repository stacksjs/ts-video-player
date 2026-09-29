import { describe, expect, it } from 'bun:test'
import { embedCover } from '../../src/core/cover'

const youtube = { providerType: 'youtube' as const, started: false, ended: false, error: null, poster: '', src: 'https://www.youtube.com/watch?v=k_EhLGvM8TQ' }

describe('embed cover', () => {
  it('covers a YouTube embed before it plays, with its thumbnail', () => {
    expect(embedCover(youtube, false)).toEqual({ show: true, image: 'https://i.ytimg.com/vi/k_EhLGvM8TQ/hqdefault.jpg' })
  })

  it('prefers the poster the page gave it', () => {
    expect(embedCover({ ...youtube, poster: '/thumbs/squat.jpg' }, false)).toEqual({ show: true, image: '/thumbs/squat.jpg' })
  })

  it('lifts once the video has played', () => {
    expect(embedCover({ ...youtube, started: true }, false).show).toBe(false)
  })

  it('comes back when the video ends, over YouTube\'s suggestions of other videos', () => {
    expect(embedCover({ ...youtube, started: true, ended: true }, false).show).toBe(true)
  })

  it('stays out of the way when a tap on it could not start the embed', () => {
    expect(embedCover(youtube, true).show).toBe(false)
  })

  it('does not hide an error behind a poster', () => {
    expect(embedCover({ ...youtube, error: { code: 2, message: 'Network' } }, false).show).toBe(false)
  })

  it('covers Vimeo too, plain black without a poster', () => {
    expect(embedCover({ ...youtube, providerType: 'vimeo' as const, src: 'https://vimeo.com/76979871' }, false)).toEqual({ show: true, image: '' })
  })

  it('leaves a native video alone: its own poster and controls are ours', () => {
    expect(embedCover({ ...youtube, providerType: 'video' as const, src: '/clip.mp4' }, false).show).toBe(false)
  })
})

import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { YouTubeProvider } from '../../src/providers/youtube'

/**
 * A tap on the poster asks for play while YouTube's player is still loading:
 * its methods only exist after its ready event. That play used to be lost, so
 * the video sat cued behind YouTube's own play button and needed a second tap.
 */

interface FakeYT {
  calls: string[]
  ready: () => void
}

let fake: FakeYT
const saved = { window: (globalThis as any).window, document: (globalThis as any).document }

beforeEach(() => {
  fake = { calls: [], ready: () => {} }
  const element = () => ({ id: '', className: '', style: { cssText: '' }, parentElement: { style: {} }, appendChild() {} })
  ;(globalThis as any).document = { createElement: element, querySelector: () => null }
  ;(globalThis as any).window = {
    location: { origin: 'https://hq.training' },
    YT: {
      PlayerState: { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 },
      Player: class {
        constructor(_element: unknown, config: any) {
          fake.ready = () => config.events.onReady({ target: this, data: 0 })
        }

        getIframe() { return element() }
        // Like the real API: these are only attached once the player is ready.
        loadVideoById(options: any) { fake.calls.push(`load:${options.videoId}`) }
        cueVideoById(options: any) { fake.calls.push(`cue:${options.videoId}`) }
        playVideo() { fake.calls.push('play') }
        pauseVideo() { fake.calls.push('pause') }
        getCurrentTime() { return 0 }
        getDuration() { return 0 }
        destroy() {}
      },
    },
  }
})

afterEach(() => {
  ;(globalThis as any).window = saved.window
  ;(globalThis as any).document = saved.document
})

async function provider(): Promise<YouTubeProvider> {
  const yt = new YouTubeProvider()
  await yt.setup({ appendChild() {} } as any, { playsinline: true })
  return yt
}

describe('YouTube play before the player is ready', () => {
  it('loads the video playing once ready, from one tap', async () => {
    const yt = await provider()
    await yt.load('https://youtu.be/5pdWy6pY2uo')
    await yt.play()
    expect(fake.calls).toEqual([])
    fake.ready()
    expect(fake.calls).toEqual(['load:5pdWy6pY2uo'])
  })

  it('cues it without a tap, so nothing plays by itself', async () => {
    const yt = await provider()
    await yt.load('https://youtu.be/5pdWy6pY2uo')
    fake.ready()
    expect(fake.calls).toEqual(['cue:5pdWy6pY2uo'])
  })

  it('plays at once when the player is already ready', async () => {
    const yt = await provider()
    fake.ready()
    await yt.load('https://youtu.be/5pdWy6pY2uo')
    await yt.play()
    expect(fake.calls).toEqual(['cue:5pdWy6pY2uo', 'play'])
  })

  it('forgets the play when paused before it could start', async () => {
    const yt = await provider()
    await yt.load('https://youtu.be/5pdWy6pY2uo')
    await yt.play()
    yt.pause()
    fake.ready()
    expect(fake.calls).toEqual(['cue:5pdWy6pY2uo'])
  })
})

import { describe, expect, test } from 'bun:test'
import { createKeyboardHandler } from '../../src/core/events'

// The handler skips keys typed into a field; without a DOM there are none.
for (const name of ['HTMLInputElement', 'HTMLTextAreaElement', 'HTMLSelectElement'])
  (globalThis as any)[name] ??= class {}

function press(handler: (event: KeyboardEvent) => void, key: string): boolean {
  let prevented = false
  handler({ key, target: null, preventDefault: () => { prevented = true } } as unknown as KeyboardEvent)
  return prevented
}

describe('keyboard shortcuts', () => {
  const calls: string[] = []
  const record = (name: string) => () => { calls.push(name) }
  const handler = createKeyboardHandler({
    togglePlay: record('play'), toggleMute: record('mute'), toggleFullscreen: record('fullscreen'), togglePiP: record('pip'), toggleCaptions: record('captions'),
    seekBackward: record('back5'), seekForward: record('forward5'), seekBackwardLong: record('back10'), seekForwardLong: record('forward10'),
    volumeUp: record('up'), volumeDown: record('down'), speedUp: record('faster'), speedDown: record('slower'), seekStart: record('start'), seekEnd: record('end'), seekPercent: () => {},
  })

  test('space and K play or pause, M mutes, F goes fullscreen', () => {
    calls.length = 0
    for (const key of [' ', 'k', 'm', 'f']) expect(press(handler, key)).toBe(true)
    expect(calls).toEqual(['play', 'play', 'mute', 'fullscreen'])
  })

  test('J and L skip ten seconds, the arrows five', () => {
    calls.length = 0
    for (const key of ['j', 'l', 'ArrowLeft', 'ArrowRight']) press(handler, key)
    expect(calls).toEqual(['back10', 'forward10', 'back5', 'forward5'])
  })

  test('J and L fall back to the arrows\' seek for actions without a long one', () => {
    const seen: string[] = []
    const short = createKeyboardHandler({ togglePlay() {}, toggleMute() {}, toggleFullscreen() {}, togglePiP() {}, toggleCaptions() {}, seekBackward: () => { seen.push('back') }, seekForward: () => { seen.push('forward') }, volumeUp() {}, volumeDown() {}, speedUp() {}, speedDown() {}, seekStart() {}, seekEnd() {}, seekPercent() {} })
    press(short, 'j')
    press(short, 'l')
    expect(seen).toEqual(['back', 'forward'])
  })
})

describe('fullscreen changes', () => {
  test('ignore the player\'s own re-dispatched event, which once looped forever', async () => {
    const { onFullscreenChange } = await import('../../src/core/events')
    const listeners: Array<(event?: unknown) => void> = []
    const doc = (globalThis as any).document
    ;(globalThis as any).document = { addEventListener: (_: string, l: (event?: unknown) => void) => listeners.push(l), removeEventListener() {}, fullscreenElement: {} }
    ;(globalThis as any).CustomEvent ??= class CustomEvent { constructor(public type: string) {} }
    try {
      const seen: boolean[] = []
      onFullscreenChange(fullscreen => seen.push(fullscreen))
      listeners[0]!(new (globalThis as any).CustomEvent('fullscreenchange'))
      expect(seen).toEqual([])
      listeners[0]!({ type: 'fullscreenchange' })
      expect(seen).toEqual([true])
    }
    finally {
      ;(globalThis as any).document = doc
    }
  })
})

import { describe, expect, test } from 'bun:test'

// Elements extend HTMLElement which isn't available in Bun's default test env.
// We test exports conditionally — if HTMLElement is not defined, we skip DOM tests.
const hasDOM = typeof HTMLElement !== 'undefined'

describe('elements module', () => {
  test('can be imported when HTMLElement is available', async () => {
    if (!hasDOM) {
      // In non-DOM environment, verify the module file exists
      const mod = await import('../../src/elements/utils')
      expect(typeof mod.formatTime).toBe('function')
      expect(typeof mod.formatTimePhrase).toBe('function')
      expect(typeof mod.toISODuration).toBe('function')
      expect(typeof mod.resolvePlayer).toBe('function')
      return
    }

    const mod = await import('../../src/elements')
    expect(mod.VideoPlayerElement).toBeDefined()
    expect(mod.VideoSkin).toBeDefined()
    expect(mod.MediaTimeGroup).toBeDefined()
    expect(mod.MediaTimeSeparator).toBeDefined()
    expect(mod.MediaPreviewTime).toBeDefined()
    expect(mod.registerElements).toBeDefined()
  })
})

// =============================================================================
// Element Utilities (always testable — no DOM dependency)
// =============================================================================

describe('element utils', () => {
  test('formatTime formats correctly', async () => {
    const { formatTime } = await import('../../src/elements/utils')
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(65)).toBe('1:05')
    expect(formatTime(3661)).toBe('1:01:01')
    expect(formatTime(NaN)).toBe('0:00')
  })

  test('formatTime with guide forces hours', async () => {
    const { formatTime } = await import('../../src/elements/utils')
    expect(formatTime(65, 7200)).toBe('0:01:05')
  })

  test('formatTimePhrase formats correctly', async () => {
    const { formatTimePhrase } = await import('../../src/elements/utils')
    expect(formatTimePhrase(0)).toBe('0 seconds')
    expect(formatTimePhrase(1)).toBe('1 second')
    expect(formatTimePhrase(90)).toBe('1 minute, 30 seconds')
    expect(formatTimePhrase(3661)).toBe('1 hour, 1 minute, 1 second')
  })

  test('toISODuration formats correctly', async () => {
    const { toISODuration } = await import('../../src/elements/utils')
    expect(toISODuration(0)).toBe('PT0S')
    expect(toISODuration(90)).toBe('PT1M30S')
    expect(toISODuration(3661)).toBe('PT1H1M1S')
    expect(toISODuration(NaN)).toBe('PT0S')
  })

  test('resolvePlayer returns null without DOM', async () => {
    const { resolvePlayer } = await import('../../src/elements/utils')
    // When no closest() is available, should return null
    const mockEl = {
      getAttribute: () => null,
      closest: () => null,
    } as any
    expect(resolvePlayer(mockEl)).toBeNull()
  })
})

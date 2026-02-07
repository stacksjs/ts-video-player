import { describe, expect, test } from 'bun:test'
import { playback } from '../../src/features/playback'
import { volume } from '../../src/features/volume'
import { quality } from '../../src/features/quality'
import { videoFeatures, audioFeatures, minimalFeatures } from '../../src/features'
import type { Feature } from '../../src/features/types'
import { StateStore } from '../../src/core/state'

// =============================================================================
// createComposablePlayer (pure logic tests — no DOM)
// =============================================================================

describe('composable player', () => {
  test('StateStore can be used as feature store', () => {
    const store = new StateStore({ volume: 0.5, muted: true })
    expect(store.get('volume')).toBe(0.5)
    expect(store.get('muted')).toBe(true)
  })

  test('features can setup with mock context', () => {
    let setupCalled = false

    const testFeature: Feature = {
      name: 'test',
      setup() {
        setupCalled = true
      },
    }

    const store = new StateStore()
    testFeature.setup({
      container: {} as any,
      store,
      options: {},
      getMediaElement: () => null,
    })

    expect(setupCalled).toBe(true)
  })

  test('feature cleanup is called', () => {
    let cleanupCalled = false

    const testFeature: Feature = {
      name: 'test',
      setup() {
        return () => { cleanupCalled = true }
      },
    }

    const store = new StateStore()
    const cleanup = testFeature.setup({
      container: {} as any,
      store,
      options: {},
      getMediaElement: () => null,
    })

    cleanup?.()
    expect(cleanupCalled).toBe(true)
  })

  test('multiple features setup in order', () => {
    const order: string[] = []
    const store = new StateStore()

    const feat1: Feature = {
      name: 'first',
      setup() { order.push('first') },
    }
    const feat2: Feature = {
      name: 'second',
      setup() { order.push('second') },
    }

    const ctx = {
      container: {} as any,
      store,
      options: {},
      getMediaElement: () => null,
    }

    feat1.setup(ctx)
    feat2.setup(ctx)

    expect(order).toEqual(['first', 'second'])
  })

  test('feature receives correct context', () => {
    let receivedCtx: any = null

    const inspectFeature: Feature = {
      name: 'inspect',
      setup(ctx) {
        receivedCtx = ctx
      },
    }

    const store = new StateStore()
    const opts = { keyboard: true }

    inspectFeature.setup({
      container: {} as any,
      store,
      options: opts,
      getMediaElement: () => null,
    })

    expect(receivedCtx).not.toBeNull()
    expect(receivedCtx.store).toBe(store)
    expect(typeof receivedCtx.getMediaElement).toBe('function')
    expect(receivedCtx.options.keyboard).toBe(true)
  })
})

// =============================================================================
// Feature Bundles
// =============================================================================

describe('feature bundles', () => {
  test('videoFeatures contains all video features', () => {
    expect(videoFeatures.length).toBeGreaterThanOrEqual(5)
    const names = videoFeatures.map((f) => f.name)
    expect(names).toContain('playback')
    expect(names).toContain('volume')
    expect(names).toContain('fullscreen')
    expect(names).toContain('pip')
    expect(names).toContain('keyboard')
  })

  test('audioFeatures is a subset of videoFeatures', () => {
    const audioNames = audioFeatures.map((f) => f.name)
    expect(audioNames).toContain('playback')
    expect(audioNames).toContain('volume')
    expect(audioNames.length).toBeLessThan(videoFeatures.length)
  })

  test('minimalFeatures only has playback', () => {
    expect(minimalFeatures.length).toBe(1)
    expect(minimalFeatures[0].name).toBe('playback')
  })
})

// =============================================================================
// Individual Feature Metadata
// =============================================================================

describe('feature metadata', () => {
  test('playback has stateKeys', () => {
    expect(playback.stateKeys).toBeDefined()
    expect(playback.stateKeys!).toContain('paused')
    expect(playback.stateKeys!).toContain('playing')
    expect(playback.stateKeys!).toContain('currentTime')
  })

  test('volume has stateKeys', () => {
    expect(volume.stateKeys).toBeDefined()
    expect(volume.stateKeys!).toContain('volume')
    expect(volume.stateKeys!).toContain('muted')
    expect(volume.stateKeys!).toContain('volumeAvailability')
  })

  test('quality has stateKeys', () => {
    expect(quality.stateKeys).toBeDefined()
    expect(quality.stateKeys!).toContain('qualities')
    expect(quality.stateKeys!).toContain('autoQuality')
  })
})

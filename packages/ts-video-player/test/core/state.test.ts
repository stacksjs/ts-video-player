import { describe, expect, test } from 'bun:test'
import {
  createSignal,
  computed,
  StateStore,
  createDefaultState,
  selectBufferedAmount,
  selectProgress,
  selectRemainingTime,
  selectIsIdle,
  selectIsLoading,
  selectIsLive,
  selectIsDVR,
  selectCurrentQuality,
  selectCurrentTextTrack,
  selectCurrentAudioTrack,
  selectCanFullscreen,
  selectCanPiP,
  selectCanSetVolume,
} from '../../src/core/state'

// =============================================================================
// createSignal
// =============================================================================

describe('createSignal', () => {
  test('returns initial value', () => {
    const [get] = createSignal(42)
    expect(get()).toBe(42)
  })

  test('updates value', () => {
    const [get, set] = createSignal(0)
    set(10)
    expect(get()).toBe(10)
  })

  test('accepts updater function', () => {
    const [get, set] = createSignal(5)
    set((prev) => prev + 3)
    expect(get()).toBe(8)
  })

  test('notifies subscribers on change', () => {
    const [get, set] = createSignal('a')
    let received: string | null = null
    ;(get as any).subscribe((val: string) => { received = val })
    set('b')
    expect(received).toBe('b')
  })

  test('does not notify when value is same', () => {
    const [get, set] = createSignal(1)
    let count = 0
    ;(get as any).subscribe(() => { count++ })
    set(1)
    expect(count).toBe(0)
  })

  test('unsubscribe works', () => {
    const [get, set] = createSignal(0)
    let count = 0
    const unsub = (get as any).subscribe(() => { count++ })
    set(1)
    expect(count).toBe(1)
    unsub()
    set(2)
    expect(count).toBe(1)
  })
})

// =============================================================================
// computed
// =============================================================================

describe('computed', () => {
  test('computes derived value', () => {
    const [getA] = createSignal(2)
    const [getB] = createSignal(3)
    const sum = computed(() => getA() + getB(), [getA, getB])
    expect(sum()).toBe(5)
  })

  test('recomputes when dependency changes', () => {
    const [getA, setA] = createSignal(1)
    const doubled = computed(() => getA() * 2, [getA])
    expect(doubled()).toBe(2)
    setA(5)
    expect(doubled()).toBe(10)
  })
})

// =============================================================================
// StateStore
// =============================================================================

describe('StateStore', () => {
  test('creates with default state', () => {
    const store = new StateStore()
    expect(store.getState().paused).toBe(true)
    expect(store.getState().volume).toBe(1)
  })

  test('accepts initial overrides', () => {
    const store = new StateStore({ volume: 0.5, muted: true })
    expect(store.get('volume')).toBe(0.5)
    expect(store.get('muted')).toBe(true)
  })

  test('get returns correct value', () => {
    const store = new StateStore()
    expect(store.get('paused')).toBe(true)
  })

  test('set updates value and notifies on flush', () => {
    const store = new StateStore()
    let notified = false
    store.subscribe('volume', () => { notified = true })
    store.set('volume', 0.7)
    expect(store.get('volume')).toBe(0.7)
    // Notification is microtask-coalesced, use flush to trigger synchronously
    store.flush()
    expect(notified).toBe(true)
  })

  test('set does not notify when value unchanged', () => {
    const store = new StateStore()
    let count = 0
    store.subscribe('volume', () => { count++ })
    store.set('volume', 1) // same as default
    store.flush()
    expect(count).toBe(0)
  })

  test('batch updates multiple values', () => {
    const store = new StateStore()
    const keys: string[] = []
    store.subscribe('volume', () => keys.push('volume'))
    store.subscribe('muted', () => keys.push('muted'))
    store.batch({ volume: 0.3, muted: true })
    store.flush()
    expect(store.get('volume')).toBe(0.3)
    expect(store.get('muted')).toBe(true)
    expect(keys).toContain('volume')
    expect(keys).toContain('muted')
  })

  test('subscribe to * receives all changes', () => {
    const store = new StateStore()
    let count = 0
    store.subscribe((state) => { count++ })
    store.set('volume', 0.5)
    store.flush()
    expect(count).toBe(1)
  })

  test('subscribe to specific key', () => {
    const store = new StateStore()
    let received = false
    store.subscribe('paused', () => { received = true })
    store.set('volume', 0.5) // different key
    store.flush()
    // * listener would trigger, but specific key listener should not
    expect(received).toBe(false)
    store.set('paused', false)
    store.flush()
    expect(received).toBe(true)
  })

  test('unsubscribe stops notifications', () => {
    const store = new StateStore()
    let count = 0
    const unsub = store.subscribe('volume', () => { count++ })
    store.set('volume', 0.5)
    store.flush()
    expect(count).toBe(1)
    unsub()
    store.set('volume', 0.3)
    store.flush()
    expect(count).toBe(1)
  })

  test('reset restores defaults', () => {
    const store = new StateStore()
    store.set('volume', 0.2)
    store.set('muted', true)
    store.flush()
    store.reset()
    expect(store.get('volume')).toBe(1)
    expect(store.get('muted')).toBe(false)
  })

  test('microtask coalescing batches multiple set calls', async () => {
    const store = new StateStore()
    let globalCount = 0
    store.subscribe((state) => { globalCount++ })

    // Multiple rapid set calls
    store.set('volume', 0.5)
    store.set('muted', true)
    store.set('paused', false)

    // Values are updated immediately
    expect(store.get('volume')).toBe(0.5)
    expect(store.get('muted')).toBe(true)
    expect(store.get('paused')).toBe(false)

    // But notifications haven't fired yet
    expect(globalCount).toBe(0)

    // Wait for microtask
    await Promise.resolve()

    // Only one global notification for all three changes
    expect(globalCount).toBe(1)
  })

  test('flush triggers synchronous notification', () => {
    const store = new StateStore()
    let count = 0
    store.subscribe((state) => { count++ })
    store.set('volume', 0.5)
    store.set('muted', true)
    expect(count).toBe(0)
    store.flush()
    expect(count).toBe(1)
  })

  test('key-specific notifications fire for each changed key', () => {
    const store = new StateStore()
    let volumeCount = 0
    let mutedCount = 0
    store.subscribe('volume', () => { volumeCount++ })
    store.subscribe('muted', () => { mutedCount++ })

    store.set('volume', 0.5)
    store.set('volume', 0.3) // second change to same key
    store.set('muted', true)
    store.flush()

    // Key was in pending set, notified once
    expect(volumeCount).toBe(1)
    expect(mutedCount).toBe(1)
  })
})

// =============================================================================
// createDefaultState
// =============================================================================

describe('createDefaultState', () => {
  test('has all required fields', () => {
    const state = createDefaultState()
    expect(state.paused).toBe(true)
    expect(state.playing).toBe(false)
    expect(state.volume).toBe(1)
    expect(state.muted).toBe(false)
    expect(state.currentTime).toBe(0)
    expect(state.duration).toBe(0)
    expect(state.fullscreen).toBe(false)
    expect(state.pictureInPicture).toBe(false)
  })

  test('has availability fields', () => {
    const state = createDefaultState()
    expect(state.volumeAvailability).toBe('unavailable')
    expect(state.fullscreenAvailability).toBe('unavailable')
    expect(state.pipAvailability).toBe('unavailable')
  })
})

// =============================================================================
// Selectors
// =============================================================================

describe('selectors', () => {
  test('selectBufferedAmount returns 0 for no buffered data', () => {
    const state = createDefaultState()
    expect(selectBufferedAmount(state)).toBe(0)
  })

  test('selectBufferedAmount calculates correctly', () => {
    const state = { ...createDefaultState(), duration: 100, buffered: [{ start: 0, end: 50 }] }
    expect(selectBufferedAmount(state)).toBe(0.5)
  })

  test('selectProgress returns 0 for duration 0', () => {
    const state = createDefaultState()
    expect(selectProgress(state)).toBe(0)
  })

  test('selectProgress calculates correctly', () => {
    const state = { ...createDefaultState(), currentTime: 30, duration: 60 }
    expect(selectProgress(state)).toBe(0.5)
  })

  test('selectRemainingTime', () => {
    const state = { ...createDefaultState(), currentTime: 20, duration: 100 }
    expect(selectRemainingTime(state)).toBe(80)
  })

  test('selectIsIdle', () => {
    const state = createDefaultState()
    expect(selectIsIdle(state)).toBe(true)
    const playing = { ...state, loadingState: 'loaded' as const, playbackState: 'playing' as const }
    expect(selectIsIdle(playing)).toBe(false)
  })

  test('selectIsLoading', () => {
    const state = createDefaultState()
    expect(selectIsLoading(state)).toBe(false)
    expect(selectIsLoading({ ...state, loadingState: 'loading' as const })).toBe(true)
    expect(selectIsLoading({ ...state, waiting: true })).toBe(true)
  })

  test('selectIsLive', () => {
    expect(selectIsLive({ ...createDefaultState(), streamType: 'live' })).toBe(true)
    expect(selectIsLive({ ...createDefaultState(), streamType: 'live:dvr' })).toBe(true)
    expect(selectIsLive({ ...createDefaultState(), streamType: 'on-demand' })).toBe(false)
  })

  test('selectIsDVR', () => {
    expect(selectIsDVR({ ...createDefaultState(), streamType: 'live:dvr' })).toBe(true)
    expect(selectIsDVR({ ...createDefaultState(), streamType: 'live' })).toBe(false)
  })

  test('selectCurrentQuality', () => {
    const state = createDefaultState()
    expect(selectCurrentQuality(state)).toBe('auto')
    const withQuality = {
      ...state,
      autoQuality: false,
      qualities: [{ id: '1', width: 1920, height: 1080, bitrate: 5000000, selected: true }],
    }
    expect(selectCurrentQuality(withQuality)).toBe('1080p')
  })

  test('selectCurrentTextTrack', () => {
    const state = createDefaultState()
    expect(selectCurrentTextTrack(state)).toBeNull()
    const withTrack = {
      ...state,
      textTracks: [{ id: '0', kind: 'subtitles' as const, label: 'English', language: 'en', mode: 'showing' as const, cues: [] }],
    }
    expect(selectCurrentTextTrack(withTrack)).toBe('English')
  })

  test('selectCurrentAudioTrack', () => {
    const state = createDefaultState()
    expect(selectCurrentAudioTrack(state)).toBeNull()
    const withTrack = {
      ...state,
      audioTracks: [{ id: '0', label: 'English', language: 'en', kind: '', selected: true }],
    }
    expect(selectCurrentAudioTrack(withTrack)).toBe('English')
  })
})

// =============================================================================
// Deprecated Selectors
// =============================================================================

describe('deprecated selectors', () => {
  test('selectCanFullscreen derives from availability', () => {
    const state = { ...createDefaultState(), fullscreenAvailability: 'available' as const }
    expect(selectCanFullscreen(state)).toBe(true)
    expect(selectCanFullscreen(createDefaultState())).toBe(false)
  })

  test('selectCanPiP derives from availability', () => {
    const state = { ...createDefaultState(), pipAvailability: 'available' as const }
    expect(selectCanPiP(state)).toBe(true)
    expect(selectCanPiP(createDefaultState())).toBe(false)
  })

  test('selectCanSetVolume derives from availability', () => {
    const state = { ...createDefaultState(), volumeAvailability: 'available' as const }
    expect(selectCanSetVolume(state)).toBe(true)
    expect(selectCanSetVolume(createDefaultState())).toBe(false)
  })
})

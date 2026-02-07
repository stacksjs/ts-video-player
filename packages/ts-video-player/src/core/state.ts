/**
 * ts-video-player State Management
 *
 * Simple reactive state system for the video player.
 *
 * @module core/state
 */

import type { PlayerState, TimeRange } from '../types'

// =============================================================================
// Utilities
// =============================================================================

/**
 * Shallow equality comparison for plain objects.
 * Returns true if both objects have the same keys with === equal values.
 * Used to optimize selector subscriptions — skip notifications when
 * derived state hasn't meaningfully changed.
 */
export function shallowEqual<T extends Record<string, unknown>>(a: T, b: T): boolean {
  if (a === b) return true
  if (!a || !b) return false

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (a[key] !== b[key]) return false
  }

  return true
}

// =============================================================================
// Reactive Signal System
// =============================================================================

type Listener<T> = (value: T, prev: T) => void
type Unsubscribe = () => void

/**
 * Create a reactive signal
 */
export function createSignal<T>(initial: T): [() => T, (value: T | ((prev: T) => T)) => void] {
  let value = initial
  const listeners = new Set<Listener<T>>()

  const get = () => value

  const set = (newValue: T | ((prev: T) => T)) => {
    const prev = value
    value = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue
    if (value !== prev) {
      listeners.forEach((listener) => listener(value, prev))
    }
  }

  // Attach subscribe method to getter
  ;(get as any).subscribe = (listener: Listener<T>): Unsubscribe => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  return [get, set]
}

/**
 * Create a computed value from signals
 */
export function computed<T>(fn: () => T, deps: Array<() => unknown>): () => T {
  let value: T
  let dirty = true

  // Subscribe to all dependencies
  deps.forEach((dep) => {
    if ((dep as any).subscribe) {
      (dep as any).subscribe(() => {
        dirty = true
      })
    }
  })

  return () => {
    if (dirty) {
      value = fn()
      dirty = false
    }
    return value
  }
}

// =============================================================================
// Player State Store
// =============================================================================

/**
 * Default player state
 */
export function createDefaultState(): PlayerState {
  return {
    // Source
    src: null,
    sources: [],
    currentSourceIndex: 0,
    mediaType: 'unknown',
    streamType: 'unknown',
    providerType: 'unknown',

    // Loading
    loadingState: 'idle',
    preload: 'metadata',
    canPlay: false,
    canPlayThrough: false,
    error: null,

    // Playback
    playbackState: 'idle',
    paused: true,
    playing: false,
    started: false,
    ended: false,
    seeking: false,
    waiting: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    loop: false,
    autoplay: false,
    playsinline: true,

    // Volume
    muted: false,
    volume: 1,

    // Buffering
    buffered: [],
    bufferedAmount: 0,
    seekable: [],

    // Dimensions
    videoWidth: 0,
    videoHeight: 0,
    aspectRatio: 16 / 9,

    // Tracks
    qualities: [],
    autoQuality: true,
    audioTracks: [],
    textTracks: [],

    // Fullscreen/PiP
    fullscreen: false,
    pictureInPicture: false,
    canFullscreen: false,
    canPictureInPicture: false,

    // Feature Availability
    volumeAvailability: 'unavailable',
    fullscreenAvailability: 'unavailable',
    pipAvailability: 'unavailable',

    // UI
    controlsVisible: true,
    userActive: true,
    pointerOver: false,

    // Metadata
    title: '',
    poster: '',
  }
}

/**
 * State store for the player
 *
 * Uses microtask-coalesced notifications: multiple rapid set() calls within
 * the same microtask are batched into a single notification cycle. This prevents
 * redundant re-renders when many state fields change in quick succession
 * (e.g., timeupdate + progress + buffered all firing together).
 */
export class StateStore {
  private state: PlayerState
  private listeners = new Map<keyof PlayerState | '*', Set<(state: PlayerState, key?: keyof PlayerState) => void>>()
  private _pendingKeys: Set<keyof PlayerState> | null = null
  private _flushScheduled = false

  constructor(initial?: Partial<PlayerState>) {
    this.state = { ...createDefaultState(), ...initial }
  }

  /**
   * Get the current state
   */
  getState(): Readonly<PlayerState> {
    return this.state
  }

  /**
   * Get a specific state value
   */
  get<K extends keyof PlayerState>(key: K): PlayerState[K] {
    return this.state[key]
  }

  /**
   * Set a single state value. Notifications are coalesced via microtask.
   */
  set<K extends keyof PlayerState>(key: K, value: PlayerState[K]): void {
    if (this.state[key] === value) return

    this.state = { ...this.state, [key]: value }
    this.scheduleNotify(key)
  }

  /**
   * Batch update multiple state values. Notifications are coalesced via microtask.
   */
  batch(updates: Partial<PlayerState>): void {
    for (const [key, value] of Object.entries(updates)) {
      if (this.state[key as keyof PlayerState] !== value) {
        ;(this.state as any)[key] = value
        this.scheduleNotify(key as keyof PlayerState)
      }
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(
    keyOrListener: keyof PlayerState | '*' | ((state: PlayerState, key?: keyof PlayerState) => void),
    listener?: (state: PlayerState, key?: keyof PlayerState) => void,
  ): Unsubscribe {
    if (typeof keyOrListener === 'function') {
      // Subscribe to all changes
      const key = '*'
      if (!this.listeners.has(key)) {
        this.listeners.set(key, new Set())
      }
      this.listeners.get(key)!.add(keyOrListener)
      return () => this.listeners.get(key)?.delete(keyOrListener)
    }

    // Subscribe to specific key
    const key = keyOrListener
    if (!listener) return () => {}

    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    this.listeners.get(key)!.add(listener)
    return () => this.listeners.get(key)?.delete(listener)
  }

  /**
   * Reset state to defaults
   */
  reset(): void {
    this.state = createDefaultState()
    this._pendingKeys = null
    this._flushScheduled = false
    this.notifyAll()
  }

  /**
   * Force synchronous flush of pending notifications.
   * Useful in tests or when immediate consistency is required.
   */
  flush(): void {
    if (this._pendingKeys) {
      const keys = this._pendingKeys
      this._pendingKeys = null
      this._flushScheduled = false
      for (const key of keys) {
        this.notifyKey(key)
      }
      this.notifyAll()
    }
  }

  private scheduleNotify(key: keyof PlayerState): void {
    if (!this._pendingKeys) {
      this._pendingKeys = new Set()
    }
    this._pendingKeys.add(key)

    if (!this._flushScheduled) {
      this._flushScheduled = true
      queueMicrotask(() => this.flush())
    }
  }

  private notifyKey(key: keyof PlayerState): void {
    this.listeners.get(key)?.forEach((listener) => listener(this.state, key))
  }

  private notifyAll(): void {
    this.listeners.get('*')?.forEach((listener) => listener(this.state))
  }
}

// =============================================================================
// State Selectors (Computed Values)
// =============================================================================

/**
 * Calculate buffered percentage
 */
export function selectBufferedAmount(state: PlayerState): number {
  if (state.duration === 0 || state.buffered.length === 0) return 0

  let buffered = 0
  for (const range of state.buffered) {
    buffered += range.end - range.start
  }
  return Math.min(buffered / state.duration, 1)
}

/**
 * Calculate progress percentage
 */
export function selectProgress(state: PlayerState): number {
  if (state.duration === 0) return 0
  return Math.min(state.currentTime / state.duration, 1)
}

/**
 * Get remaining time
 */
export function selectRemainingTime(state: PlayerState): number {
  return Math.max(state.duration - state.currentTime, 0)
}

/**
 * Check if player is in idle state
 */
export function selectIsIdle(state: PlayerState): boolean {
  return state.loadingState === 'idle' && state.playbackState === 'idle'
}

/**
 * Check if player is loading
 */
export function selectIsLoading(state: PlayerState): boolean {
  return state.loadingState === 'loading' || state.waiting
}

/**
 * Check if live stream
 */
export function selectIsLive(state: PlayerState): boolean {
  return state.streamType.includes('live')
}

/**
 * Check if DVR enabled
 */
export function selectIsDVR(state: PlayerState): boolean {
  return state.streamType === 'live:dvr'
}

/**
 * Get current quality
 */
export function selectCurrentQuality(state: PlayerState): string | null {
  const selected = state.qualities.find((q) => q.selected)
  if (!selected) return state.autoQuality ? 'auto' : null
  return `${selected.height}p`
}

/**
 * Get current text track
 */
export function selectCurrentTextTrack(state: PlayerState): string | null {
  const showing = state.textTracks.find((t) => t.mode === 'showing')
  return showing?.label || null
}

/**
 * Get current audio track
 */
export function selectCurrentAudioTrack(state: PlayerState): string | null {
  const selected = state.audioTracks.find((t) => t.selected)
  return selected?.label || null
}

// =============================================================================
// Deprecated Selectors (use availability states instead)
// =============================================================================

/** @deprecated Use `state.fullscreenAvailability === 'available'` instead */
export function selectCanFullscreen(state: PlayerState): boolean {
  return state.fullscreenAvailability === 'available'
}

/** @deprecated Use `state.pipAvailability === 'available'` instead */
export function selectCanPiP(state: PlayerState): boolean {
  return state.pipAvailability === 'available'
}

/** @deprecated Use `state.volumeAvailability === 'available'` instead */
export function selectCanSetVolume(state: PlayerState): boolean {
  return state.volumeAvailability === 'available'
}

// =============================================================================
// Storage Integration
// =============================================================================

const STORAGE_KEY = 'ts-video-player'

interface StoredState {
  volume: number
  muted: boolean
  playbackRate: number
  captions: boolean
}

/**
 * Load persisted state from storage
 */
export function loadPersistedState(storage: Storage = localStorage): Partial<StoredState> {
  try {
    const data = storage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch {
    // Ignore storage errors
  }
  return {}
}

/**
 * Save state to storage
 */
export function savePersistedState(state: Partial<StoredState>, storage: Storage = localStorage): void {
  try {
    const existing = loadPersistedState(storage)
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...state }))
  } catch {
    // Ignore storage errors
  }
}

/**
 * Create storage sync for state store
 */
export function createStorageSync(
  store: StateStore,
  keys: (keyof StoredState)[] = ['volume', 'muted', 'playbackRate'],
  storage: Storage = localStorage,
): Unsubscribe {
  // Load initial values
  const persisted = loadPersistedState(storage)
  if (persisted.volume !== undefined) store.set('volume', persisted.volume)
  if (persisted.muted !== undefined) store.set('muted', persisted.muted)
  if (persisted.playbackRate !== undefined) store.set('playbackRate', persisted.playbackRate)

  // Subscribe to changes
  const unsubscribes = keys.map((key) =>
    store.subscribe(key as keyof PlayerState, (state) => {
      const value = state[key as keyof PlayerState]
      savePersistedState({ [key]: value } as Partial<StoredState>, storage)
    }),
  )

  return () => unsubscribes.forEach((unsub) => unsub())
}

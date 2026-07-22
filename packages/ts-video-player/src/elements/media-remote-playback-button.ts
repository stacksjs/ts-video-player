/**
 * ts-video-player <media-remote-playback-button> Custom Element
 *
 * Uses the browser Remote Playback API for native device pickers such as
 * Google Cast without loading a vendor SDK.
 *
 * @module elements/media-remote-playback-button
 */

import { HTMLElementBase } from './base'
import { resolvePlayer } from './utils'

const REMOTE_ICON = 'M1 18v3h3a3 3 0 0 0-3-3zm0-4v2a5 5 0 0 1 5 5h2a7 7 0 0 0-7-7zm0-4v2c5 0 9 4 9 9h2c0-6.1-4.9-11-11-11zm18-7H5a2 2 0 0 0-2 2v3h2V5h14v10h-5v2h5a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z'

interface RemotePlaybackHandle extends EventTarget {
  state: 'connecting' | 'connected' | 'disconnected'
  prompt: () => Promise<void>
  watchAvailability: (_callback: (_available: boolean) => void) => Promise<number>
  cancelWatchAvailability: (_id: number) => Promise<void>
}

export class MediaRemotePlaybackButton extends HTMLElementBase {
  private cleanup: (() => void) | null = null

  connectedCallback(): void {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: 'open' })
      shadow.innerHTML = `
        <style>
          :host { display: none; }
          :host([available]) { display: inline-flex; }
          button { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; padding: 8px; background: transparent; border: 0; color: inherit; cursor: pointer; }
          button:hover { opacity: 0.8; }
          :host([connected]) button { color: var(--media-remote-active-color, #38bdf8); }
        </style>
        <button part="button" type="button" aria-label="Play on another device">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" part="icon"><path d="${REMOTE_ICON}"/></svg>
        </button>
      `
    }
    queueMicrotask(() => this.attach())
  }

  disconnectedCallback(): void {
    this.cleanup?.()
    this.cleanup = null
  }

  private attach(): void {
    const player = resolvePlayer(this)
    const button = this.shadowRoot?.querySelector('button')
    if (!player || !button) return
    let remote: RemotePlaybackHandle | null = null
    let watchId: number | null = null
    let generation = 0

    const stateChanged = (): void => {
      const connected = remote?.state === 'connected'
      this.toggleAttribute('connected', connected)
      button.setAttribute('aria-pressed', String(connected))
    }
    const detachRemote = (): void => {
      generation++
      remote?.removeEventListener('connecting', stateChanged)
      remote?.removeEventListener('connect', stateChanged)
      remote?.removeEventListener('disconnect', stateChanged)
      if (remote && watchId !== null) void remote.cancelWatchAvailability(watchId).catch(() => {})
      remote = null
      watchId = null
      this.removeAttribute('available')
      this.removeAttribute('connected')
    }
    const update = (): void => {
      const media = player.provider?.mediaElement
      const nextRemote = media instanceof HTMLMediaElement
        ? (media as HTMLMediaElement & { remote?: RemotePlaybackHandle }).remote ?? null
        : null
      if (nextRemote === remote) return
      detachRemote()
      if (!nextRemote) return
      remote = nextRemote
      const currentGeneration = generation
      remote.addEventListener('connecting', stateChanged)
      remote.addEventListener('connect', stateChanged)
      remote.addEventListener('disconnect', stateChanged)
      stateChanged()
      void remote.watchAvailability((available) => {
        if (generation === currentGeneration && remote === nextRemote) this.toggleAttribute('available', available)
      })
        .then((id) => {
          if (generation === currentGeneration && remote === nextRemote) watchId = id
          else void nextRemote.cancelWatchAvailability(id).catch(() => {})
        })
        .catch(() => this.removeAttribute('available'))
    }
    const click = (): void => {
      void remote?.prompt().catch(() => {})
    }
    button.addEventListener('click', click)
    const unsubscribe = player.subscribe(update)
    update()
    this.cleanup = () => {
      unsubscribe()
      button.removeEventListener('click', click)
      detachRemote()
    }
  }
}

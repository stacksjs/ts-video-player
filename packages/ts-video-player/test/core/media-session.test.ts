import { describe, expect, test } from 'bun:test'
import { isMediaSessionSupported } from '../../src/core/media-session'

describe('media-session', () => {
  test('isMediaSessionSupported returns false in non-browser env', () => {
    // In Bun test env, navigator.mediaSession is not available
    expect(isMediaSessionSupported()).toBe(false)
  })
})

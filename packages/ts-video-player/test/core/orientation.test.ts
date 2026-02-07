import { describe, expect, test } from 'bun:test'
import { isOrientationLockSupported, lockOrientation, unlockOrientation } from '../../src/core/orientation'

describe('orientation', () => {
  test('isOrientationLockSupported returns false in non-browser env', () => {
    expect(isOrientationLockSupported()).toBe(false)
  })

  test('lockOrientation does not throw when unsupported', () => {
    expect(() => lockOrientation('landscape')).not.toThrow()
  })

  test('unlockOrientation does not throw when unsupported', () => {
    expect(() => unlockOrientation()).not.toThrow()
  })
})

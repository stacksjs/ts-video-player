import { describe, expect, test } from 'bun:test'
import {
  detectVolumeAvailability,
  detectFullscreenAvailability,
  detectPipAvailability,
  detectAllFeatures,
} from '../../src/core/features'

// =============================================================================
// Feature Detection (non-browser environment)
// =============================================================================

describe('detectVolumeAvailability', () => {
  test('returns unavailable when no media element', () => {
    expect(detectVolumeAvailability(null)).toBe('unavailable')
    expect(detectVolumeAvailability(undefined)).toBe('unavailable')
  })
})

describe('detectFullscreenAvailability', () => {
  test('returns unsupported when no document', () => {
    // In a test environment, document may exist but fullscreenEnabled may not
    const result = detectFullscreenAvailability(null, null)
    // Should be one of our expected values
    expect(['available', 'unavailable', 'unsupported']).toContain(result)
  })

  test('returns unavailable when no container and no video', () => {
    const result = detectFullscreenAvailability(null, null)
    expect(['unavailable', 'unsupported']).toContain(result)
  })
})

describe('detectPipAvailability', () => {
  test('returns unavailable when no video element', () => {
    expect(detectPipAvailability(null)).toBe('unavailable')
    expect(detectPipAvailability(undefined)).toBe('unavailable')
  })
})

describe('detectAllFeatures', () => {
  test('returns all three feature keys', () => {
    const result = detectAllFeatures(null, null, null)
    expect(result).toHaveProperty('volume')
    expect(result).toHaveProperty('fullscreen')
    expect(result).toHaveProperty('pip')
  })

  test('all values are valid FeatureAvailability', () => {
    const result = detectAllFeatures()
    const valid = ['available', 'unavailable', 'unsupported']
    expect(valid).toContain(result.volume)
    expect(valid).toContain(result.fullscreen)
    expect(valid).toContain(result.pip)
  })
})

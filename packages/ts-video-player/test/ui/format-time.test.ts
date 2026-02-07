import { describe, expect, test } from 'bun:test'
import { formatTime } from '../../src/ui/components'
import { formatTimePhrase, toISODuration } from '../../src/elements/utils'

// =============================================================================
// formatTime (from ui/components)
// =============================================================================

describe('formatTime', () => {
  test('formats 0 seconds', () => {
    expect(formatTime(0)).toBe('0:00')
  })

  test('formats seconds only', () => {
    expect(formatTime(5)).toBe('0:05')
    expect(formatTime(30)).toBe('0:30')
  })

  test('formats minutes and seconds', () => {
    expect(formatTime(65)).toBe('1:05')
    expect(formatTime(125)).toBe('2:05')
    expect(formatTime(600)).toBe('10:00')
  })

  test('formats hours, minutes, seconds', () => {
    expect(formatTime(3661)).toBe('1:01:01')
    expect(formatTime(7200)).toBe('2:00:00')
    expect(formatTime(3600)).toBe('1:00:00')
  })

  test('handles NaN', () => {
    expect(formatTime(NaN)).toBe('0:00')
  })

  test('handles Infinity', () => {
    expect(formatTime(Infinity)).toBe('0:00')
  })

  test('handles negative Infinity', () => {
    expect(formatTime(-Infinity)).toBe('0:00')
  })

  test('handles negative numbers', () => {
    expect(formatTime(-65)).toBe('-1:05')
    expect(formatTime(-5)).toBe('-0:05')
    expect(formatTime(-3661)).toBe('-1:01:01')
  })

  test('pads seconds correctly', () => {
    expect(formatTime(61)).toBe('1:01')
    expect(formatTime(69)).toBe('1:09')
  })
})

// =============================================================================
// formatTimePhrase (from elements/utils)
// =============================================================================

describe('formatTimePhrase', () => {
  test('formats 0 seconds', () => {
    expect(formatTimePhrase(0)).toBe('0 seconds')
  })

  test('formats singular units', () => {
    expect(formatTimePhrase(1)).toBe('1 second')
    expect(formatTimePhrase(60)).toBe('1 minute')
    expect(formatTimePhrase(3600)).toBe('1 hour')
  })

  test('formats plural units', () => {
    expect(formatTimePhrase(2)).toBe('2 seconds')
    expect(formatTimePhrase(120)).toBe('2 minutes')
    expect(formatTimePhrase(7200)).toBe('2 hours')
  })

  test('formats combined', () => {
    expect(formatTimePhrase(90)).toBe('1 minute, 30 seconds')
    expect(formatTimePhrase(3661)).toBe('1 hour, 1 minute, 1 second')
  })

  test('handles NaN', () => {
    expect(formatTimePhrase(NaN)).toBe('0 seconds')
  })
})

// =============================================================================
// toISODuration (from elements/utils)
// =============================================================================

describe('toISODuration', () => {
  test('formats 0', () => {
    expect(toISODuration(0)).toBe('PT0S')
  })

  test('formats seconds only', () => {
    expect(toISODuration(30)).toBe('PT30S')
  })

  test('formats minutes', () => {
    expect(toISODuration(90)).toBe('PT1M30S')
  })

  test('formats hours', () => {
    expect(toISODuration(3661)).toBe('PT1H1M1S')
  })

  test('formats without zero components', () => {
    expect(toISODuration(3600)).toBe('PT1H')
    expect(toISODuration(60)).toBe('PT1M')
  })

  test('handles NaN', () => {
    expect(toISODuration(NaN)).toBe('PT0S')
  })
})

import { describe, expect, test } from 'bun:test'
import { computePosition } from '../../src/core/popover'

// Mock elements with getBoundingClientRect
function mockElement(rect: { top: number; left: number; width: number; height: number }) {
  return {
    getBoundingClientRect: () => ({
      top: rect.top,
      left: rect.left,
      bottom: rect.top + rect.height,
      right: rect.left + rect.width,
      width: rect.width,
      height: rect.height,
      x: rect.left,
      y: rect.top,
      toJSON: () => {},
    }),
    offsetParent: null,
    offsetWidth: rect.width,
    offsetHeight: rect.height,
  } as unknown as HTMLElement
}

// Simulates a viewport-sized boundary
const viewport = mockElement({ top: 0, left: 0, width: 1024, height: 768 })

describe('computePosition', () => {
  test('places popover above anchor by default', () => {
    const anchor = mockElement({ top: 300, left: 200, width: 40, height: 40 })
    const popover = mockElement({ top: 0, left: 0, width: 160, height: 100 })

    const result = computePosition(anchor, popover, { placement: 'top', boundary: viewport })

    // Should be above anchor
    expect(result.top).toBeLessThan(300)
    expect(result.placement).toContain('top')
  })

  test('flips to bottom when no space above', () => {
    const anchor = mockElement({ top: 10, left: 200, width: 40, height: 40 })
    const popover = mockElement({ top: 0, left: 0, width: 160, height: 100 })

    const result = computePosition(anchor, popover, { placement: 'top', offset: 4, padding: 8, boundary: viewport })

    // Should flip to bottom
    expect(result.top).toBeGreaterThanOrEqual(50) // anchor bottom
    expect(result.placement).toContain('bottom')
  })

  test('respects top-end alignment', () => {
    const anchor = mockElement({ top: 300, left: 600, width: 40, height: 40 })
    const popover = mockElement({ top: 0, left: 0, width: 160, height: 100 })

    const result = computePosition(anchor, popover, { placement: 'top-end', boundary: viewport })

    // Should be above
    expect(result.placement).toContain('top')
    // Right edge of popover should align near right edge of anchor
    // anchor right = 640, popover left should be 640 - 160 = 480
    expect(result.left).toBe(480)
  })

  test('clamps to viewport boundaries', () => {
    const anchor = mockElement({ top: 300, left: 5, width: 40, height: 40 })
    const popover = mockElement({ top: 0, left: 0, width: 160, height: 100 })

    const result = computePosition(anchor, popover, { placement: 'top-start', padding: 8, boundary: viewport })

    // Left should be clamped to padding
    expect(result.left).toBeGreaterThanOrEqual(8)
  })

  test('uses custom boundary element', () => {
    const anchor = mockElement({ top: 300, left: 200, width: 40, height: 40 })
    const popover = mockElement({ top: 0, left: 0, width: 160, height: 100 })
    const boundary = mockElement({ top: 100, left: 100, width: 400, height: 300 })

    const result = computePosition(anchor, popover, {
      placement: 'top',
      boundary,
      padding: 8,
    })

    // Should be within boundary
    expect(result.left).toBeGreaterThanOrEqual(108) // boundary left + padding
  })

  test('uses custom offset', () => {
    const anchor = mockElement({ top: 300, left: 200, width: 40, height: 40 })
    const popover = mockElement({ top: 0, left: 0, width: 160, height: 100 })

    const result4 = computePosition(anchor, popover, { placement: 'top', offset: 4, boundary: viewport })
    const result20 = computePosition(anchor, popover, { placement: 'top', offset: 20, boundary: viewport })

    // Larger offset = more distance from anchor
    expect(result20.top).toBeLessThan(result4.top)
  })
})

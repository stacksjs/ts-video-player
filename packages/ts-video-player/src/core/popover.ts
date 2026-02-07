/**
 * ts-video-player Popover Positioning
 *
 * Collision-aware positioning for menus and tooltips.
 *
 * @module core/popover
 */

export interface Rect {
  top: number
  left: number
  bottom: number
  right: number
  width: number
  height: number
}

export type Placement = 'top' | 'bottom' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'

export interface PositionOptions {
  /** Preferred placement */
  placement?: Placement
  /** Gap between anchor and popover in px */
  offset?: number
  /** Boundary element (defaults to viewport) */
  boundary?: HTMLElement | null
  /** Minimum distance from boundary edges in px */
  padding?: number
}

export interface PositionResult {
  top: number
  left: number
  placement: Placement
}

/**
 * Calculate the position of a popover relative to an anchor element,
 * flipping when it would overflow the boundary.
 */
export function computePosition(
  anchor: HTMLElement,
  popover: HTMLElement,
  options: PositionOptions = {},
): PositionResult {
  const {
    placement = 'top',
    offset = 4,
    boundary = null,
    padding = 8,
  } = options

  const anchorRect = anchor.getBoundingClientRect()
  const popoverRect = popover.getBoundingClientRect()

  const boundaryRect = boundary
    ? boundary.getBoundingClientRect()
    : { top: 0, left: 0, bottom: window.innerHeight, right: window.innerWidth, width: window.innerWidth, height: window.innerHeight }

  const availableTop = anchorRect.top - boundaryRect.top - padding
  const availableBottom = boundaryRect.bottom - anchorRect.bottom - padding

  // Determine vertical placement (flip if needed)
  let vertical: 'top' | 'bottom'
  if (placement.startsWith('top')) {
    vertical = popoverRect.height + offset <= availableTop ? 'top' : 'bottom'
  } else {
    vertical = popoverRect.height + offset <= availableBottom ? 'bottom' : 'top'
  }

  // Calculate top
  let top: number
  if (vertical === 'top') {
    top = anchorRect.top - popoverRect.height - offset
  } else {
    top = anchorRect.bottom + offset
  }

  // Determine horizontal alignment
  let align: '' | '-start' | '-end' = ''
  if (placement.endsWith('-start')) align = '-start'
  else if (placement.endsWith('-end')) align = '-end'

  // Calculate left
  let left: number
  switch (align) {
    case '-start':
      left = anchorRect.left
      break
    case '-end':
      left = anchorRect.right - popoverRect.width
      break
    default:
      left = anchorRect.left + (anchorRect.width - popoverRect.width) / 2
      break
  }

  // Clamp horizontal to boundary
  const minLeft = boundaryRect.left + padding
  const maxLeft = boundaryRect.right - popoverRect.width - padding
  left = Math.max(minLeft, Math.min(maxLeft, left))

  // Clamp vertical to boundary
  const minTop = boundaryRect.top + padding
  const maxTop = boundaryRect.bottom - popoverRect.height - padding
  top = Math.max(minTop, Math.min(maxTop, top))

  const finalPlacement: Placement = `${vertical}${align}` as Placement

  return { top, left, placement: finalPlacement }
}

/**
 * Apply computed position to a popover element using absolute positioning
 * relative to an offset parent.
 */
export function applyPosition(
  anchor: HTMLElement,
  popover: HTMLElement,
  options: PositionOptions = {},
): Placement {
  // Temporarily make visible for measurement
  const prevVisibility = popover.style.visibility
  popover.style.visibility = 'hidden'
  popover.style.display = 'block'

  const result = computePosition(anchor, popover, options)

  // Convert to relative coordinates if popover has an offset parent
  const offsetParent = popover.offsetParent as HTMLElement | null
  if (offsetParent) {
    const parentRect = offsetParent.getBoundingClientRect()
    popover.style.top = `${result.top - parentRect.top}px`
    popover.style.left = `${result.left - parentRect.left}px`
  } else {
    popover.style.top = `${result.top}px`
    popover.style.left = `${result.left}px`
  }

  popover.style.visibility = prevVisibility

  return result.placement
}

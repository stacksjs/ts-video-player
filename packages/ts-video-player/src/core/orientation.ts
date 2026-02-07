/**
 * ts-video-player Orientation Lock
 *
 * Auto-lock screen orientation to landscape when entering fullscreen on mobile.
 *
 * @module core/orientation
 */

type OrientationType = 'landscape' | 'portrait' | 'any'

interface ScreenOrientationAPI {
  lock(orientation: string): Promise<void>
  unlock(): void
}

/**
 * Check if Screen Orientation API is available
 */
export function isOrientationLockSupported(): boolean {
  return (
    typeof screen !== 'undefined' &&
    'orientation' in screen &&
    typeof (screen.orientation as ScreenOrientationAPI).lock === 'function'
  )
}

/**
 * Lock the screen orientation (best-effort, silently fails if unsupported)
 */
export function lockOrientation(type: OrientationType): void {
  if (!isOrientationLockSupported()) return

  const orientationMap: Record<OrientationType, string> = {
    landscape: 'landscape',
    portrait: 'portrait',
    any: 'any',
  }

  ;(screen.orientation as ScreenOrientationAPI)
    .lock(orientationMap[type])
    .catch(() => {
      // Orientation lock may fail if not in fullscreen or unsupported
    })
}

/**
 * Unlock the screen orientation
 */
export function unlockOrientation(): void {
  if (!isOrientationLockSupported()) return

  try {
    ;(screen.orientation as ScreenOrientationAPI).unlock()
  } catch {
    // Unlock may fail if lock was never acquired
  }
}

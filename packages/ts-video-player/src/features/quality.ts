/**
 * Quality feature — quality selection state.
 *
 * @module features/quality
 */

import type { Feature, FeatureContext } from './types'

export const quality: Feature = {
  name: 'quality',
  stateKeys: ['qualities', 'autoQuality'],

  setup(_ctx: FeatureContext) {
    // Quality management is provider-specific (HLS/DASH).
    // This feature exists as a placeholder for the state keys
    // and to allow tree-shaking when quality UI is not needed.
    return undefined
  },
}

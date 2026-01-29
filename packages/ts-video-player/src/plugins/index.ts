/**
 * Video Player Plugins
 *
 * Optional plugins for extended functionality.
 *
 * @module plugins
 */

// Analytics
export {
  VideoAnalytics,
  createVideoAnalytics,
  analyticsPlugin,
  type VideoEventName,
  type VideoAnalyticsConfig,
} from './analytics'

// Ads (VAST/VPAID)
export {
  VASTParser,
  AdsManager,
  createAdsManager,
  adsPlugin,
  type Ad,
  type AdMediaFile,
  type AdBreak,
  type AdConfig,
  type AdState,
} from './ads'

// Skip Segments
export {
  SkipSegmentsManager,
  createSkipSegments,
  skipSegmentsPlugin,
  type SegmentType,
  type SkipSegment,
  type SkipSegmentsConfig,
  type SkipSegmentsState,
} from './skip-segments'

// End Screen
export {
  EndScreenManager,
  createEndScreen,
  endScreenPlugin,
  type EndScreenRecommendation,
  type EndScreenConfig,
  type EndScreenState,
} from './end-screen'

// Watermarks
export {
  WatermarkManager,
  createWatermarkManager,
  watermarkPlugin,
  type WatermarkPosition,
  type WatermarkConfig,
  type WatermarkAnimation,
  type DynamicWatermark,
} from './watermark'

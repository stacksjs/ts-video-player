/**
 * ts-video-player CDN Entry Point
 *
 * Registers the library on `window.VideoPlayer` for script-tag usage.
 * This file has side effects and should be listed in package.json sideEffects.
 *
 * @module cdn
 */

import { createPlayer, Player } from './player'
import { EventEmitter } from './core/events'
import { StateStore } from './core/state'
import { HTML5Provider } from './providers/html5'
import { YouTubeProvider } from './providers/youtube'
import { HLSProvider } from './providers/hls'
import { DASHProvider } from './providers/dash'
import { applyTheme, presetThemes } from './core/themes'
import { I18n, t } from './core/i18n'
import { layouts, createLayoutManager } from './layouts'
import {
  VideoAnalytics, analyticsPlugin,
  AdsManager, adsPlugin,
  SkipSegmentsManager, skipSegmentsPlugin,
  EndScreenManager, endScreenPlugin,
  WatermarkManager, watermarkPlugin,
} from './plugins'
import { registerElements } from './elements'

if (typeof window !== 'undefined') {
  (window as any).VideoPlayer = {
    createPlayer,
    Player,
    EventEmitter,
    StateStore,
    HTML5Provider,
    YouTubeProvider,
    HLSProvider,
    DASHProvider,
    applyTheme,
    presetThemes,
    I18n,
    t,
    layouts,
    createLayoutManager,
    registerElements,
    plugins: {
      VideoAnalytics,
      analyticsPlugin,
      AdsManager,
      adsPlugin,
      SkipSegmentsManager,
      skipSegmentsPlugin,
      EndScreenManager,
      endScreenPlugin,
      WatermarkManager,
      watermarkPlugin,
    },
  }
}

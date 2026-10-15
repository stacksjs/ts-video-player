import { describe, expect, test } from 'bun:test'
import { defaultTranslations, englishStrings } from '../../src/core/i18n'
import { formatTimePhrase, label, languageOf } from '../../src/elements/utils'

/** A node under `lang`, the way a control sits in a page: closest() finds the attribute. */
function under(lang: string | null, host?: unknown): any {
  return {
    closest: (selector: string) => (selector === '[lang]' && lang ? { getAttribute: () => lang } : null),
    getRootNode: () => (host ? { host } : {}),
  }
}

describe('control labels follow the page language', () => {
  test('a control reads the nearest lang above it', () => {
    expect(languageOf(under('de'))).toBe('de')
    expect(label(under('de'), 'play')).toBe('Abspielen')
    expect(label(under('de-AT'), 'pause')).toBe('Pause')
    expect(label(under('de'), 'seekForward', { seconds: 10 })).toBe('10 Sekunden vor')
    expect(label(under('en'), 'seekBackward', { seconds: 10 })).toBe('Seek backward 10 seconds')
  })

  test('the player inside <video-player>\'s shadow root reads the host page\'s language', () => {
    const inShadow = under(null, under('fr'))
    expect(languageOf(inShadow)).toBe('fr')
    expect(label(inShadow, 'videoPlayer')).toBe('Lecteur vidéo')
  })

  test('a language with no translations falls back to English', () => {
    expect(label(under('nl'), 'mute')).toBe('Mute')
  })

  test('screen-reader times are spoken in the page language', () => {
    expect(formatTimePhrase(90, under('de'))).toBe('1 Minute, 30 Sekunden')
    expect(formatTimePhrase(3661, under('en'))).toBe('1 hour, 1 minute, 1 second')
  })

  test('every language has every key', () => {
    const keys = Object.keys(englishStrings).sort()
    for (const [lang, strings] of Object.entries(defaultTranslations))
      expect(Object.keys(strings).sort(), lang).toEqual(keys)
  })
})

describe('I18n without a language', () => {
  test('detects the browser language instead of throwing', async () => {
    const { createI18n } = await import('../../src/core/i18n')
    const i18n = createI18n()
    expect(typeof i18n.getLanguage()).toBe('string')
    expect(i18n.t('play')).toBeTruthy()
  })
})

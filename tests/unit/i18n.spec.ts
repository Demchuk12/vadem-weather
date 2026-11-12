import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  detectBrowserLocale,
  messages,
  SUPPORTED_LOCALES,
  translate,
  type MessageKey,
} from '@/i18n'

function keys(node: object, prefix = ''): string[] {
  return Object.entries(node).flatMap(([key, value]) =>
    typeof value === 'object' ? keys(value, `${prefix}${key}.`) : [`${prefix}${key}`],
  )
}

describe('i18n', () => {
  afterEach(() => vi.restoreAllMocks())

  it('has the same keys in every locale', () => {
    expect(keys(messages.uk).sort()).toEqual(keys(messages.en).sort())
  })

  it('has no empty translations', () => {
    for (const locale of SUPPORTED_LOCALES) {
      for (const key of keys(messages[locale])) {
        expect(translate(locale, key as MessageKey).trim()).not.toBe('')
      }
    }
  })

  it('interpolates params', () => {
    expect(translate('en', 'favorites.counter', { count: 2, n: 5 })).toBe('2 of 5')
    expect(translate('uk', 'favorites.counter', { count: 2, n: 5 })).toBe('2 з 5')
  })

  it('keeps unknown placeholders and unknown keys visible', () => {
    expect(translate('en', 'favorites.counter', { count: 1 })).toBe('1 of {n}')
    expect(translate('en', 'no.such.key' as never)).toBe('no.such.key')
  })

  it('detects the browser locale with Ukrainian as default', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US')
    expect(detectBrowserLocale()).toBe('en')
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('pl-PL')
    expect(detectBrowserLocale()).toBe('uk')
  })
})

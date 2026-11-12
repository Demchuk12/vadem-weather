import { describe, expect, it } from 'vitest'
import { translate } from '@/i18n'
import { cityId, countryFlag, uniqueCities } from '@/utils/city'
import { compassPoint, formatTemp } from '@/utils/format'
import { cityDateKey, formatTime } from '@/utils/time'

describe('formatTemp', () => {
  it('adds a sign and never prints -0', () => {
    expect(formatTemp(3.6)).toBe('+4°')
    expect(formatTemp(-0.2)).toBe('0°')
    expect(formatTemp(-7.5)).toBe('-7°')
  })
})

describe('compassPoint', () => {
  it('maps degrees to 8 directions', () => {
    expect(compassPoint(0)).toBe('N')
    expect(compassPoint(95)).toBe('E')
    expect(compassPoint(350)).toBe('N')
    expect(compassPoint(-45)).toBe('NW')
  })
})

describe('time in city timezone', () => {
  const dt = Date.UTC(2026, 0, 1, 22, 30) / 1000

  it('shifts the date by the city offset', () => {
    expect(cityDateKey(dt, 0)).toBe('2026-01-01')
    expect(cityDateKey(dt, 3 * 3600)).toBe('2026-01-02')
  })

  it('formats wall-clock time of the city', () => {
    expect(formatTime(dt, 2 * 3600, 'en')).toBe('00:30')
  })
})

describe('city helpers', () => {
  it('builds a stable id from coordinates', () => {
    expect(cityId(50.4501, 30.5234)).toBe('50.45:30.52')
  })

  it('removes duplicates', () => {
    const city = { id: '1:1', name: 'Lviv', country: 'UA', lat: 1, lon: 1 }
    expect(uniqueCities([city, { ...city, id: '1.01:1' }])).toHaveLength(1)
  })

  it('creates a flag emoji', () => {
    expect(countryFlag('ua')).toBe('🇺🇦')
    expect(countryFlag('')).toBe('')
  })
})

describe('translate', () => {
  it('interpolates params', () => {
    expect(translate('en', 'favorites.counter', { count: 2, n: 5 })).toBe('2 of 5')
    expect(translate('uk', 'favorites.counter', { count: 2, n: 5 })).toBe('2 з 5')
  })
})

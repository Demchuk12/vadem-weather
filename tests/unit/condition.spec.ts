import { describe, expect, it } from 'vitest'
import { conditionGroup, periodFromIcon, severity, toCondition } from '@/utils/condition'

describe('conditionGroup', () => {
  it.each([
    [200, 'storm'],
    [232, 'storm'],
    [300, 'rain'],
    [321, 'rain'],
    [500, 'rain'],
    [511, 'snow'],
    [531, 'rain'],
    [600, 'snow'],
    [622, 'snow'],
    [701, 'mist'],
    [781, 'mist'],
    [800, 'clear'],
    [801, 'partly'],
    [802, 'partly'],
    [803, 'clouds'],
    [804, 'clouds'],
  ])('maps OWM code %i to %s', (id, group) => {
    expect(conditionGroup(id)).toBe(group)
  })

  it('falls back to clouds for an unknown series', () => {
    expect(conditionGroup(999)).toBe('clouds')
  })
})

describe('severity', () => {
  it('orders groups from the lightest to the heaviest', () => {
    expect(severity('clear')).toBeLessThan(severity('partly'))
    expect(severity('rain')).toBeLessThan(severity('snow'))
    expect(severity('snow')).toBeLessThan(severity('storm'))
  })
})

describe('toCondition', () => {
  it('maps a dto', () => {
    expect(toCondition({ id: 500, main: 'Rain', description: 'light rain', icon: '10d' })).toEqual({
      id: 500,
      group: 'rain',
      description: 'light rain',
    })
  })

  it('returns clear sky when the dto is missing', () => {
    expect(toCondition(undefined)).toEqual({ id: 800, group: 'clear', description: '' })
  })
})

describe('periodFromIcon', () => {
  it('reads the day/night suffix', () => {
    expect(periodFromIcon('01d')).toBe('day')
    expect(periodFromIcon('01n')).toBe('night')
    expect(periodFromIcon(undefined)).toBe('day')
  })
})

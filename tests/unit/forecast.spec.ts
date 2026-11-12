import { describe, expect, it } from 'vitest'
import type { HourlyForecast } from '@/types'
import { conditionGroup } from '@/utils/condition'
import {
  aggregateDaily,
  currentAsHourly,
  dominantCondition,
  filterByPeriod,
  mapCurrent,
  mapHourly,
  periodStats,
} from '@/utils/forecast'
import { currentDto, forecastItem, KYIV_TZ } from '../fixtures/openweather'

const START = Date.UTC(2026, 10, 12, 0, 0, 0) / 1000 - KYIV_TZ

function sample(hoursFromStart: number, temp: number, id = 800): HourlyForecast {
  const localHour = hoursFromStart % 24
  return {
    dt: START + hoursFromStart * 3600,
    temp,
    feelsLike: temp - 1,
    pop: 0,
    condition: { id, group: conditionGroup(id), description: '' },
    period: localHour >= 6 && localHour < 18 ? 'day' : 'night',
  }
}

describe('mappers', () => {
  it('maps the current weather dto', () => {
    const current = mapCurrent(currentDto({ temp: 3.2, conditionId: 500, pod: 'n' }))
    expect(current).toMatchObject({
      temp: 3.2,
      feelsLike: 6.1,
      humidity: 64,
      windSpeed: 3.6,
      visibility: 10000,
      period: 'night',
      condition: { id: 500, group: 'rain' },
    })
  })

  it('maps a forecast item and its part of day', () => {
    const night = mapHourly(forecastItem(START, 1))
    const day = mapHourly(forecastItem(START + 12 * 3600, 9, KYIV_TZ, 600))
    expect(night).toMatchObject({ temp: 1, period: 'night', pop: 0.4 })
    expect(day).toMatchObject({ temp: 9, period: 'day', condition: { group: 'snow' } })
  })

  it('converts the current weather into the first hourly point', () => {
    const current = mapCurrent(currentDto({ temp: 4 }))
    expect(currentAsHourly(current, 0.7)).toMatchObject({ dt: current.dt, temp: 4, pop: 0.7 })
  })
})

describe('aggregateDaily', () => {
  const samples = Array.from({ length: 16 }, (_, i) => sample(i * 3, i < 8 ? 10 + i : 20))
  const days = aggregateDaily(samples, KYIV_TZ, 5)

  it('groups samples by the local calendar date of the city', () => {
    expect(days.map((d) => d.date)).toEqual(['2026-11-12', '2026-11-13'])
    expect(days[0]?.samples).toBe(8)
  })

  it('respects the city timezone when grouping', () => {
    const shifted = aggregateDaily(samples, KYIV_TZ + 3 * 3600, 5)
    expect(shifted[0]?.samples).toBe(7)
  })

  it('averages the hourly temperatures of a day', () => {
    expect(days[0]).toMatchObject({ tempAvg: 13.5, tempMin: 10, tempMax: 17 })
    expect(days[1]?.tempAvg).toBe(20)
  })

  it('splits day and night statistics', () => {
    expect(days[0]?.day).toMatchObject({ tempAvg: 13.5, tempMin: 12, tempMax: 15 })
    expect(days[0]?.night).toMatchObject({ tempAvg: 13.5, tempMin: 10, tempMax: 17 })
  })

  it('uses the sample closest to local noon as the representative timestamp', () => {
    expect(days[0]?.dt).toBe(START + 12 * 3600)
  })

  it('limits the number of days', () => {
    expect(aggregateDaily(samples, KYIV_TZ, 1)).toHaveLength(1)
  })
})

describe('dominantCondition', () => {
  it('picks the most frequent group', () => {
    const result = dominantCondition([sample(9, 1, 800), sample(12, 1, 500), sample(15, 1, 500)])
    expect(result.group).toBe('rain')
  })

  it('prefers the heavier condition on a tie', () => {
    expect(dominantCondition([sample(9, 1, 800), sample(12, 1, 200)]).group).toBe('storm')
  })

  it('returns clear sky for no samples', () => {
    expect(dominantCondition([]).group).toBe('clear')
  })
})

describe('periodStats and filterByPeriod', () => {
  it('returns null for an empty list', () => {
    expect(periodStats([])).toBeNull()
  })

  it('keeps only samples of the requested period', () => {
    const items = [sample(3, 1), sample(9, 2), sample(21, 3)]
    expect(filterByPeriod(items, 'day').map((s) => s.temp)).toEqual([2])
    expect(filterByPeriod(items, 'night').map((s) => s.temp)).toEqual([1, 3])
  })
})

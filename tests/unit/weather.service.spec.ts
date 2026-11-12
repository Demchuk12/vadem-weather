import { describe, expect, it } from 'vitest'
import { FORECAST_DAYS, HOURLY_SAMPLES } from '@/constants'
import { fetchWeatherBundle } from '@/services/weather.service'
import { currentDto, forecastDto } from '../fixtures/openweather'
import { jsonResponse, mockFetch } from './helpers'

const NOW = Date.UTC(2026, 10, 12, 10, 0, 0) / 1000

describe('fetchWeatherBundle', () => {
  function mockApi() {
    return mockFetch((url) =>
      jsonResponse(
        url.pathname.endsWith('/forecast')
          ? forecastDto({ now: NOW })
          : currentDto({ now: NOW, temp: 7 }),
      ),
    )
  }

  it('loads current weather and forecast in parallel', async () => {
    const fetchMock = mockApi()
    await fetchWeatherBundle({ lat: 1, lon: 2 }, 'uk')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('starts the hourly series with "now" followed by the next 24 hours', async () => {
    mockApi()
    const { hourly, current } = await fetchWeatherBundle({ lat: 1, lon: 2 }, 'uk')

    expect(hourly).toHaveLength(HOURLY_SAMPLES)
    expect(hourly[0]).toMatchObject({ dt: current.dt, temp: 7 })
    expect(hourly.slice(1).every((point) => point.dt > current.dt)).toBe(true)
    expect(hourly.at(-1)!.dt - hourly[1]!.dt).toBe(21 * 3600)
  })

  it('aggregates the forecast into days in the city timezone', async () => {
    mockApi()
    const { daily, timezone } = await fetchWeatherBundle({ lat: 1, lon: 2 }, 'uk')

    expect(timezone).toBe(7200)
    expect(daily).toHaveLength(FORECAST_DAYS)
    expect(new Set(daily.map((day) => day.date)).size).toBe(FORECAST_DAYS)
  })
})

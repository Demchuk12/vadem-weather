import { describe, expect, it } from 'vitest'
import { openWeatherApi } from '@/api'
import { currentDto, forecastDto, GEO_KYIV } from '../fixtures/openweather'
import { jsonResponse, mockFetch } from './helpers'

describe('openWeatherApi', () => {
  it('requests current weather in metric units with the api key and language', async () => {
    const fetchMock = mockFetch(() => jsonResponse(currentDto()))
    await openWeatherApi.getCurrentWeather({ lat: 50.45, lon: 30.52, lang: 'uk' })

    const url = new URL(String(fetchMock.mock.calls[0]?.[0]))
    expect(url.origin + url.pathname).toBe('https://api.openweathermap.org/data/2.5/weather')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      lat: '50.45',
      lon: '30.52',
      lang: 'uk',
      units: 'metric',
      appid: 'test-key',
    })
  })

  it('requests the 5 day forecast', async () => {
    const fetchMock = mockFetch(() => jsonResponse(forecastDto()))
    const result = await openWeatherApi.getForecast({ lat: 1, lon: 2, lang: 'en' })

    expect(result.list).toHaveLength(40)
    const url = new URL(String(fetchMock.mock.calls[0]?.[0]))
    expect(url.pathname).toBe('/data/2.5/forecast')
    expect(url.searchParams.get('lang')).toBe('en')
  })

  it('searches cities with a limit', async () => {
    const fetchMock = mockFetch(() => jsonResponse([GEO_KYIV]))
    await expect(openWeatherApi.searchCities('Ки', 5)).resolves.toEqual([GEO_KYIV])

    const url = new URL(String(fetchMock.mock.calls[0]?.[0]))
    expect(url.pathname).toBe('/geo/1.0/direct')
    expect(url.searchParams.get('q')).toBe('Ки')
    expect(url.searchParams.get('limit')).toBe('5')
  })

  it('reverse geocodes coordinates', async () => {
    const fetchMock = mockFetch(() => jsonResponse([GEO_KYIV]))
    await openWeatherApi.reverseGeocode(50.45, 30.52)
    expect(new URL(String(fetchMock.mock.calls[0]?.[0])).pathname).toBe('/geo/1.0/reverse')
  })
})

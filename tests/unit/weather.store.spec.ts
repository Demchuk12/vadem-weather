import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api'
import { WEATHER_CACHE_TTL_MS } from '@/constants'
import { fetchWeatherBundle } from '@/services/weather.service'
import { useWeatherStore } from '@/stores/weather.store'
import type { WeatherBundle } from '@/types'
import { deferred, KYIV } from './helpers'

vi.mock('@/services/weather.service', () => ({ fetchWeatherBundle: vi.fn() }))

const bundle = (fetchedAt = Date.now()) => ({ fetchedAt }) as WeatherBundle

describe('weather store', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(fetchWeatherBundle).mockReset()
    vi.mocked(fetchWeatherBundle).mockImplementation(async () => bundle())
  })

  afterEach(() => vi.useRealTimers())

  it('loads and stores weather for a city and language', async () => {
    const store = useWeatherStore()
    await store.load(KYIV, 'uk')

    expect(fetchWeatherBundle).toHaveBeenCalledWith(KYIV, 'uk')
    expect(store.getEntry(KYIV.id, 'uk')).toMatchObject({ status: 'success', error: null })
    expect(store.getEntry(KYIV.id, 'en')).toBeUndefined()
  })

  it('marks the entry as loading while the request is running', () => {
    vi.mocked(fetchWeatherBundle).mockReturnValue(deferred<WeatherBundle>().promise)
    const store = useWeatherStore()
    store.load(KYIV, 'uk')
    expect(store.getEntry(KYIV.id, 'uk')?.status).toBe('loading')
  })

  it('serves fresh data from the cache', async () => {
    const store = useWeatherStore()
    await store.load(KYIV, 'uk')
    await store.load(KYIV, 'uk')
    expect(fetchWeatherBundle).toHaveBeenCalledTimes(1)
  })

  it('refetches after the cache expires or when forced', async () => {
    const store = useWeatherStore()
    await store.load(KYIV, 'uk')
    await store.load(KYIV, 'uk', { force: true })
    vi.advanceTimersByTime(WEATHER_CACHE_TTL_MS + 1)
    await store.load(KYIV, 'uk')
    expect(fetchWeatherBundle).toHaveBeenCalledTimes(3)
  })

  it('shares one request between simultaneous callers', async () => {
    const request = deferred<WeatherBundle>()
    vi.mocked(fetchWeatherBundle).mockReturnValue(request.promise)
    const store = useWeatherStore()

    const first = store.load(KYIV, 'uk')
    const second = store.load(KYIV, 'uk', { force: true })
    request.resolve(bundle())
    await Promise.all([first, second])

    expect(fetchWeatherBundle).toHaveBeenCalledTimes(1)
  })

  it('stores the API error code and keeps the previous data', async () => {
    const store = useWeatherStore()
    const previous = bundle()
    vi.mocked(fetchWeatherBundle).mockResolvedValueOnce(previous)
    await store.load(KYIV, 'uk')

    vi.mocked(fetchWeatherBundle).mockRejectedValueOnce(
      new ApiError('rate_limit', 'slow down', 429),
    )
    await store.load(KYIV, 'uk', { force: true })

    expect(store.getEntry(KYIV.id, 'uk')).toEqual({
      status: 'error',
      data: previous,
      error: 'rate_limit',
    })
  })

  it('treats unknown failures as network errors', async () => {
    vi.mocked(fetchWeatherBundle).mockRejectedValueOnce(new Error('???'))
    const store = useWeatherStore()
    await store.load(KYIV, 'uk')
    expect(store.getEntry(KYIV.id, 'uk')?.error).toBe('network')
  })
})

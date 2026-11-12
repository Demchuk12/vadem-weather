import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ApiError, type ApiErrorCode } from '@/api'
import { WEATHER_CACHE_TTL_MS } from '@/constants'
import { fetchWeatherBundle } from '@/services/weather.service'
import type { AsyncState, City, Locale, WeatherBundle } from '@/types'

export type WeatherEntry = AsyncState<WeatherBundle, ApiErrorCode>

const cacheKey = (cityId: string, lang: Locale) => `${cityId}|${lang}`

export const useWeatherStore = defineStore('weather', () => {
  const entries = ref<Record<string, WeatherEntry>>({})
  const pending = new Map<string, Promise<void>>()

  function getEntry(cityId: string, lang: Locale): WeatherEntry | undefined {
    return entries.value[cacheKey(cityId, lang)]
  }

  function isFresh(entry: WeatherEntry | undefined): boolean {
    return (
      entry?.status === 'success' &&
      !!entry.data &&
      Date.now() - entry.data.fetchedAt < WEATHER_CACHE_TTL_MS
    )
  }

  function load(city: City, lang: Locale, { force = false } = {}): Promise<void> {
    const key = cacheKey(city.id, lang)
    const previous = entries.value[key]
    if (!force && isFresh(previous)) return Promise.resolve()

    const running = pending.get(key)
    if (running) return running

    entries.value[key] = { status: 'loading', data: previous?.data ?? null, error: null }

    const request = fetchWeatherBundle(city, lang)
      .then((data) => {
        entries.value[key] = { status: 'success', data, error: null }
      })
      .catch((error: unknown) => {
        entries.value[key] = {
          status: 'error',
          data: previous?.data ?? null,
          error: error instanceof ApiError ? error.code : 'network',
        }
      })
      .finally(() => pending.delete(key))

    pending.set(key, request)
    return request
  }

  return { entries, getEntry, load }
})

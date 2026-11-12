import { OWM_BASE_URL } from '@/constants'
import type { Locale } from '@/types'
import type {
  OwmCurrentWeatherDto,
  OwmForecastDto,
  OwmGeoLocationDto,
} from '@/types/openweather.dto'
import { ApiError, buildUrl, getJson, type QueryParams } from './http'

const API_KEY = import.meta.env.VITE_OWM_API_KEY

function owmUrl(path: string, params: QueryParams): string {
  if (!API_KEY) {
    throw new ApiError('unauthorized', 'VITE_OWM_API_KEY is not set')
  }
  return buildUrl(`${OWM_BASE_URL}${path}`, { ...params, appid: API_KEY })
}

interface CoordsRequest {
  lat: number
  lon: number
  lang: Locale
  signal?: AbortSignal
}

export const openWeatherApi = {
  getCurrentWeather({ lat, lon, lang, signal }: CoordsRequest) {
    return getJson<OwmCurrentWeatherDto>(
      owmUrl('/data/2.5/weather', { lat, lon, lang, units: 'metric' }),
      { signal },
    )
  },

  getForecast({ lat, lon, lang, signal }: CoordsRequest) {
    return getJson<OwmForecastDto>(
      owmUrl('/data/2.5/forecast', { lat, lon, lang, units: 'metric' }),
      { signal },
    )
  },

  searchCities(query: string, limit: number, signal?: AbortSignal) {
    return getJson<OwmGeoLocationDto[]>(owmUrl('/geo/1.0/direct', { q: query, limit }), {
      signal,
    })
  },

  reverseGeocode(lat: number, lon: number, signal?: AbortSignal) {
    return getJson<OwmGeoLocationDto[]>(owmUrl('/geo/1.0/reverse', { lat, lon, limit: 1 }), {
      signal,
    })
  },
}

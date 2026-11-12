import { openWeatherApi } from '@/api'
import { FORECAST_DAYS, HOURLY_SAMPLES } from '@/constants'
import type { City, Locale, WeatherBundle } from '@/types'
import { aggregateDaily, currentAsHourly, mapCurrent, mapHourly } from '@/utils/forecast'

export async function fetchWeatherBundle(
  city: Pick<City, 'lat' | 'lon'>,
  lang: Locale,
  signal?: AbortSignal,
): Promise<WeatherBundle> {
  const params = { lat: city.lat, lon: city.lon, lang, signal }
  const [currentDto, forecastDto] = await Promise.all([
    openWeatherApi.getCurrentWeather(params),
    openWeatherApi.getForecast(params),
  ])

  const timezone = forecastDto.city.timezone
  const current = mapCurrent(currentDto)
  const samples = forecastDto.list.map(mapHourly)
  const upcoming = samples.filter((sample) => sample.dt > current.dt)

  return {
    current,
    hourly: [
      currentAsHourly(current, upcoming[0]?.pop ?? 0),
      ...upcoming.slice(0, HOURLY_SAMPLES - 1),
    ],
    daily: aggregateDaily(samples, timezone, FORECAST_DAYS),
    timezone,
    fetchedAt: Date.now(),
  }
}

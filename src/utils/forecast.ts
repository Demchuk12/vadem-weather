import type {
  ConditionGroup,
  CurrentWeather,
  DailyForecast,
  DayPeriod,
  HourlyForecast,
  PeriodStats,
  WeatherCondition,
} from '@/types'
import { LOCAL_NOON_HOUR } from '@/constants'
import type { OwmCurrentWeatherDto, OwmForecastItemDto } from '@/types/openweather.dto'
import { periodFromIcon, severity, toCondition } from './condition'
import { average, round } from './format'
import { cityDateKey, cityHour } from './time'

export function mapCurrent(dto: OwmCurrentWeatherDto): CurrentWeather {
  const weather = dto.weather[0]
  return {
    dt: dto.dt,
    temp: dto.main.temp,
    feelsLike: dto.main.feels_like,
    tempMin: dto.main.temp_min,
    tempMax: dto.main.temp_max,
    humidity: dto.main.humidity,
    pressure: dto.main.pressure,
    windSpeed: dto.wind.speed,
    windDeg: dto.wind.deg,
    visibility: dto.visibility ?? null,
    condition: toCondition(weather),
    period: periodFromIcon(weather?.icon),
    sunrise: dto.sys.sunrise,
    sunset: dto.sys.sunset,
  }
}

export function currentAsHourly(current: CurrentWeather, pop: number): HourlyForecast {
  return {
    dt: current.dt,
    temp: current.temp,
    feelsLike: current.feelsLike,
    pop,
    condition: current.condition,
    period: current.period,
  }
}

export function mapHourly(dto: OwmForecastItemDto): HourlyForecast {
  return {
    dt: dto.dt,
    temp: dto.main.temp,
    feelsLike: dto.main.feels_like,
    pop: dto.pop,
    condition: toCondition(dto.weather[0]),
    period: dto.sys.pod === 'n' ? 'night' : 'day',
  }
}

export function dominantCondition(samples: readonly HourlyForecast[]): WeatherCondition {
  const counts = new Map<ConditionGroup, { count: number; sample: WeatherCondition }>()
  for (const { condition } of samples) {
    const entry = counts.get(condition.group)
    if (entry) entry.count++
    else counts.set(condition.group, { count: 1, sample: condition })
  }

  let best: { count: number; sample: WeatherCondition } | undefined
  for (const entry of counts.values()) {
    const isMoreFrequent = !best || entry.count > best.count
    const isHeavierTie =
      !!best &&
      entry.count === best.count &&
      severity(entry.sample.group) > severity(best.sample.group)
    if (isMoreFrequent || isHeavierTie) best = entry
  }
  return best?.sample ?? toCondition(undefined)
}

export function periodStats(samples: readonly HourlyForecast[]): PeriodStats | null {
  if (samples.length === 0) return null
  const temps = samples.map((s) => s.temp)
  return {
    tempAvg: round(average(temps)),
    tempMin: Math.min(...temps),
    tempMax: Math.max(...temps),
    condition: dominantCondition(samples),
  }
}

export function filterByPeriod(samples: readonly HourlyForecast[], period: DayPeriod) {
  return samples.filter((s) => s.period === period)
}

export function aggregateDaily(
  samples: readonly HourlyForecast[],
  tzOffsetSeconds: number,
  days: number,
): DailyForecast[] {
  const groups = new Map<string, HourlyForecast[]>()
  for (const sample of samples) {
    const key = cityDateKey(sample.dt, tzOffsetSeconds)
    const group = groups.get(key)
    if (group) group.push(sample)
    else groups.set(key, [sample])
  }

  return [...groups.entries()].slice(0, days).map(([date, items]) => {
    const temps = items.map((i) => i.temp)
    const daySamples = filterByPeriod(items, 'day')
    const representative = items.reduce((best, item) =>
      Math.abs(cityHour(item.dt, tzOffsetSeconds) - LOCAL_NOON_HOUR) <
      Math.abs(cityHour(best.dt, tzOffsetSeconds) - LOCAL_NOON_HOUR)
        ? item
        : best,
    )
    return {
      date,
      dt: representative.dt,
      tempAvg: round(average(temps)),
      tempMin: Math.min(...temps),
      tempMax: Math.max(...temps),
      pop: Math.max(...items.map((i) => i.pop)),
      condition: dominantCondition(daySamples.length ? daySamples : items),
      day: periodStats(daySamples),
      night: periodStats(filterByPeriod(items, 'night')),
      samples: items.length,
    }
  })
}
